import { useState, useEffect } from 'react'

// Types
interface DepositScenario {
  id: string
  name: string
  chain: string
  type: string
  description: string
  code: string
  config: Record<string, any>
}

// Chain configurations
const CHAINS = {
  ethereum: { name: 'Ethereum', icon: '⟳', color: '#627EEA' },
  bsc: { name: 'BNB Chain', icon: '🔶', color: '#F3BA2F' },
  polygon: { name: 'Polygon', icon: '🔴', color: '#8247E5' },
  base: { name: 'Base', icon: '🔵', color: '#0052FF' },
  cosmos: { name: 'Cosmos', icon: '⚛️', color: '#2E3148' },
  solana: { name: 'Solana', icon: '◎', color: '#9945FF' },
  tron: { name: 'Tron', icon: '🔱', color: '#FF0013' },
}

// Deposit types
const DEPOSIT_TYPES = {
  contract: { name: '合约入金', icon: '📜', description: '通过智能合约调用完成充值' },
  fake: { name: '假入金', icon: '🎭', description: '模拟充值用于测试' },
  bridge: { name: '跨链入金', icon: '🌉', description: '跨链桥充值场景' },
  wallet: { name: '钱包入金', icon: '💳', description: '钱包地址充值' },
  exception: { name: '异常场景', icon: '⚠️', description: '超时/失败/重入等异常' },
}

