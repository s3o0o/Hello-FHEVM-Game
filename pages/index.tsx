import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { FhevmInstance, createInstance } from '@zama-fhe/relayer-sdk';

// 添加类型声明
declare global {
  interface Window {
    ethereum?: any;
  }
}

interface GameState {
  gameActive: boolean;
  gameEndTime: number;
  timeRemaining: number;
  maxGuesses: number;
  hasPlayed: boolean;
  totalGuesses: string;
  correctGuesses: string;
  gameMaster: string;
}

const Home: React.FC = () => {
  const [account, setAccount] = useState<string>('');
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [fhevm, setFhevm] = useState<FhevmInstance | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const [gameState, setGameState] = useState<GameState>({
    gameActive: false,
    gameEndTime: 0,
    timeRemaining: 0,
    maxGuesses: 1,
    hasPlayed: false,
    totalGuesses: '0',
    correctGuesses: '0',
    gameMaster: '',
  });
  const [guessNumber, setGuessNumber] = useState<string>('');
  const [secretNumber, setSecretNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [isGameMaster, setIsGameMaster] = useState(false);
  const [gameResult, setGameResult] = useState<string>('');

  // 合约地址和ABI (部署后需要更新)
  const CONTRACT_ADDRESS = 0xC3F7A6C5590572eCCd4C96a04956aFAf8DF9F9dd; // 部署后更新
  const CONTRACT_ABI = [
    {
      "inputs": [
        {"internalType": "bytes", "name": "encryptedSecret", "type": "bytes"},
        {"internalType": "uint256", "name": "duration", "type": "uint256"},
        {"internalType": "uint256", "name": "maxAttempts", "type": "uint256"}
      ],
      "name": "startGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "bytes", "name": "encryptedGuess", "type": "bytes"}],
      "name": "makeGuess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "endGame",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getSecretNumber",
      "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getTotalGuesses",
      "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getCorrectGuesses",
      "outputs": [{"internalType": "bytes", "name": "", "type": "bytes"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [{"internalType": "address", "name": "player", "type": "address"}],
      "name": "hasPlayerPlayed",
      "outputs": [{"internalType": "bool", "name": "", "type": "bool"}],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getGameInfo",
      "outputs": [
        {"internalType": "bool", "name": "active", "type": "bool"},
        {"internalType": "uint256", "name": "endTime", "type": "uint256"},
        {"internalType": "uint256", "name": "timeRemaining", "type": "uint256"},
        {"internalType": "uint256", "name": "maxAttempts", "type": "uint256"}
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "getGameMaster",
      "outputs": [{"internalType": "address", "name": "", "type": "address"}],
      "stateMutability": "view",
      "type": "function"
    }
  ];

  // 连接钱包
  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        const account = accounts[0];
        
        setProvider(provider);
        setAccount(account);
        
        // 初始化FHEVM
        const instance = await createInstance({ provider, chainId: 8009 });
        setFhevm(instance);
        
        // 创建合约实例
        const contractInstance = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider.getSigner());
        setContract(contractInstance);
        
        await loadGameState(contractInstance, account);
      } else {
        setError('请安装MetaMask钱包');
      }
    } catch (err) {
      setError('连接钱包失败: ' + (err as Error).message);
    }
  };

  // 加载游戏状态
  const loadGameState = async (contractInstance: ethers.Contract, userAccount: string) => {
    try {
      const [gameInfo, hasPlayed, gameMaster] = await Promise.all([
        contractInstance.getGameInfo(),
        contractInstance.hasPlayerPlayed(userAccount),
        contractInstance.getGameMaster()
      ]);

      const isGameMaster = gameMaster.toLowerCase() === userAccount.toLowerCase();
      setIsGameMaster(isGameMaster);

      setGameState(prev => ({
        ...prev,
        gameActive: gameInfo[0],
        gameEndTime: Number(gameInfo[1]),
        timeRemaining: Number(gameInfo[2]),
        maxGuesses: Number(gameInfo[3]),
        hasPlayed,
        gameMaster
      }));
    } catch (err) {
      console.error('加载游戏状态失败:', err);
    }
  };

  // 开始游戏
  const startGame = async () => {
    if (!fhevm || !contract || !isGameMaster) {
      setError('只有游戏管理员可以开始游戏');
      return;
    }

    if (!secretNumber || isNaN(Number(secretNumber)) || Number(secretNumber) < 1 || Number(secretNumber) > 100) {
      setError('请输入1-100之间的有效数字');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 加密秘密数字
      const encryptedSecret = fhevm.encrypt32(Number(secretNumber));
      
      const duration = 300; // 5分钟
      const maxAttempts = 1;
      
      const tx = await contract.startGame(encryptedSecret, duration, maxAttempts);
      await tx.wait();
      
      await loadGameState(contract, account);
      alert('游戏已开始！');
    } catch (err) {
      setError('开始游戏失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 猜测数字
  const makeGuess = async () => {
    if (!fhevm || !contract || !account) {
      setError('请先连接钱包');
      return;
    }

    if (!guessNumber || isNaN(Number(guessNumber)) || Number(guessNumber) < 1 || Number(guessNumber) > 100) {
      setError('请输入1-100之间的有效数字');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // 加密猜测数字
      const encryptedGuess = fhevm.encrypt32(Number(guessNumber));
      
      // 发送交易
      const tx = await contract.makeGuess(encryptedGuess);
      await tx.wait();
      
      // 更新状态
      setGameState(prev => ({
        ...prev,
        hasPlayed: true
      }));
      
      alert('猜测已提交！');
    } catch (err) {
      setError('猜测失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 结束游戏
  const endGame = async () => {
    if (!contract || !isGameMaster) {
      setError('只有游戏管理员可以结束游戏');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const tx = await contract.endGame();
      await tx.wait();
      
      await loadGameState(contract, account);
      alert('游戏已结束！');
    } catch (err) {
      setError('结束游戏失败: ' + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  // 解密结果
  const decryptResults = async () => {
    if (!fhevm || !contract) {
      setError('请先连接钱包');
      return;
    }

    try {
      const [secretNumberEncrypted, totalGuessesEncrypted, correctGuessesEncrypted] = await Promise.all([
        contract.getSecretNumber(),
        contract.getTotalGuesses(),
        contract.getCorrectGuesses()
      ]);

      const secretNumber = fhevm.decrypt32(secretNumberEncrypted);
      const totalGuesses = fhevm.decrypt32(totalGuessesEncrypted);
      const correctGuesses = fhevm.decrypt32(correctGuessesEncrypted);

      setGameState(prev => ({
        ...prev,
        totalGuesses: totalGuesses.toString(),
        correctGuesses: correctGuesses.toString()
      }));

      setGameResult(`秘密数字是: ${secretNumber}`);
    } catch (err) {
      setError('解密结果失败: ' + (err as Error).message);
    }
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* 标题 */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🎮 机密数字游戏
            </h1>
            <p className="text-lg text-gray-600">
              使用FHEVM构建的完全隐私保护数字猜测游戏
            </p>
          </div>

          {/* 连接钱包 */}
          {!account && (
            <div className="bg-white rounded-lg shadow-lg p-6 mb-8 text-center">
              <h2 className="text-2xl font-semibold mb-4">连接钱包开始游戏</h2>
              <button
                onClick={connectWallet}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
              >
                连接MetaMask
              </button>
            </div>
          )}

          {/* 游戏界面 */}
          {account && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* 游戏控制区域 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">游戏控制</h2>
                
                {/* 游戏状态 */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="font-semibold mb-2">游戏状态</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>状态:</span>
                      <span className={gameState.gameActive ? "text-green-600" : "text-red-600"}>
                        {gameState.gameActive ? "进行中" : "已结束"}
                      </span>
                    </div>
                    {gameState.gameActive && (
                      <div className="flex justify-between">
                        <span>剩余时间:</span>
                        <span className="font-mono">{formatTime(gameState.timeRemaining)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>你的状态:</span>
                      <span>{gameState.hasPlayed ? "已参与" : "未参与"}</span>
                    </div>
                  </div>
                </div>

                {/* 游戏管理员功能 */}
                {isGameMaster && (
                  <div className="mb-6">
                    <h3 className="font-semibold mb-3">游戏管理员功能</h3>
                    <div className="space-y-3">
                      {!gameState.gameActive ? (
                        <div>
                          <input
                            type="number"
                            placeholder="输入秘密数字 (1-100)"
                            value={secretNumber}
                            onChange={(e) => setSecretNumber(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent mb-3"
                          />
                          <button
                            onClick={startGame}
                            disabled={loading || !secretNumber}
                            className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                          >
                            {loading ? '开始中...' : '开始游戏 (5分钟)'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={endGame}
                          disabled={loading}
                          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                        >
                          {loading ? '结束中...' : '结束游戏'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* 玩家猜测功能 */}
                {gameState.gameActive && !gameState.hasPlayed && (
                  <div>
                    <h3 className="font-semibold mb-3">猜测数字</h3>
                    <div className="space-y-3">
                      <input
                        type="number"
                        placeholder="输入你的猜测 (1-100)"
                        value={guessNumber}
                        onChange={(e) => setGuessNumber(e.target.value)}
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                      <button
                        onClick={makeGuess}
                        disabled={loading || !guessNumber}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
                      >
                        {loading ? '猜测中...' : '提交猜测'}
                      </button>
                    </div>
                  </div>
                )}

                {gameState.hasPlayed && (
                  <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                    你已经参与游戏了！猜测数字已加密保护。
                  </div>
                )}
              </div>

              {/* 结果区域 */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">游戏结果</h2>
                <p className="text-sm text-gray-600 mb-4">
                  点击下方按钮解密并查看结果
                </p>
                
                <button
                  onClick={decryptResults}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-6 rounded-lg transition duration-200 mb-6"
                >
                  解密结果
                </button>

                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>🎯 总猜测数</span>
                    <span className="font-bold">{gameState.totalGuesses}</span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                    <span>✅ 正确猜测数</span>
                    <span className="font-bold">{gameState.correctGuesses}</span>
                  </div>
                  {gameResult && (
                    <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="font-semibold text-yellow-800">{gameResult}</p>
                    </div>
                  )}
                  <div className="border-t pt-3">
                    <div className="text-sm text-gray-600">
                      <p>• 所有猜测都被加密保护</p>
                      <p>• 只有最终结果会被公开</p>
                      <p>• 玩家身份完全保密</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 错误信息 */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}

          {/* 技术说明 */}
          <div className="bg-white rounded-lg shadow-lg p-6 mt-8">
            <h3 className="text-xl font-semibold mb-4">🎮 技术说明</h3>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-semibold mb-2">1. 加密猜测</h4>
                <p>你的猜测在发送到区块链之前被完全加密</p>
              </div>
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-semibold mb-2">2. 隐私比较</h4>
                <p>智能合约在加密状态下比较猜测和秘密数字</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-semibold mb-2">3. 解密结果</h4>
                <p>只有最终的游戏结果被解密并公开</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
