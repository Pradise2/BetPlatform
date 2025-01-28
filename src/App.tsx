import React from 'react';

import CreateGame from './components/CreateGame';
import AllGames from './components/AllGames';
import AvailableGames from './components/AvailableGames';
import Navbar from './components/Narbar';


const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">

      {/* Header */}
      <Navbar/>
      
      <div style={{ color: 'blue' }}>
        <CreateGame />
      </div> 
      <div style={{ color: 'cyan' }}>
        <AvailableGames />
      </div>
      <div style={{ color: 'pink' }}>
        <AllGames />
      </div>
    

    </div>
  );
};

export default App;