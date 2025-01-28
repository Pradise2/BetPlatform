import React, { useEffect, useState } from 'react';
import {
  getGameDetailsWithoutWallet,
  getGameIdCounter,
  joinGame,
} from '../utils/contractFunctions';
import {
  GamepadIcon,
  Loader2,
  Trophy,
  Coins,
  XCircle,
  ArrowRight,
} from 'lucide-react';

const AvailableGames: React.FC = () => {
  const [games, setGames] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [joiningGame, setJoiningGame] = useState<number | null>(null);
  const [betAmounts, setBetAmounts] = useState<{ [key: number]: string }>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const gameIdCounter = await getGameIdCounter();
        const gamePromises = [];

        if (gameIdCounter !== undefined) {
          for (let gameId = 0; gameId <= gameIdCounter; gameId++) {
            gamePromises.push(
              getGameDetailsWithoutWallet(gameId).then((game) => ({
                ...game,
                gameId,
              }))
            );
          }
        }

        const gameDetails = await Promise.all(gamePromises);
        setGames(gameDetails.filter((game) => game && !game.isCompleted));
      } catch (error) {
        console.error('Error fetching games:', error);
        setError('Error fetching games');
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  const handleBetInputChange = (gameId: number, value: string) => {
    setBetAmounts((prev) => ({ ...prev, [gameId]: value }));
  };

  const handleJoinGame = async (gameId: number, requiredBetAmount: string) => {
    const betAmount = betAmounts[gameId];

    if (!betAmount) {
      setError('Please enter a bet amount');
      return;
    }

    if (betAmount !== requiredBetAmount) {
      setError("Bet amount must match the game's required bet amount");
      return;
    }

    try {
      setError(null);
      setJoiningGame(gameId);
      await joinGame(gameId, betAmount);
      // Optional: refresh games list after joining
    } catch (err) {
      console.error(err);
      setError('Failed to join game. Please try again.');
    } finally {
      setJoiningGame(null);
    }
  };


  return (
    <div className="p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <GamepadIcon className="w-8 h-8 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Available Games</h2>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-white/90 text-lg">
              {games.length} Active Games
            </span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            <p className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {error}
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="flex items-center gap-3 text-white">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-lg">Loading available games...</span>
            </div>
          </div>
        ) : games.length === 0 ? (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl p-8 text-center">
            <GamepadIcon className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No Available Games
            </h3>
            <p className="text-white/70">
              There are currently no active games to join. Check back later or
              create a game.
            </p>
          </div>
        ) : (
          <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-b border-white/10">
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Game ID
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Required Bet
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Token Name
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {games.map((game) => (
                    <tr
                      key={game.gameId}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-semibold">
                            #{game.gameId}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Coins className="w-4 h-4 text-purple-400" />
                          <span className="text-white/90">{game.betAmount}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/90">
                          {game.tokenName || 'Unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <input
                            type="text"
                            placeholder="Enter bet amount"
                            value={betAmounts[game.gameId] || ''}
                            onChange={(e) =>
                              handleBetInputChange(game.gameId, e.target.value)
                            }
                            className="px-3 py-1.5 bg-white/5 border border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white placeholder-white/50 text-sm w-36"
                          />
                          <button
                            onClick={() =>
                              handleJoinGame(game.gameId, game.betAmount)
                            }
                            disabled={joiningGame === game.gameId}
                            className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white py-1.5 px-4 rounded-lg text-sm font-medium transition-all hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                          >
                            {joiningGame === game.gameId ? (
                              <>
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Joining...
                              </>
                            ) : (
                              <>
                                Join Game
                                <ArrowRight className="w-4 h-4" />
                              </>
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AvailableGames;
