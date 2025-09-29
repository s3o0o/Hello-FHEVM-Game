import React, { useState } from 'react';

const Home: React.FC = () => {
  const [account, setAccount] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');

  const connectWallet = async () => {
    try {
      if (typeof (window as any).ethereum !== 'undefined') {
        const provider = (window as any).ethereum;
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);
      } else {
        setError('请安装MetaMask钱包');
      }
    } catch (err) {
      setError('连接钱包失败: ' + (err as Error).message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-100">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              🎮 机密数字游戏
            </h1>
            <p className="text-lg text-gray-600">
              使用FHEVM构建的完全隐私保护数字猜测游戏
            </p>
          </div>

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

          {account && (
            <div className="bg-white rounded-lg shadow-lg p-6 text-center">
              <h2 className="text-2xl font-semibold mb-4">游戏信息</h2>
              <p className="mb-4">这是一个FHEVM机密数字游戏演示项目</p>
              <p className="text-sm text-gray-600 mb-4">
                完整的交互式应用请查看GitHub仓库中的本地部署说明
              </p>
              <div className="space-y-2 text-left">
                <p><strong>技术栈:</strong> Solidity + FHEVM + Next.js + React</p>
                <p><strong>功能:</strong> 机密游戏、加密猜测、隐私保护</p>
                <p><strong>教程:</strong> 查看GitHub仓库中的TUTORIAL.md</p>
                <p><strong>钱包地址:</strong> {account}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
              {error}
            </div>
          )}

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