// Scene templates
const SCENE_TEMPLATES: Record<string, DepositScenario> = {
  eth_contract_deposit: {
    id: 'eth_contract_deposit',
    name: '以太坊合约入金',
    chain: 'ethereum',
    type: 'contract',
    description: '构造一个标准的以太坊智能合约充值场景',
    code: `// 以太坊合约入金场景
const { ethers } = require('ethers');

async function ethContractDeposit() {
  const provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
  
  // 合约ABI
  const abi = [
    'function deposit(uint256 amount) payable',
    'function getBalance() view returns (uint256)'
  ];
  
  const contractAddress = '0x...'; // 充值合约地址
  const contract = new ethers.Contract(contractAddress, abi, wallet);
  
  const tx = await contract.deposit(ethers.parseEther('1.0'), { value: ethers.parseEther('1.0') });
  console.log('交易哈希:', tx.hash);
  await tx.wait();
  console.log('充值成功!');
}

ethContractDeposit();`,
    config: { amount: '1.0', gasLimit: 21000 }
  },
  cosmos_fake_deposit: {
    id: 'cosmos_fake_deposit',
    name: 'Cosmos假入金',
    chain: 'cosmos',
    type: 'fake',
    description: '模拟Cosmos链上的假充值用于测试',
    code: `// Cosmos 假入金场景
const { SigningCosmosClient, Coin } = require('@cosmjs/launchpad');

async function cosmosFakeDeposit() {
  // 模拟充值交易
  const mockTxHash = 'mock_' + Date.now();
  const mockAmount = '1000';
  const mockDenom = 'uatom';
  
  console.log('=== Cosmos 假入金场景 ===');
  console.log('模拟交易哈希:', mockTxHash);
  console.log('模拟金额:', mockAmount, mockDenom);
  console.log('模拟时间:', new Date().toISOString());
  
  // 验证逻辑
  const isValid = verifyMockDeposit(mockTxHash, mockAmount, mockDenom);
  console.log('验证结果:', isValid ? '通过 ✓' : '失败 ✗');
  
  return { txHash: mockTxHash, amount: mockAmount, denom: mockDenom, valid: isValid };
}

function verifyMockDeposit(txHash, amount, denom) {
  // 假验证逻辑
  return amount === '1000' && denom === 'uatom';
}

cosmosFakeDeposit();`,
    config: { amount: '1000', denom: 'uatom', mock: true }
  },
  polygon_exception: {
    id: 'polygon_exception',
    name: 'Polygon异常场景',
    chain: 'polygon',
    type: 'exception',
    description: '构造Polygon链上的各种异常充值场景',
    code: `// Polygon 异常场景构造器
const Web3 = require('web3');
const web3 = new Web3('https://polygon-rpc.com');

async function polygonExceptionScenarios() {
  const scenarios = [
    {
      name: '交易超时',
      simulate: async () => {
        console.log('场景1: 交易超时');
        const tx = { hash: '0x...', status: 'pending' };
        // 模拟超时
        await new Promise(r => setTimeout(r, 100));
        return { ...tx, status: 'timeout' };
      }
    },
    {
      name: ' Gas不足',
      simulate: async () => {
        console.log('场景2: Gas不足');
        try {
          await web3.eth.sendTransaction({
            from: '0x...',
            to: '0x...',
            gas: 21000, // 刚好不够
            value: web3.utils.toWei('1')
          });
        } catch (e) {
          return { error: 'insufficient gas', message: e.message };
        }
      }
    },
    {
      name: '重入攻击',
      simulate: async () => {
        console.log('场景3: 重入攻击模拟');
        const maliciousCode = \`
          // 重入漏洞演示
          function withdraw() {
            require(balances[msg.sender] >= amount);
            (bool success, ) = msg.sender.call{value: amount}("");
            require(success);
            balances[msg.sender] -= amount; // vulnerable!
          }
        \`;
        return { vulnerable: true, code: maliciousCode };
      }
    }
  ];
  
  for (const scenario of scenarios) {
    console.log('\\n---', scenario.name, '---');
    const result = await scenario.simulate();
    console.log('结果:', JSON.stringify(result, null, 2));
  }
}

polygonExceptionScenarios();`,
    config: { scenarios: ['timeout', 'gas', 'reentrancy'] }
  },
  base_bridge_deposit: {
    id: 'base_bridge_deposit',
    name: 'Base跨链入金',
    chain: 'base',
    type: 'bridge',
    description: '构造Base跨链桥充值场景',
    code: `// Base 跨链入金场景
const { ethers } = require('ethers');

async function baseBridgeDeposit() {
  const l1Provider = new ethers.JsonRpcProvider('https://eth.llamarpc.com');
  const l2Provider = new ethers.JsonRpcProvider('https://mainnet.base.org');
  
  const l1Wallet = new ethers.Wallet(process.env.L1_PRIVATE_KEY, l1Provider);
  const l2Wallet = new ethers.Wallet(process.env.L2_PRIVATE_KEY, l2Provider);
  
  // L1 Bridge合约
  const bridgeAddress = '0x3154Cf16cc5444Ec74af1D4D3FF54e47e9aD8C8'; // Base Bridge
  const bridgeABI = [
    'function depositETH(uint32 _gasLimit, bytes calldata _data) payable',
    'event ETHDepositInitiated(address indexed from, address indexed to, uint256 amount, bytes data)'
  ];
  
  const l1Bridge = new ethers.Contract(bridgeAddress, bridgeABI, l1Wallet);
  
  const amount = ethers.parseEther('0.01');
  const gasLimit = 200000;
  
  console.log('开始跨链充值...');
  console.log('金额:', ethers.formatEther(amount), 'ETH');
  console.log('Gas Limit:', gasLimit);
  
  const tx = await l1Bridge.depositETH(gasLimit, '0x', { value: amount });
  console.log('L1交易哈希:', tx.hash);
  
  const receipt = await tx.wait();
  console.log('L1确认块:', receipt.blockNumber);
  
  // 监听L2接收事件
  console.log('等待跨链完成...');
  // 通常需要7天挑战期，这里模拟
  console.log('跨链充值完成! L2地址:', l2Wallet.address);
  
  return {
    l1TxHash: tx.hash,
    amount: amount.toString(),
    status: 'completed'
  };
}

baseBridgeDeposit();`,
    config: { amount: '0.01', gasLimit: 200000, bridgeType: 'standard' }
  }
}

