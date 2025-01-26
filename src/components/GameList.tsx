import React from 'react';
import { ArrowRight } from 'lucide-react';
import { ethers } from 'ethers';
import { PVP_FLIP_GAME_ABI } from '../contracts/PvpFlipGame';
import { CONTRACT_ADDRESS } from '../contracts/config';

interface GameListProps {
  activeTab: 'open' | 'history';
}

const GameList: React.FC<GameListProps> = ({ activeTab }) => {
  const handleJoinGame = async (gameId: number, betAmount: string) => {
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask!');
        return;
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(CONTRACT_ADDRESS, PVP_FLIP_GAME_ABI, signer);

      // Convert bet amount to wei
      const betAmountWei = ethers.parseEther(betAmount);

      // Join game transaction
      const tx = await contract.joinGame(gameId, betAmountWei);
      await tx.wait();

      alert('Successfully joined the game!');
    } catch (error) {
      console.error('Error joining game:', error);
      alert('Error joining game. Please try again.');
    }
  };

  // Mock data - in a real implementation, this would come from the smart contract
  const openGames = [
    { id: 1, player: '0x1234...5678', amount: '0.1 ETH', token: 'ETH' },
    { id: 2, player: '0x8765...4321', amount: '100 USDC', token: 'USDC' },
  ];

  const gameHistory = [
    { id: 1, player1: '0x1234...5678', player2: '0x8765...4321', amount: '0.1 ETH', token: 'ETH', winner: '0x1234...5678' },
    { id: 2, player1: '0x9876...5432', player2: '0x2345...6789', amount: '50 USDC', token: 'USDC', winner: '0x2345...6789' },
  ];

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      {activeTab === 'open' ? (
        <>
          <h2 className="text-xl font-bold mb-4">Open Games</h2>
          <div className="space-y-4">
            {openGames.map((game) => (
              <div
                key={game.id}
                className="flex items-center justify-between bg-gray-700 p-4 rounded-lg"
              >
                <div>
                  <p className="text-sm text-gray-400">Created by</p>
                  <p className="font-medium">{game.player}</p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-gray-400">Bet Amount</p>
                  <p className="font-medium">{game.amount}</p>
                </div>
                <button 
                  onClick={() => handleJoinGame(game.id, game.amount.split(' ')[0])}
                  className="px-4 py-2 rounded-lg bg-yellow-500 text-gray-900 hover:bg-yellow-400 transition-colors flex items-center space-x-2"
                >
                  <span>Join Game</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-4">Game History</h2>
          <div className="space-y-4">
            {gameHistory.map((game) => (
              <div
                key={game.id}
                className="bg-gray-700 p-4 rounded-lg"
              >
                <div className="flex justify-between mb-2">
                  <div>
                    <p className="text-sm text-gray-400">Player 1</p>
                    <p className="font-medium">{game.player1}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-400">Bet Amount</p>
                    <p className="font-medium">{game.amount}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-400">Player 2</p>
                    <p className="font-medium">{game.player2}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-gray-600">
                  <p className="text-sm text-gray-400">Winner</p>
                  <p className="font-medium text-green-400">{game.winner}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default GameList;