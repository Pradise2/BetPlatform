
import { useEffect, useState } from 'react';
import { getGameDetails, getGameIdCounter, joinGame, getTimeLeftToExpire } from '../utils/contract';
import {
  GamepadIcon,
  
  Trophy,
  Coins,
  XCircle,
  ArrowRight,
  CircleDollarSign,
} from 'lucide-react';

const LoadingSpinner = () => (
  <div className="flex flex-col items-center justify-center h-64 gap-8">
    <div className="coin">
      <div className="coin-face coin-front">
        <CircleDollarSign className="w-full h-full text-white/90 p-6" />
      </div>
      <div className="coin-face coin-back">
        <CircleDollarSign className="w-full h-full text-white/90 p-6" />
      </div>
    </div>
    <span className="text-xl font-semibold loading-text">
      Loading available games...
    </span>
  </div>
);

const AvailableG = () => {
  const [gameDetails, setGameDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        const gameIdCounter = await getGameIdCounter();
        console.log('Game ID Counter:', gameIdCounter);
  
        if (gameIdCounter === undefined) {
          setError('No active games available.');
          return;
        }
  
        const games = await Promise.all(
          Array.from({ length: gameIdCounter }, async (_, gameId) => {
            console.log(`Fetching details for game ${gameId}...`);
            const game = await getGameDetails(gameId);
            const timeLeft = await getTimeLeftToExpire(gameId);
            return { ...game, timeLeft , gameId};
          })
        );
  
        const activeGames = games.filter(game => !game.isCompleted && game.timeLeft && (game.timeLeft.hours * 3600 + game.timeLeft.minutes * 60 + game.timeLeft.seconds) > 0);
        setGameDetails(activeGames);
  
      } catch (error) {
        console.error('Error fetching games:', error);
        setError('Error fetching games');
      } finally {
        setLoading(false);
      }
    };
  
    fetchGameDetails();
  }, []);

  const handleJoinGame = async (gameId: number) => {
    setLoading(true);
    setError(null);
    try {
      console.log(`Joining game ${gameId}...`);
      await joinGame(gameId);
      console.log(`Successfully joined game ${gameId}`);
    } catch (err) {
      console.error('Error joining game:', err);
      if (err instanceof Error) {
        setError(`Failed to join game: ${err.message}`);
      } else {
        setError('An unknown error occurred while trying to join the game.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <GamepadIcon className="w-8 h-8 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Available Games</h2>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-white/90 text-lg">
              {gameDetails.length} Active Games
            </span>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-400">
            <p className="flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              {error}
            </p>
          </div>
        )}

        {gameDetails.length === 0 ? (
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
                      Game Completed
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      player1Choice
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Time
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/10">
                  {gameDetails.map((game) => (
                    <tr key={game.gameId} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Trophy className="w-4 h-4 text-yellow-400" />
                          <span className="text-white font-semibold">
                            {game.gameId}
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
                        <span className="text-white/90">
                          {game.isCompleted ? 'Yes' : 'No'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/90">
                          {game.player1Choice ? 'Heads' : 'Tails'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-white/90">
                          {game.timeLeft
                            ? `${game.timeLeft.hours}h ${game.timeLeft.minutes}m ${game.timeLeft.seconds}s`
                            : 'Expired'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => handleJoinGame(game.gameId)}
                            disabled={game.isCompleted || game.timeLeft <= 0}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 text-white font-medium transition-all hover:opacity-90 ${
                              game.isCompleted || game.timeLeft <= 0
                                ? 'cursor-not-allowed opacity-50'
                                : ''
                            }`}
                          >
                            Join Game
                            <ArrowRight className="w-4 h-4" />
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

export default AvailableG;