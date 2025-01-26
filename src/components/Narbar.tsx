import React, { useEffect, useState } from 'react';
import { Coins } from 'lucide-react';
import Connect from './ConnectWallet';
import { useBalance, useAccount } from 'wagmi';

const Navbar: React.FC = () => {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    address,
  });
  const [ethPrice, setEthPrice] = useState<number | null>(null);

  useEffect(() => {
    // Fetch the current ETH price in USD
    const fetchEthPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum&vs_currencies=usd');
        const data = await response.json();
        setEthPrice(data.ethereum.usd);
      } catch (error) {
        console.error('Error fetching ETH price:', error);
      }
    };

    fetchEthPrice();
  }, []);

  const formatBalance = (balance: number) => {
    return balance.toFixed(3);
  };

  return (
    <div className="p-4 pl-[100px] pr-[120px] flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className="flex items-center space-x-2">
          <Coins className="w-8 h-8 text-yellow-500" />
          <h1 className="text-2xl font-bold">PVP Flip</h1>
        </div>
      </div>
      <div className="flex items-center gap-1 bg-[#1e293b] rounded-full px-4 py-2">
        <div className="w-4 h-4">
          <img
            className="w-full h-full object-contain"
            src="https://ethereum.org/static/6b935ac0e6194247347855dc3d328e83/13c43/eth-diamond-black.png"
            alt="ETH"
          />
        </div>
        <span>
          {balance ? `${formatBalance(parseFloat(balance.formatted))} ETH` : '0.000 ETH'}
          {ethPrice && balance ? ` ($${(parseFloat(balance.formatted) * ethPrice).toFixed(2)})` : ''}
        </span>
        <div className="w-4 h-4">
          <img
            className="w-full h-full object-contain"
            src="https://example.com/plus-icon.png"
            alt="Plus"
          />
        </div>
      </div>
      <Connect />
    </div>
  );
};

export default Navbar;