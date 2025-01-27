import React, { useEffect, useState } from 'react';
import { getGameDetailsWithoutWallet, getGameIdCounter } from '../utils/contractFunctions';
import { GamepadIcon, Loader2, Trophy, User, Coins, CheckCircle2, XCircle } from 'lucide-react';

const AllGames: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      const gameIdCounter = await getGameIdCounter();
      const gamePromises = [];
      console.log('gameICounter',gameIdCounter);
      
      if (gameIdCounter !== undefined) {
      for (let gameId = 0; gameId <= gameIdCounter; gameId++) {
        gamePromises.push(getGameDetailsWithoutWallet(gameId));
      }}

      const gameDetails = await Promise.all(gamePromises);
      setGames(gameDetails);
      setLoading(false);
    };

    fetchGames();
  }, []);

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className=" p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <GamepadIcon className="w-8 h-8 text-purple-400" />
          <h2 className="text-xl font-bold text-white">All Games</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-white">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg">Loading games...</span>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/20">
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Game ID</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Player 1</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Player 2</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Bet Amount</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Token</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-white">Winner</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {games.map((game, index) => (
                  <tr 
                    key={index}
                    className="hover:bg-white/5 transition-colors"
                  >
                    {/* Game ID */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-yellow-400" />
                        <span className="text-white font-medium">#{index + 1}</span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        game.isCompleted 
                          ? 'bg-green-500/20 text-green-400'
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        <span className="mr-1">
                          {game.isCompleted ? (
                            <CheckCircle2 className="w-3 h-3" />
                          ) : (
                            <XCircle className="w-3 h-3" />
                          )}
                        </span>
                        {game.isCompleted ? 'Completed' : 'Active'}
                      </span>
                    </td>

                    {/* Player 1 */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/90">
                        <User className="w-4 h-4 text-purple-400" />
                        <span className="text-sm font-mono">{truncateAddress(game.player1)}</span>
                      </div>
                    </td>

                    {/* Player 2 */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/90">
                        <User className="w-4 h-4 text-pink-400" />
                        <span className="text-sm font-mono">
                          {game.player2 !== '0x0000000000000000000000000000000000000000' 
                            ? truncateAddress(game.player2)
                            : 'Waiting...'}
                        </span>
                      </div>
                    </td>

                    {/* Bet Amount */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-white/90">
                        <Coins className="w-4 h-4 text-purple-400" />
                        <span className="text-sm">{game.betAmount}</span>
                      </div>
                    </td>

                    {/* Token */}
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-white/90">
                        {truncateAddress(game.tokenAddress)}
                      </span>
                    </td>

                    {/* Winner */}
                    <td className="px-6 py-4">
                      {game.isCompleted ? (
                        <div className="flex items-center gap-2 text-white/90">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-sm font-medium">
                            {game.didPlayer1Win ? 'Player 1' : 'Player 2'}
                          </span>
                        </div>
                      ) : (
                        <span className="text-white/50 text-sm">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllGames;