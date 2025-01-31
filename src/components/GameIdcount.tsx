import { useEffect, useState } from 'react';
import { getGameDetails, getGameIdCounter } from '../utils/contract'; // Adjust the import path

// Define the GameDetails interface to strongly type the data we get from the smart contract
interface GameDetails {
  player1: string;
  player2: string;
  betAmount: string;
  tokenAddress: string;
  isCompleted: boolean;
  player1Choice: boolean;
  createdAt: number;
}

const GameIdCount = () => {
  const [gameDetailsList, setGameDetailsList] = useState<GameDetails[]>([]); // Store multiple game details
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchGameDetails = async () => {
      try {
        // Fetch the current game ID counter (most recent game ID)
        const currentGameId = await getGameIdCounter();

        // If the game ID counter is 0 or invalid, show an error message
        if (currentGameId <= 0) {
          setError('No active games found.');
          setLoading(false);
          return;
        }

        // Create an array to store the details of all games
        const gameDetailsArray: GameDetails[] = [];

        // Fetch the game details for each game ID (from 0 to currentGameId - 1)
        for (let i = 0; i < currentGameId; i++) {
          const game = await getGameDetails(i); // Fetch details for game ID i
          gameDetailsArray.push(game); // Add the game details to the array
        }

        // Set the fetched game details in state
        setGameDetailsList(gameDetailsArray);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching game details:', err);
        setError('Failed to fetch game details.');
        setLoading(false);
      }
    };

    // Call the function to fetch game details
    fetchGameDetails();
  }, []); // Empty dependency array ensures this runs only once when the component mounts

  // Render loading, error, or game details
  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2>Game Details</h2>
      {gameDetailsList.length > 0 ? (
        gameDetailsList.map((gameDetails, index) => (
          <div key={index}>
            <h3>Game {index}</h3>
            <p><strong>Player 1:</strong> {gameDetails.player1}</p>
            <p><strong>Player 2:</strong> {gameDetails.player2}</p>
            <p><strong>Bet Amount:</strong> {gameDetails.betAmount} ETH</p>
            <p><strong>Token Address:</strong> {gameDetails.tokenAddress}</p>
            <p><strong>Game Completed:</strong> {gameDetails.isCompleted ? 'Yes' : 'No'}</p>
            <p><strong>Player 1 Choice:</strong> {gameDetails.player1Choice ? 'Heads' : 'Tails'}</p>
            <p><strong>Created At:</strong> {new Date(gameDetails.createdAt * 1000).toLocaleString()}</p>
            <hr />
          </div>
        ))
      ) : (
        <p>No game details available.</p>
      )}
    </div>
  );
};

export default GameIdCount;
