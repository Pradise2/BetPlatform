import { useEffect, useState } from 'react';
import { getGameDetails, getGameIdCounter, getTimeLeftToExpire } from '../utils/contract';
import { cancelGame } from '../utils/contr';

import {
  GamepadIcon,
  Trophy,
  Coins,
  XCircle,
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

const CancelG = () => {
  const [gameDetails, setGameDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const gamesPerPage = 5;
  const [connectedAccount, setConnectedAccount] = useState<string>('');
  const [cancelingGame, setCancelingGame] = useState<number | null>(null); // Track which game is being canceled

  // Function to fetch and update game details for the current page
  const fetchGamesForCurrentPage = async () => {
    setLoading(true);
    setError(null);
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
          return { ...game, timeLeft, gameId };
        })
      );

      // Sort games in descending order by gameId
      const sortedGames = games.sort((a, b) => b.gameId - a.gameId);

      // Filter games based on expiration time and current player's wallet address
      const expiredGames = sortedGames.filter(game => {
        const hasExpired = game.createdAt + 24 * 60 * 60 < Math.floor(Date.now() / 1000); // 24 hours in seconds
        return game.player1.toLowerCase() === connectedAccount.toLowerCase() && !game.isCompleted && hasExpired;
      });

      console.log('Expired Games:', expiredGames);
      console.log('Total Expired Games:', expiredGames.length);
      console.log('game.player1:', connectedAccount);
      
      // Pagination: Only slice the data for the current page
      const indexOfLastGame = currentPage * gamesPerPage;
      const indexOfFirstGame = indexOfLastGame - gamesPerPage;
      const currentGames = expiredGames.slice(indexOfFirstGame, indexOfLastGame);

      setGameDetails(currentGames);
    } catch (error) {
      console.error('Error fetching games:', error);
      setError('Error fetching games');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchConnectedAccount = async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setConnectedAccount(accounts[0]);
    };

    fetchGamesForCurrentPage();
    fetchConnectedAccount();
  }, [currentPage]); // Re-fetch games when the page changes

  const handleCancelGame = async (gameId: number) => {
    setCancelingGame(gameId); // Start loading for the specific game
    setLoading(true);
    setError(null);
    try {
      console.log(`Canceling game ${gameId}...`);
      await cancelGame(gameId);
      console.log(`Successfully canceled game ${gameId}`);
    } catch (err) {
      console.error('Error canceling game:', err);
      if (err instanceof Error) {
        setError(`Failed to cancel game: ${err.message}`);
      } else {
        setError('An unknown error occurred while trying to cancel the game.');
      }
    } finally {
      setCancelingGame(null); // Reset loading state for this game
      setLoading(false);
    }
  };

  // Pagination controls
  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <div>{error}</div>;

  return (
    <div className="p-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <GamepadIcon className="w-8 h-8 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Expired Games</h2>
          </div>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-white/90 text-lg">
              {gameDetails.length} Expired Games
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
              No Expired Games
            </h3>
            <p className="text-white/70">
              There are currently no expired games to cancel. Check back later.
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
                      Player 1 Choice
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                      Time Left
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
                            onClick={() => handleCancelGame(game.gameId)}
                            className="px-4 py-2 text-white bg-red-600 rounded-md"
                            disabled={cancelingGame === game.gameId} // Disable the button while canceling
                          >
                            {cancelingGame === game.gameId ? (
                              <span className="spinner-border spinner-border-sm"></span>
                            ) : (
                              'Cancel Game'
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

        {/* Pagination Controls */}
        <div className="flex justify-center mt-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 text-white bg-purple-600 rounded-md disabled:bg-gray-500"
          >
            Previous
          </button>
          <span className="mx-4 text-white">{currentPage}</span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={gameDetails.length < gamesPerPage}
            className="px-4 py-2 text-white bg-purple-600 rounded-md disabled:bg-gray-500"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelG;
