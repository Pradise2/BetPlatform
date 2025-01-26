import React, { useState } from 'react';
import { getGameDetailsWithoutWallet } from '../utils/contractFunctions';

const ViewGameWithoutWallet: React.FC = () => {
  const [gameId, setGameId] = useState<number | null>(null);
  const [gameDetails, setGameDetails] = useState<any>(null);

  const handleFetchGameDetails = async () => {
    if (gameId !== null) {
      const details = await getGameDetailsWithoutWallet(gameId);
      setGameDetails(details);
    }
  };

  return (
    <div>
      <h2>View Game Details (No Wallet Required)</h2>
      <input
        type="number"
        placeholder="Game ID"
        value={gameId ?? ''}
        onChange={(e) => setGameId(Number(e.target.value))}
      />
      <button onClick={handleFetchGameDetails}>Fetch Game Details</button>
      {gameDetails && (
        <div>
          <p>Player 1: {gameDetails.player1}</p>
          <p>Player 2: {gameDetails.player2}</p>
          <p>Bet Amount: {gameDetails.betAmount}</p>
          <p>Token Address: {gameDetails.tokenAddress}</p>
          <p>Is Completed: {gameDetails.isCompleted ? 'Yes' : 'No'}</p>
          <p>Did Player 1 Win: {gameDetails.didPlayer1Win ? 'Yes' : 'No'}</p>
        </div>
      )}
    </div>
  );
};

export default ViewGameWithoutWallet;