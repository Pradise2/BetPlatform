import React from 'react';
import CreateG from './components/CreateG';
import CreateGame from './components/CreateGame';
import AllGames from './components/AllGames';
import AvailableGames from './components/AvailableGames';
import Navbar from './components/Narbar';
import JoinG from './components/JoinG';
import AddG from './components/AddG';
import AvailableG from './components/AvailableG';
import AllG from './components/AllG';
import CancelG from './components/CancelG';



const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">

      {/* Header */}

      <Navbar/>
      <CreateG/>
      <AvailableG/>
      <AllG/>
       
       <CancelG/>
       
        
    

    </div>
  );
};

export default App;