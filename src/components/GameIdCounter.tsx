import React, { useEffect, useState } from 'react';
import { getGameIdCounter } from '../utils/contractFunctions';

const GameIdCounter: React.FC = () => {
  const [counter, setCounter] = useState<number | null>(null);

  useEffect(() => {
    const fetchCounter = async () => {
      const currentCounter = await getGameIdCounter();
      setCounter(Number(currentCounter));
    };

    fetchCounter();
  }, []);

  return (
    <div>
      <h2>Current Game ID Counter</h2>
      {counter !== null ? <p>{counter}</p> : <p>Loading...</p>}
    </div>
  );
};

export default GameIdCounter;
