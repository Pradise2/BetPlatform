import React, { useState } from 'react';
import { joinGame } from '../utils/contr'; // Import the joinGame function from FlipGame.ts

const JoinG: React.FC = () => {
  const [gameId, setGameId] = useState<number | string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Handle form submission to join the game
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    // Check if gameId is a valid number
    if (!gameId || isNaN(Number(gameId))) {
      setError('Please enter a valid Game ID.');
      return;
    }

    setError(null); // Reset any previous errors
    setLoading(true);
    setSuccessMessage(null); // Reset any previous success messages

    try {
      // Call the joinGame function
      await joinGame(Number(gameId));
      setSuccessMessage(`Successfully joined game with ID: ${gameId}`);
    } catch (err) {
      console.error('Error joining game:', err);
      setError('There was an error joining the game. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Join Game</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="gameId">Game ID</label>
          <input
            type="number"
            id="gameId"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
            placeholder="Enter Game ID"
            required
          />
        </div>
        <button type="submit" disabled={loading}>
          {loading ? 'Joining...' : 'Join Game'}
        </button>
      </form>

      {/* Display any error message */}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* Display success message */}
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
    </div>
  );
};

export default JoinG;