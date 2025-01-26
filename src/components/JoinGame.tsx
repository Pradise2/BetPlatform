import React, { useState, useEffect } from 'react';
import { joinGame } from '../utils/contractFunctions';
import { ethers } from 'ethers';
import { PVP_FLIP_GAME_ABI, PVP_FLIP_GAME_ADDRESS } from '../contracts/PVPFlipGameContract';
import { Coins, GamepadIcon, AlertCircle, ArrowRight } from 'lucide-react';

// Function to get game details by ID and token info
export const getGameDetails = async (gameId: number) => {
  try {
    const provider = new ethers.JsonRpcProvider('https://base-mainnet.infura.io/v3/b17a040a14bc48cfb3928a73d26f3617');
    const contract = new ethers.Contract(PVP_FLIP_GAME_ADDRESS, PVP_FLIP_GAME_ABI, provider);

    // Fetch game details
    const game = await contract.games(gameId);

    // Fetch token details
    const tokenContract = new ethers.Contract(game.tokenAddress, ["function name() view returns (string)", "function symbol() view returns (string)"], provider);
    const tokenName = await tokenContract.name();
    const tokenSymbol = await tokenContract.symbol();

    return {
      betAmount: ethers.formatUnits(game.betAmount, 18),
      tokenAddress: game.tokenAddress,
      tokenName,
      tokenSymbol,
    };
  } catch (error) {
    console.error('Error fetching game details:', error);
    return null;
  }
};

const JoinGame: React.FC = () => {
  const [gameId, setGameId] = useState<number | null>(null);
  const [betAmount, setBetAmount] = useState('');
  const [gameDetails, setGameDetails] = useState<{ betAmount: string | null, tokenName: string | null, tokenSymbol: string | null }>({
    betAmount: null,
    tokenName: null,
    tokenSymbol: null,
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchGameDetails = async () => {
      if (gameId !== null) {
        setIsLoading(true);
        const details = await getGameDetails(gameId);
        if (details) {
          setGameDetails(details);
          setBetAmount(details.betAmount); // Auto-fill bet amount
        } else {
          setError('Error fetching game details');
        }
        setIsLoading(false);
      }
    };

    fetchGameDetails();
  }, [gameId]);

  const handleJoinGame = async () => {
    if (gameId !== null && betAmount !== '') {
      try {
        setIsLoading(true);
        // Ensure the bet amount matches Player 1's bet
        if (betAmount !== gameDetails.betAmount) {
          setError('Bet amount must be equal to Player 1\'s bet');
          return;
        }

        await joinGame(gameId, betAmount);
        setError(null); // Clear error on success
      } catch (error) {
        setError('Error joining game');
      } finally {
        setIsLoading(false);
      }
    } else {
      setError('Please enter a valid game ID and bet amount');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 w-full max-w-md border border-white/20 shadow-xl">
        <div className="flex items-center gap-3 mb-8">
          <GamepadIcon className="w-8 h-8 text-purple-400" />
          <h2 className="text-2xl font-bold text-white">Join Game</h2>
        </div>

        <div className="space-y-6">
          {/* Game ID Input */}
          <div>
            <label htmlFor="gameId" className="block text-sm font-medium text-purple-300 mb-2">
              Game ID
            </label>
            <input
              id="gameId"
              type="number"
              placeholder="Enter game ID"
              value={gameId ?? ''}
              onChange={(e) => setGameId(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
            />
          </div>

          {/* Bet Amount Input */}
          <div>
            <label htmlFor="betAmount" className="block text-sm font-medium text-purple-300 mb-2">
              Bet Amount
            </label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-purple-400" />
              <input
                id="betAmount"
                type="text"
                placeholder="Enter bet amount"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/5 border border-purple-500/30 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-purple-300/50"
              />
            </div>
          </div>

          {/* Game Details Card */}
          {gameDetails.tokenName && gameDetails.tokenSymbol && (
            <div className="bg-white/5 rounded-lg p-4 border border-purple-500/30">
              <h3 className="text-sm font-medium text-purple-300 mb-2">Game Details</h3>
              <div className="flex items-center justify-between text-white">
                <span>Token:</span>
                <span className="font-medium">{gameDetails.tokenName} ({gameDetails.tokenSymbol})</span>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 text-red-400 bg-red-400/10 p-3 rounded-lg">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {/* Join Game Button */}
          <button
            onClick={handleJoinGame}
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-lg font-medium transition-all hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                Join Game
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinGame;