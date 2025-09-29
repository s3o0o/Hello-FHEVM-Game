const { ethers } = require("hardhat");

async function main() {
  console.log("开始部署PrivateNumberGame合约...");

  // 获取合约工厂
  const PrivateNumberGame = await ethers.getContractFactory("PrivateNumberGame");
  
  // 部署合约
  const privateNumberGame = await PrivateNumberGame.deploy();
  
  // 等待部署完成
  await privateNumberGame.waitForDeployment();
  
  const contractAddress = await privateNumberGame.getAddress();
  
  console.log("✅ 合约部署成功!");
  console.log("合约地址:", contractAddress);
  console.log("网络:", network.name);
  
  // 保存部署信息
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: network.name,
    timestamp: new Date().toISOString(),
    deployer: await privateNumberGame.runner.getAddress()
  };
  
  fs.writeFileSync(
    './deployment.json', 
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("部署信息已保存到 deployment.json");
  
  // 验证合约功能
  console.log("\n🔍 验证合约功能...");
  
  const gameActive = await privateNumberGame.gameActive();
  const gameMaster = await privateNumberGame.getGameMaster();
  const gameInfo = await privateNumberGame.getGameInfo();
  
  console.log("游戏状态:", gameActive ? "活跃" : "未开始");
  console.log("游戏管理员:", gameMaster);
  console.log("游戏信息:", {
    active: gameInfo[0],
    endTime: gameInfo[1].toString(),
    timeRemaining: gameInfo[2].toString(),
    maxAttempts: gameInfo[3].toString()
  });
  
  const totalGuesses = await privateNumberGame.getTotalGuesses();
  const correctGuesses = await privateNumberGame.getCorrectGuesses();
  
  console.log("初始游戏统计:");
  console.log("- 总猜测数:", totalGuesses);
  console.log("- 正确猜测数:", correctGuesses);
  
  console.log("\n📝 下一步:");
  console.log("1. 更新前端代码中的 CONTRACT_ADDRESS");
  console.log("2. 运行 'npm run dev' 启动前端");
  console.log("3. 在浏览器中测试游戏功能");
  console.log("4. 作为游戏管理员开始游戏");
  console.log("5. 作为玩家猜测数字");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ 部署失败:", error);
    process.exit(1);
  });
