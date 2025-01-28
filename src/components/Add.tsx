import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { addSupportedToken, publicContract } from '../utils/contractFunctions';

const Add = () => {
  const [tokens, setTokens] = useState([]);
  const [newTokenAddress, setNewTokenAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Fetch tokens from the smart contract
  const fetchTokens = async () => {
    try {
      setLoading(true);
      const supportedTokens = await publicContract.getSupportedTokens();
      setTokens(supportedTokens);
    } catch (error) {
      setErrorMessage('Failed to fetch tokens. Please try again later.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTokens();
  }, []);

  // Handle adding a new token
  const handleAddToken = async () => {
    if (!ethers.isAddress(newTokenAddress)) {
      setErrorMessage('Invalid Ethereum address.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      await addSupportedToken(newTokenAddress);
      setSuccessMessage('Token added successfully!');
      setNewTokenAddress('');
      fetchTokens(); // Refresh tokens list
    } catch (error) {
      setErrorMessage('Failed to add token. Ensure you are authorized.');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white shadow-lg rounded-lg p-6 max-w-lg w-full">
        <h1 className="text-2xl font-bold mb-4">PVP Flip Game</h1>
        <h2 className="text-xl font-semibold mb-4">Supported Tokens</h2>
        <ul className="mb-4">
          {loading ? (
            <p>Loading tokens...</p>
          ) : tokens.length > 0 ? (
            tokens.map((token, index) => (
              <li key={index} className="text-gray-700">
                <strong>Token {index + 1}:</strong> {token}
              </li>
            ))
          ) : (
            <p>No tokens available.</p>
          )}
        </ul>

        <h2 className="text-xl font-semibold mb-2">Add a New Token</h2>
        <div className="mb-4">
          <input
            type="text"
            className="w-full border rounded-lg px-4 py-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter token address"
            value={newTokenAddress}
            onChange={(e) => setNewTokenAddress(e.target.value)}
            disabled={loading}
          />
          <button
            onClick={handleAddToken}
            className={`w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 ${
              loading ? 'opacity-50 cursor-not-allowed' : ''
            }`}
            disabled={loading}
          >
            {loading ? 'Processing...' : 'Add Token'}
          </button>
        </div>

        {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
        {successMessage && <p className="text-green-500 text-sm mt-2">{successMessage}</p>}
      </div>
    </div>
  );
};

export default Add;
