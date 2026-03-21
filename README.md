# Blockchain Deposit Generator - 区块链入金场景构造器

一个强大的区块链入金场景构造网站，支持多种入金方式的智能生成，右上角 AI 助手可用自然语言描述需求。

## 功能特性

### 🚀 一句话构造入金场景
- 告诉 AI 你想要什么，他就能帮你构造
- 例如："构造一个以太坊合约入金场景" / "模拟一个跨链桥异常" / "创建一个假的USDT充值"

### ⛓️ 支持的链
- Ethereum (ETH)
- BNB Chain (BSC)
- Polygon (MATIC)
- Base
- Cosmos
- Solana
- Tron

### 💰 入金类型
- **合约入金**: 智能合约调用充值
- **假入金**: 模拟充值测试
- **跨链入金**: 跨链桥充值
- **异常场景**: 超时/失败/重入等
- **钱包充值**: 钱包地址充值

### 🤖 AI 助手
右上角 AI 机器人，通过自然语言描述需求，自动生成对应的入金场景代码和配置文件。

## 快速开始

### 安装依赖
```bash
npm install
```

### 运行开发服务器
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 技术栈

- **前端**: React + TypeScript + TailwindCSS
- **AI**: MiniMax API
- **区块链**: ethers.js, web3.js, cosmos-sdk
- **部署**: Vercel

## 项目结构

```
blockchain-deposit-generator/
├── src/
│   ├── components/      # React 组件
│   ├── scenes/          # 入金场景定义
│   ├── chains/          # 区块链配置
│   └── utils/           # 工具函数
├── public/
└── package.json
```

## License

MIT
