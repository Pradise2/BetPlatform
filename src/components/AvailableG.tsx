import { useEffect, useState } from 'react';
import { getGameDetails, getGameIdCounter, joinGame, getTimeLeftToExpire } from '../utils/contract';
import {
  GamepadIcon,
  Loader2,
  Trophy,
  Coins,
  XCircle,
  ArrowRight,
} from 'lucide-react';

const AvailableG = () => {
  const [gameDetails, setGameDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Format seconds to hours, minutes, seconds
  const formatTimeLeft = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours}h ${minutes}m ${secs}s`;
  };

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        console.log('Fetching game ID counter...');
        const gameIdCounter = await getGameIdCounter();
        console.log('Game ID Counter:', gameIdCounter);

        const games = [];

        if (gameIdCounter !== undefined) {
          for (let gameId = 0; gameId < gameIdCounter; gameId++) {
            console.log(`Fetching details for game ${gameId}...`);
            const game = await getGameDetails(gameId).then((game) => ({ ...game, gameId }));
            console.log(`Game ${gameId} details:`, game);

            // Fetch the time left for the game
            const timeLeft = await getTimeLeftToExpire(gameId);
 console.log('timeLeft:', timeLeft);
            // Push the game with time left included
            games.push({ ...game, timeLeft });
          }
         

          setGameDetails(games);  // Set game details directly without Promise.all
        }
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
      setError('Failed to join game.');
    } finally {
      setLoading(false);
    }
  };

  // If loading, show loading state
  if (loading) return <div>Loading...</div>;

  // If error, show error message
  if (error) return <div>{error}</div>;

  // Function to format timestamp to human-readable string
  const formatTimestamp = (timestamp: number) => {
    const date = new Date(timestamp * 1000); // Convert to milliseconds
    return date.toLocaleString(); // Format as a human-readable string
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
           {gameDetails.length} Active Games
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
     ) : gameDetails.length === 0 ? (
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
                   Actions
                 </th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/10">
               {gameDetails.map((game, index) =>  (
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
                     <div className="flex items-center gap-3">
                       
                       <button onClick={() => handleJoinGame(game.gameId)}>
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
