import { useEffect, useState } from 'react';
import { getGameDetails, getGameIdCounter, joinGame } from '../utils/contract';

const AvailableG = () => {
  const [gameDetails, setGameDetails] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        console.log('Fetching game ID counter...');
        const gameIdCounter = await getGameIdCounter();
        console.log('Game ID Counter:', gameIdCounter);
  
        const games = [];
        // Adjust the loop to run up to gameIdCounter - 1 (i.e., 0, 1, 2 for gameIdCounter of 3)
        for (let i = 0; i < gameIdCounter; i++) {  // Changed i <= gameIdCounter to i < gameIdCounter
          console.log(`Fetching details for game ${i}...`);
          const game = await getGameDetails(i);
          console.log(`Game ${i} details:`, game);
          games.push(game);
        }
        setGameDetails(games);
      } catch (err) {
        console.error('Error fetching game details:', err);
        setError('Failed to fetch game details.');
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
      
      // Call the joinGame function
      await joinGame(gameId);
      
      // Re-fetch game details after joining
      const updatedGame = await getGameDetails(gameId);
      setGameDetails((prevDetails) => {
        const updatedDetails = [...prevDetails];
        updatedDetails[gameId] = updatedGame;
        return updatedDetails;
      });
  
      console.log(`Successfully joined game ${gameId}`);
    } catch (err) {
      console.error('Error joining game:', err);
      setError('Failed to join game.');
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Game List</h2>
      {gameDetails.length === 0 ? (
        <p>No games available.</p>
      ) : (
        gameDetails.map((game, index) => (
          <div key={index}>
            <p><strong>Game {index} Details:</strong></p>
            <p><strong>Player 1:</strong> {game.player1}</p>
            <p><strong>Player 2:</strong> {game.player2}</p>
            <p><strong>Bet Amount:</strong> {game.betAmount} {game.tokenSymbol}</p>
            <p><strong>Token Address:</strong> {game.tokenAddress}</p>
            <p><strong>Token Name:</strong> {game.tokenName}</p>
            
            <p><strong>Game Completed:</strong> {game.isCompleted ? 'Yes' : 'No'}</p>
            <button onClick={() => handleJoinGame(index)}>Join Game</button>
          </div>
        ))
      )}
    </div>
  );
};

export default AvailableG;
