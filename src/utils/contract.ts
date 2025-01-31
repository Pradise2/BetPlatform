import { ethers } from 'ethers';
import { FLIP_GAME_ABI, FLIP_GAME_ADDRESS } from '../contracts/FlipContract';

export const SUPPORTED_TOKENS = { 
  STABLEAI: '0x07F41412697D14981e770b6E335051b1231A2bA8',
  DIG: '0x208561379990f106E6cD59dDc14dFB1F290016aF',
  WEB9: '0x09CA293757C6ce06df17B96fbcD9c5f767f4b2E1', 
  BNKR: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
  FED: '0x19975a01B71D4674325bd315E278710bc36D8e5f',
  TestToken: '0x54939A9F8084b6D3362BD987dE7E0CD2e96462DC'
};

// Set up provider and contract for public access (read-only)
export const publicProvider = new ethers.JsonRpcProvider('https://base-mainnet.infura.io/v3/b17a040a14bc48cfb3928a73d26f3617');
export const publicContract = new ethers.Contract(FLIP_GAME_ADDRESS, FLIP_GAME_ABI, publicProvider);

// Function to set up signer and contract for wallet interaction
async function setupContractWithSigner() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(FLIP_GAME_ADDRESS, FLIP_GAME_ABI, signer);
    return { signer, contract };
  } catch (error) {
    console.error('Error setting up contract with signer:', error);
    throw error;
  }
}

// Define the GameDetails interface
interface GameDetails {
  player1: string;
  player2: string;
  betAmount: string;
  tokenAddress: string;
  isCompleted: boolean;
  player1Choice: boolean;
  createdAt: number;
  tokenName: string;
  tokenSymbol: string;
  player2Balance: string;
}

// Function to handle contract errors with additional info
interface ContractError extends Error {
  code?: string;
  transaction?: any;
  revert?: string;
}

function handleContractError(error: ContractError) {
  if (error.code === 'CALL_EXCEPTION') {
    console.error('Transaction data:', error.transaction);
    if (error.revert) {
      console.error('Revert reason:', error.revert);
    }
  } else if (error.code === 'ACTION_REJECTED') {
    console.error('User rejected the action:', error);
  } else {
    console.error('Unexpected error:', error);
  }
}

// Async function to fetch the game details
export const getGameDetails = async (gameId: number): Promise<GameDetails> => {
  try {
    // Fetch game details using the contract call (using ethers.js syntax)
    const gameDetails = await publicContract.games(gameId);
    console.log('Raw game details:', gameDetails);  // Log all details
    
    // Check the type of createdAt before using .toNumber()
    console.log('Created At value:', gameDetails.createdAt);
    console.log('Type of createdAt:', typeof gameDetails.createdAt);

    // Fetch token details (name and symbol)
    const tokenContract = new ethers.Contract(gameDetails.tokenAddress, 
      ['function balanceOf(address owner) view returns (uint256)',"function name() view returns (string)", "function symbol() view returns (string)"], 
      publicProvider);

    const tokenName = await tokenContract.name().catch(err => {
      console.error('Error fetching token name:', err);
      return 'Unknown Token';
    });

    const tokenSymbol = await tokenContract.symbol().catch(err => {
      console.error('Error fetching token symbol:', err);
      return 'Unknown Symbol';
    });

         // Fetch the balance for player1 (you can adjust to check either player1 or player2)
    const player2Balance = await tokenContract.balanceOf(gameDetails.player2);
    const player2BalanceInEther = ethers.formatUnits(player2Balance, 18); // Convert balance to a human-readable format
    console.log('Player 2 Token Balance:', player2BalanceInEther);

    // Format the data (e.g., converting from Wei to Ether)
    const formattedGameDetails: GameDetails = {
      player1: gameDetails.player1,
      player2: gameDetails.player2,
      betAmount: ethers.formatUnits(gameDetails.betAmount), // Convert betAmount from Wei to Ether
      tokenAddress: gameDetails.tokenAddress,
      isCompleted: gameDetails.isCompleted,
      player1Choice: gameDetails.player1Choice,
      createdAt: typeof gameDetails.createdAt === 'bigint'
        ? Number(gameDetails.createdAt) // if it's BigInt, convert it to number
        : gameDetails.createdAt, // if it's already a number, just use it
      tokenName: tokenName,
      tokenSymbol: tokenSymbol,
      player2Balance: player2BalanceInEther,
    };

    console.log("Formatted Game Details:", formattedGameDetails);
    return formattedGameDetails;
  } catch (error) {
    console.error("Error fetching game details:", error);
    throw error;
  }
};


// Function to get the current game ID counter (using the public contract for read-only access)
export const getGameIdCounter = async () => {
  try {
    const count = await publicContract.gameIdCounter(); // Using publicContract for read-only access
    console.log('Current game ID counter:', count);
    const counter = Number(count);
    return counter;
  } catch (error) {
    handleContractError(error as ContractError);
    return 0; // Return 0 or appropriate fallback value
  }
};


// Function to join an existing game
export const joinGame = async (gameId: number) => {
  try {
    const { signer, contract } = await setupContractWithSigner();
      // Fetch the game details (including betAmount, tokenAddress, etc.)
      const game = await contract.games(gameId);

   // Fetch the bet amount for validation
   const betAmountInUnits = game.betAmount;
   const betAmountInWei = ethers.parseUnits(betAmountInUnits.toString(), 18)

    // Create token contract instance
    const tokenContract = new ethers.Contract(game.tokenAddress, [
      'function approve(address spender, uint256 amount) public returns (bool)',
      'function balanceOf(address owner) public view returns (uint256)',
    ], signer);

    // Step 1: Check Player 2's balance to make sure they have enough tokens
    const balance = await tokenContract.balanceOf(await signer.getAddress());
    if (balance < (betAmountInWei)) {
      throw new Error('Not enough tokens to join game');
    }
console.log('Player balance:', balance);  

console.log('betAmountInWei:', betAmountInWei);

    // Step 2: Approve the contract to spend the tokens
    const approveTx = await tokenContract.approve(FLIP_GAME_ADDRESS, betAmountInWei);
    await approveTx.wait();
    console.log('Token approved successfully.');

    // Step 3: Proceed with the transaction if the bet amounts match
    const tx = await contract.joinGame(gameId);
    await tx.wait();
    console.log('Game joined successfully');
  } catch (error) {
    console.error('Error joining game:', error);
    handleContractError(error as ContractError);
  }
};

// Function to create a new game
export const createGame = async (
  tokenAddress: string, 
  betAmount: string, 
  player1Choice: boolean, // Add player1Choice parameter
  timeoutDuration: string  // Add timeoutDuration parameter (in seconds)
  ) => {
  try {
    const { signer, contract } = await setupContractWithSigner();

    console.log('Creating game with amount:', betAmount, 'and token address:', tokenAddress);

    // Create token contract instance
    const tokenContract = new ethers.Contract(tokenAddress, [
      'function approve(address spender, uint256 amount) public returns (bool)',
      'function balanceOf(address owner) public view returns (uint256)',
    ], signer);

    // Convert betAmount to the correct token decimals (18 decimals)
    const betAmountInWei = ethers.parseUnits(betAmount, 18);

    // Step 1: Check Player 1's balance to make sure they have enough tokens
    const balance = await tokenContract.balanceOf(await signer.getAddress());
    console.log('Player balance:', balance.toString());  // Log the balance to check if it returns a BigInt
    if (balance < (betAmountInWei)) {
      const errorMessage = 'Not enough tokens to create game';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Step 2: Approve the contract to spend the tokens
    const approveTx = await tokenContract.approve(FLIP_GAME_ADDRESS, betAmountInWei);
    await approveTx.wait();
    console.log('Token approved successfully.');

    // Step 3: Call createGame to create the game
    const tx = await contract.createGame(betAmountInWei, tokenAddress, player1Choice, timeoutDuration);
    await tx.wait();
    console.log('Game created successfully:', tx);

  } catch (error) {
    console.error('Error creating game:', error);
    handleContractError(error as ContractError);
  }
};

// Function to add a supported token
export const addSupportedToken = async (tokenAddress: string, tokenName: string) => {
  try {
    const { contract } = await setupContractWithSigner();

    console.log('Adding supported token:', tokenName, 'with address:', tokenAddress);

    // Call the addSupportedToken function on the contract
    const tx = await contract.addSupportedToken(tokenAddress, tokenName);
    await tx.wait();
    console.log('Token added successfully:', tx);

  } catch (error) {
    console.error('Error adding token:', error);
    handleContractError(error as ContractError);
  }
};