// AI Assistant Component
function AIAssistant({ onGenerate }: { onGenerate: (scenario: DepositScenario) => void }) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState('')
  const [chatHistory, setChatHistory] = useState<{role: string, content: string}[]>([])
  const [isTyping, setIsTyping] = useState(false)

  const handleSend = async () => {
    if (!message.trim()) return
    
    const userMsg = message
    setChatHistory(prev => [...prev, { role: 'user', content: userMsg }])
    setMessage('')
    setIsTyping(true)
    
    // Simulate AI response
    setTimeout(() => {
      const response = generateResponse(userMsg)
      setChatHistory(prev => [...prev, { role: 'assistant', content: response }])
      setIsTyping(false)
    }, 1500)
  }

  const generateResponse = (input: string): string => {
    const lower = input.toLowerCase()
    
    if (lower.includes('以太坊') || lower.includes('eth')) {
      if (lower.includes('合约') || lower.includes('contract')) {
        return '好的！我为你构造以太坊合约入金场景...'
      }
      return '好的！以太坊入金场景准备中...'
    }
    if (lower.includes('cosmos') || lower.includes('原子') || lower.includes('atom')) {
      return '好的！Cosmos 假入金场景构造中...'
    }
    if (lower.includes('异常') || lower.includes('exception') || lower.includes('超时')) {
      return '好的！异常场景构造中...'
    }
    if (lower.includes('跨链') || lower.includes('bridge')) {
      return '好的！跨链入金场景准备中...'
    }
    if (lower.includes('假') || lower.includes('mock') || lower.includes('fake')) {
      return '好的！假入金测试场景构造中...'
    }
    if (lower.includes('polygon') || lower.includes('matic')) {
      return '好的！Polygon 场景构造中...'
    }
    if (lower.includes('base')) {
      return '好的！Base 链场景构造中...'
    }
    
    return '明白了！根据你的需求构造入金场景...'
  }

  const handleScenarioGenerate = (scenarioKey: string) => {
    const scenario = SCENE_TEMPLATES[scenarioKey]
    if (scenario) {
      onGenerate(scenario)
    }
  }

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed top-20 right-6 w-14 h-14 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-50 animate-pulse-glow"
      >
        <span className="text-2xl">🤖</span>
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed top-36 right-6 w-96 max-h-[500px] glass-card flex flex-col z-50">
          <div className="p-4 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xl">🧠</span>
              <span className="font-semibold">AI 入金构造助手</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/60 hover:text-white">✕</button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-80">
            {chatHistory.length === 0 && (
              <div className="text-center text-white/60 py-8">
                <p className="text-4xl mb-4">👋</p>
                <p>告诉我你想要什么入金场景</p>
                <p className="text-sm mt-2">例如："构造一个以太坊合约入金"</p>
              </div>
            )}
            
            {chatHistory.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] p-3 rounded-lg ${
                  msg.role === 'user' 
                    ? 'bg-gradient-to-r from-primary to-secondary text-white' 
                    : 'bg-white/10'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white/10 p-3 rounded-lg">
                  <span className="typing-dot">●</span>
                  <span className="typing-dot">●</span>
                  <span className="typing-dot">●</span>
                </div>
              </div>
            )}
          </div>
          
          <div className="p-4 border-t border-white/10">
            <div className="flex gap-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder="描述你想要的入金场景..."
                className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary"
              />
              <button
                onClick={handleSend}
                className="bg-gradient-to-r from-primary to-secondary px-4 py-2 rounded-lg font-medium hover:opacity-90"
              >
                发送
              </button>
            </div>
            
            {/* Quick actions */}
            <div className="flex flex-wrap gap-2 mt-3">
              {['以太坊合约', 'Cosmos假入金', '异常场景', '跨链入金'].map((action) => (
                <button
                  key={action}
                  onClick={() => setMessage(action)}
                  className="text-xs bg-white/5 px-3 py-1 rounded-full hover:bg-white/10 transition-colors"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Code Display Component
function CodeDisplay({ scenario, onClose }: { scenario: DepositScenario | null, onClose: () => void }) {
  if (!scenario) return null
  
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-8">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold gradient-text">{scenario.name}</h3>
            <p className="text-sm text-white/60 mt-1">{scenario.description}</p>
          </div>
          <button onClick={onClose} className="text-2xl text-white/60 hover:text-white">✕</button>
        </div>
        
        <div className="flex-1 overflow-auto p-4">
          <pre className="bg-black/50 rounded-lg p-4 text-sm font-mono overflow-x-auto">
            <code className="text-green-400">{scenario.code}</code>
          </pre>
        </div>
        
        <div className="p-4 border-t border-white/10 flex gap-3">
          <button className="flex-1 bg-gradient-to-r from-primary to-secondary py-3 rounded-lg font-medium hover:opacity-90 transition-opacity">
            📋 复制代码
          </button>
          <button className="flex-1 bg-white/10 py-3 rounded-lg font-medium hover:bg-white/20 transition-colors">
            ⚡ 执行场景
          </button>
        </div>
      </div>
    </div>
  )
}

// Main App
function App() {
  const [selectedChain, setSelectedChain] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [selectedScenario, setSelectedScenario] = useState<DepositScenario | null>(null)

  const handleGenerate = (scenario: DepositScenario) => {
    setSelectedScenario(scenario)
  }

  return (
    <div className="min-h-screen">
      {/* Background Effects */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/30 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/30 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center text-xl">
              ⛓️
            </div>
            <div>
              <h1 className="text-xl font-bold gradient-text">区块链入金场景构造器</h1>
              <p className="text-xs text-white/60">Blockchain Deposit Scene Generator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <a href="https://github.com/gaojianshuai/blockchain-deposit-generator" target="_blank" className="text-white/60 hover:text-white transition-colors">
              📂 GitHub
            </a>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-12 px-6 max-w-7xl mx-auto">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold mb-6">
            <span className="gradient-text">一句话构造</span>
            <br />
            <span className="text-white">任何区块链入金场景</span>
          </h2>
          <p className="text-xl text-white/60 max-w-2xl mx-auto">
            告别繁琐的代码编写，只需描述你的需求，AI 助手帮你构造完整的入金场景代码
          </p>
        </div>

        {/* Chain Selection */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>⛓️</span> 选择区块链
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {Object.entries(CHAINS).map(([key, chain]) => (
              <button
                key={key}
                onClick={() => setSelectedChain(selectedChain === key ? null : key)}
                className={`glass-card p-6 text-center hover:border-primary transition-all hover:-translate-y-1 ${
                  selectedChain === key ? 'border-primary shadow-lg shadow-primary/30' : ''
                }`}
              >
                <div className="text-4xl mb-2">{chain.icon}</div>
                <div className="font-medium">{chain.name}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Deposit Type Selection */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>💰</span> 选择入金类型
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {Object.entries(DEPOSIT_TYPES).map(([key, type]) => (
              <button
                key={key}
                onClick={() => setSelectedType(selectedType === key ? null : key)}
                className={`glass-card p-6 text-left hover:border-primary transition-all ${
                  selectedType === key ? 'border-primary shadow-lg shadow-primary/30' : ''
                }`}
              >
                <div className="text-3xl mb-3">{type.icon}</div>
                <div className="font-bold mb-1">{type.name}</div>
                <div className="text-sm text-white/60">{type.description}</div>
              </button>
            ))}
          </div>
        </section>

        {/* Scene Templates */}
        <section>
          <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
            <span>🎯</span> 预设场景模板
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.values(SCENE_TEMPLATES).map((scene) => (
              <button
                key={scene.id}
                onClick={() => setSelectedScenario(scene)}
                className="glass-card p-6 text-left hover:border-primary transition-all group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                      style={{ backgroundColor: CHAINS[scene.chain as keyof typeof CHAINS]?.color + '30' }}
                    >
                      {CHAINS[scene.chain as keyof typeof CHAINS]?.icon}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg group-hover:text-primary transition-colors">{scene.name}</h4>
                      <p className="text-sm text-white/60">{CHAINS[scene.chain as keyof typeof CHAINS]?.name} · {DEPOSIT_TYPES[scene.type as keyof typeof DEPOSIT_TYPES]?.name}</p>
                    </div>
                  </div>
                  <span className="text-2xl opacity-0 group-hover:opacity-100 transition-opacity">→</span>
                </div>
                <p className="text-white/60 text-sm">{scene.description}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Features Grid */}
        <section className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-8 text-center">
            <div className="text-5xl mb-4">🚀</div>
            <h4 className="text-xl font-bold mb-2">快速生成</h4>
            <p className="text-white/60">一句话描述，秒级生成完整的入金场景代码</p>
          </div>
          <div className="glass-card p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h4 className="text-xl font-bold mb-2">安全可靠</h4>
            <p className="text-white/60">所有代码开源可审计，支持本地执行</p>
          </div>
          <div className="glass-card p-8 text-center">
            <div className="text-5xl mb-4">🌐</div>
            <h4 className="text-xl font-bold mb-2">多链支持</h4>
            <p className="text-white/60">覆盖主流区块链网络，一站式构造</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-8 text-center text-white/40">
        <p>Built with ❤️ by AI Nexus Team</p>
      </footer>

      {/* AI Assistant */}
      <AIAssistant onGenerate={handleGenerate} />

      {/* Code Display Modal */}
      <CodeDisplay scenario={selectedScenario} onClose={() => setSelectedScenario(null)} />

      <style>{`
        .typing-dot {
          animation: typing 1.4s infinite;
          margin: 0 2px;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing {
          0%, 60%, 100% { opacity: 0.3; }
          30% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}

export default App
