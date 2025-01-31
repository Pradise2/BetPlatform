import React from 'react';
import CreateG from './components/CreateG';

import Navbar from './components/Narbar';




const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">

      {/* Header */}

      <Navbar/>
      <CreateG/>
      
       
    

    </div>
  );
};

export default App;