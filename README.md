# 🎮 Hello FHEVM: 机密数字游戏

> **Zama Bounty Program Season 10 参赛作品**

一个完全隐私保护的数字猜测游戏，使用FHEVM（全同态加密虚拟机）构建。这是为Web3开发者设计的"Hello World"级别的FHEVM教程，帮助新开发者快速上手机密区块链游戏应用开发。

## ✨ 特性

- 🔐 **完全隐私保护** - 个人猜测永远保密
- 🧮 **加密比较** - 智能合约在加密状态下比较猜测
- 🎯 **简单易用** - 适合FHEVM初学者
- 📱 **现代UI** - 响应式设计，用户体验友好
- 🚀 **完整示例** - 从合约到前端的完整dApp
- 👥 **多角色支持** - 游戏管理员和玩家功能

## 🎯 应用场景

用户可以参与机密数字游戏：
- 🎮 **游戏管理员** - 设置秘密数字和管理游戏
- 🎯 **玩家** - 提交加密猜测
- 📊 **结果查看** - 查看最终游戏结果

游戏过程完全加密，只有最终的游戏结果会被公开显示。

## 🛠️ 技术栈

- **智能合约**: Solidity + FHEVM
- **前端框架**: Next.js 14 + React 18
- **加密库**: fhevmjs
- **钱包集成**: MetaMask
- **开发工具**: Hardhat
- **测试网络**: Zama Testnet

## 🚀 快速开始

### 前置要求

- Node.js 18+
- npm 或 yarn
- MetaMask钱包
- 基本的Solidity和React知识

### 安装步骤

1. **克隆项目**
```bash
git clone <your-repo-url>
cd hello-fhevm-game
```

2. **安装依赖**
```bash
npm install
```

3. **配置环境变量**
```bash
cp env.example .env
# 编辑 .env 文件，添加你的私钥
```

4. **编译智能合约**
```bash
npx hardhat compile
```

5. **部署合约**
```bash
npx hardhat run scripts/deploy.js --network zama-testnet
```

6. **更新合约地址**
将部署得到的合约地址更新到 `pages/index.tsx` 中的 `CONTRACT_ADDRESS`

7. **启动前端**
```bash
npm run dev
```

8. **访问应用**
打开浏览器访问 `http://localhost:3000`

## 📖 详细教程

查看 [TUTORIAL.md](./TUTORIAL.md) 获取完整的步骤指导，包括：
- FHEVM基础概念解释
- 代码详细解析
- 常见问题解答
- 高级功能扩展

## 🔐 隐私保护原理

### 传统游戏 vs FHEVM游戏

**传统区块链游戏**：
```
玩家猜测 → 明文存储 → 公开可见 ❌
```

**FHEVM游戏**：
```
玩家猜测 → 加密存储 → 加密比较 → 解密结果 ✅
```

### 加密工作流程

1. **输入加密** - 玩家猜测在客户端被fhevmjs加密
2. **传输加密** - 加密数据通过区块链安全传输
3. **计算加密** - 智能合约使用TFHE库在加密状态下比较猜测
4. **输出解密** - 只有最终的游戏结果被解密并显示

## 📁 项目结构

```
hello-fhevm-game/
├── contracts/           # 智能合约
│   └── PrivateNumberGame.sol
├── pages/              # Next.js页面
│   └── index.tsx       # 主应用页面
├── scripts/            # 部署脚本
│   └── deploy.js
├── public/             # 静态资源
├── hardhat.config.js   # Hardhat配置
├── package.json        # 项目依赖
├── TUTORIAL.md         # 详细教程
└── README.md          # 项目说明
```

## 🧪 测试指南

### 基本功能测试

1. **连接钱包**
   - 确保MetaMask连接到Zama Testnet (Chain ID: 8009)
   - 获取测试代币用于交易

2. **游戏管理员功能测试**
   - 作为合约部署者开始游戏
   - 设置秘密数字
   - 监控游戏状态
   - 结束游戏

3. **玩家功能测试**
   - 使用不同钱包作为玩家
   - 提交加密猜测
   - 验证猜测保护机制
   - 查看游戏结果

### 高级测试场景

- 多玩家同时猜测
- 游戏时间管理
- 猜测比较逻辑
- 权限控制测试

## 🚨 故障排除

### 常见问题

**Q: 交易失败怎么办？**
A: 检查网络连接、测试代币余额、合约地址是否正确

**Q: 解密结果错误？**
A: 确保FHEVM实例正确初始化，检查网络稳定性

**Q: 如何获取测试代币？**
A: 访问Zama测试网水龙头获取免费测试代币

### 调试技巧

- 使用浏览器开发者工具查看控制台错误
- 检查MetaMask网络设置
- 验证合约部署状态
- 查看Hardhat日志输出

## 🎓 学习目标

完成这个教程后，你将掌握：

- ✅ FHEVM基础概念和原理
- ✅ 加密数据类型和操作
- ✅ FHEVM智能合约开发
- ✅ fhevmjs前端集成
- ✅ 完整dApp开发流程
- ✅ 隐私保护应用设计
- ✅ 多角色应用开发
- ✅ 游戏应用开发

## 🚀 扩展想法

基于这个基础，你可以尝试构建：

- 🎮 **复杂游戏机制** - 多轮游戏、积分系统
- 🏆 **游戏排行榜** - 隐私保护的排名系统
- 💰 **游戏代币** - 加密的游戏经济
- 🔐 **身份验证系统** - 零知识身份证明
- 🎯 **策略游戏** - 加密的游戏策略

## 📚 相关资源

- [FHEVM官方文档](https://docs.zama.ai/fhevm)
- [Zama开发者社区](https://discord.gg/zama)
- [全同态加密原理](https://en.wikipedia.org/wiki/Homomorphic_encryption)
- [区块链隐私技术](https://zama.ai/blog)
- [Zama Bounty Program](https://www.zama.ai/post/zama-bounty-program-season-10-create-a-hello-fhevm-tutorial)

## 🤝 贡献

欢迎提交Issue和Pull Request来改进这个项目！

### 贡献指南

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 🏆 关于Zama Bounty Program

这个项目是为 [Zama Bounty Program Season 10](https://www.zama.ai/post/zama-bounty-program-season-10-create-a-hello-fhevm-tutorial) 创建的参赛作品。

**挑战目标**: 创建最友好的"Hello FHEVM"教程，帮助新开发者构建他们的第一个机密应用。

**奖励池**: $10,000
- 🥇 第一名: $5,000
- 🥈 第二名: $3,000  
- 🥉 第三名: $2,000

---

**开始你的FHEVM游戏之旅吧！** 🚀

在Web3的世界里，隐私不是可选的，而是必需的。FHEVM为我们提供了实现真正隐私的工具，让我们用它来构建更好的互联网！
