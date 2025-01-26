import React, { useEffect, useState } from 'react';
import { getSupportedTokens } from '../utils/contractFunctions';
import { Coins, Loader2, ExternalLink } from 'lucide-react';

const ManageTokens: React.FC = () => {
  const [tokens, setTokens] = useState<string[] | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTokens = async () => {
      const fetchedTokens = await getSupportedTokens();
      setTokens(fetchedTokens);
    };

    fetchTokens();
  }, []);

  const filteredTokens = tokens?.filter(token =>
    token.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-blue-50 rounded-lg">
              <Coins className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Supported Tokens</h2>
              <p className="text-gray-600">Manage and view all supported tokens in the system</p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <input
                type="text"
                placeholder="Search tokens..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-4 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Tokens List */}
          {!tokens ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600">Loading available tokens...</p>
            </div>
          ) : filteredTokens?.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600">No tokens found matching your search.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredTokens?.map((token, index) => (
                <div
                  key={index}
                  className="group flex items-center justify-between p-4 bg-gray-50 hover:bg-blue-50 rounded-lg transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white shadow-sm flex items-center justify-center">
                      <span className="text-lg font-semibold text-blue-600">
                        {token.slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">{token}</h3>
                      <p className="text-sm text-gray-500">Token Address</p>
                    </div>
                  </div>
                  <button
                    className="p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-blue-600 hover:text-blue-700 rounded-full hover:bg-blue-100"
                    title="View Details"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer Stats */}
          {tokens && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                Showing {filteredTokens?.length} of {tokens.length} total tokens
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManageTokens;