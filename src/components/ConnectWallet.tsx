import React, { useEffect } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';

const ConnectWallet: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const formatAddress = (address: string) => {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    console.log('Available connectors:', connectors);
  }, [connectors]);

  console.log('isConnected:', isConnected);
  console.log('address:', address);

  return (
    <div>
      {isConnected ? (
        <div className="text-center text-white-800 flex-row flex items-center space-x-4">
          <p className="items-center text-bold flex">
            {address ? formatAddress(address) : 'N/A'}
          </p>
          <button
            className="bg-red-500 items-center text-white px-4 py-2 rounded hover:bg-red-600 transition duration-300"
            onClick={() => disconnect()}
          >
            Disconnect
          </button>
        </div>
      ) : (
        <button
          onClick={() => {
            if (connectors.length > 0) {
              connect({
                connector: connectors[1], 
                chainId: 8453, 
              });
            } else {
              console.error('No available connectors');
            }
          }}
          className="bg-blue-600 px-4 py-2 rounded-full"
        >
          Connect
        </button>
      )}
    </div>
  );
};

export default ConnectWallet;