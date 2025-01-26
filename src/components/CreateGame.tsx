import React, { useState } from 'react';
import { useAccount } from 'wagmi';
import { createGame, SUPPORTED_TOKENS } from '../utils/contractFunctions';
import { Coins, Loader2, Plus, AlertCircle, CheckCircle2 } from 'lucide-react';

interface CreateGameState {
  betAmount: string;
  tokenAddress: string;
  loading: boolean;
  error: string | null;
  success: string | null;
}

const CreateGame: React.FC = () => {
  const { address, isConnected } = useAccount();
  const [state, setState] = useState<CreateGameState>({
    betAmount: '',
    tokenAddress: SUPPORTED_TOKENS.ETH,
    loading: false,
    error: null,
    success: null,
  });

  const handleCreateGame = async () => {
    setState({ ...state, error: null, success: null, loading: true });

    try {
      if (!state.betAmount || parseFloat(state.betAmount) <= 0) {
        throw new Error('Bet amount must be a positive number');
      }

      if (!isConnected || !address) {
        throw new Error('Please connect your wallet');
      }
  // Log the betAmount and tokenAddress before calling createGame
  console.log('Creating game with Bet Amount:', state.betAmount);
  console.log('Token Address selected:', state.tokenAddress)
      await createGame(state.tokenAddress, state.betAmount);
      setState({ ...state, success: 'Game created successfully!', loading: false });
    } catch (error: any) {
      setState({ ...state, error: error.message, loading: false });
    }
  };

  return (
    <div className=" bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center gap-3 mb-6">
          <Coins className="w-8 h-8 text-indigo-600" />
          <h2 className="text-2xl font-bold text-gray-800">Create New Game</h2>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="betAmount" className="block text-sm font-medium text-gray-700 mb-1">
              Bet Amount
            </label>
            <input
              id="betAmount"
              type="text"
              placeholder="Enter amount"
              value={state.betAmount}
              onChange={(e) => setState({ ...state, betAmount: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            />
          </div>

          <div>
            <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
              Select Token
            </label>
            <select
              id="token"
              value={state.tokenAddress}
              onChange={(e) => setState({ ...state, tokenAddress: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
            >
              {Object.entries(SUPPORTED_TOKENS).map(([key, value]) => (
                <option key={key} value={value}>
                  {key}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleCreateGame}
            disabled={state.loading}
            className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 text-white font-medium transition-colors ${
              state.loading
                ? 'bg-indigo-400 cursor-not-allowed'
                : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {state.loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Creating Game...
              </>
            ) : (
              <>
                <Plus className="w-5 h-5" />
                Create Game
              </>
            )}
          </button>

          {state.error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-600">{state.error}</p>
            </div>
          )}

          {state.success && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-600">{state.success}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateGame;