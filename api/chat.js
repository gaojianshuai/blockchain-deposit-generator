export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message, history = [] } = req.body || {};

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const apiKey = process.env.MINIMAX_API_KEY;
  
  if (!apiKey) {
    return res.status(500).json({ 
      error: 'API key not configured. Please set MINIMAX_API_KEY in Vercel environment variables.' 
    });
  }

  const systemPrompt = `你是一个专业的区块链入金场景构造助手。你的任务是：
1. 理解用户想要的区块链入金场景
2. 根据用户需求生成对应的代码和配置
3. 支持的区块链：Ethereum, BNB Chain, Polygon, Base, Cosmos, Solana, Tron
4. 支持的入金类型：合约入金、假入金、跨链入金、钱包入金、异常场景

当用户描述一个场景时，你应该：
- 识别用户想要的区块链和入金类型
- 生成对应的代码示例
- 解释代码逻辑

如果用户的需求不明确，请询问更多细节。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history.map(h => ({ role: h.role, content: h.content })),
    { role: 'user', content: message }
  ];

  try {
    const response = await fetch('https://api.minimaxi.com/anthropic/v1/messages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'MiniMax-M2.7',
        max_tokens: 2048,
        messages: messages
      })
    });

    const data = await response.json();

    if (data.error) {
      return res.status(400).json({ error: data.error.message || 'API Error' });
    }

    const reply = data.content?.[0]?.text || '抱歉，没有收到回复';
    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
