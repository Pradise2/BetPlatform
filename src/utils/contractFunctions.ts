import { ethers } from 'ethers';
import { PVP_FLIP_GAME_ABI, PVP_FLIP_GAME_ADDRESS } from '../contracts/PVPFlipGameContract';

export const SUPPORTED_TOKENS = {
  ETH: '0x0000000000000000000000000000000000000000',
  USDC: '0x0000000000000000000000000000000000000000',
  USDT: '0x0000000000000000000000000000000000000000',
  Token: '0x54939A9F8084b6D3362BD987dE7E0CD2e96462DC',
};

// Set up provider and contract for public access (read-only)
const publicProvider = new ethers.JsonRpcProvider('https://base-mainnet.infura.io/v3/b17a040a14bc48cfb3928a73d26f3617');
const publicContract = new ethers.Contract(PVP_FLIP_GAME_ADDRESS, PVP_FLIP_GAME_ABI, publicProvider);

// Function to set up signer and contract for wallet interaction
async function setupContractWithSigner() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(PVP_FLIP_GAME_ADDRESS, PVP_FLIP_GAME_ABI, signer);
    return { signer, contract };
  } catch (error) {
    console.error('Error setting up contract with signer:', error);
    throw error;
  }
}

// Function to create a new game
export const createGame = async (tokenAddress: string, betAmount: string) => {
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
    if (balance.lt(betAmountInWei)) {
      console.error('Not enough tokens to create game');
      return;
    }

    // Step 2: Approve the contract to spend the tokens
    const approveTx = await tokenContract.approve(PVP_FLIP_GAME_ADDRESS, betAmountInWei);
    await approveTx.wait();
    console.log('Token approved successfully.');

    // Step 3: Call createGame to create the game
    const tx = await contract.createGame(betAmountInWei, tokenAddress);
    await tx.wait();
    console.log('Game created successfully:', tx);
  } catch (error) {
    console.error('Error creating game:', error);
    handleContractError(error);
  }
};

// Function to join an existing game
export const joinGame = async (gameId: number, betAmount: string) => {
  try {
    const { signer, contract } = await setupContractWithSigner();
    const game = await contract.games(gameId);

    // Convert the bet amount to the same decimal units as the token (18 decimals for ERC20 tokens)
    const betAmountInUnits = ethers.parseUnits(betAmount, 18);

    // Check if the provided bet amount matches the one set by Player 1
    if (betAmountInUnits.toString() !== game.betAmount.toString()) {
      throw new Error('Bet amount must be equal to Player 1\'s bet');
    }

    // Create token contract instance
    const tokenContract = new ethers.Contract(game.tokenAddress, [
      'function approve(address spender, uint256 amount) public returns (bool)',
      'function balanceOf(address owner) public view returns (uint256)',
    ], signer);

    // Step 1: Check Player 2's balance to make sure they have enough tokens
    const balance = await tokenContract.balanceOf(await signer.getAddress());
    if (balance.lt(betAmountInUnits)) {
      throw new Error('Not enough tokens to join game');
    }

    // Step 2: Approve the contract to spend the tokens
    const approveTx = await tokenContract.approve(PVP_FLIP_GAME_ADDRESS, betAmountInUnits);
    await approveTx.wait();
    console.log('Token approved successfully.');

    // Step 3: Proceed with the transaction if the bet amounts match
    const tx = await contract.joinGame(gameId, betAmountInUnits);
    await tx.wait();
    console.log('Game joined successfully');
  } catch (error) {
    console.error('Error joining game:', error);
    handleContractError(error);
  }
};

// Function to handle contract errors with additional info
function handleContractError(error) {
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

// Function to get supported tokens
export const getSupportedTokens = async () => {
  try {
    const { contract } = await setupContractWithSigner();
    const tokens = await contract.getSupportedTokens();
    console.log('Supported tokens:', tokens);
    return tokens;
  } catch (error) {
    console.error('Error fetching supported tokens:', error);
  }
};

// Function to get game details by ID
export const getGameDetails = async (gameId: number) => {
  try {
    const game = await publicContract.games(gameId);
    console.log('Game details:', game);
    return {
      player1: game[0],
      player2: game[1],
      betAmount: ethers.formatUnits(game[2], 18),
      tokenAddress: game[3],
      isCompleted: game[4],
      didPlayer1Win: game[5],
    };
  } catch (error) {
    console.error('Error fetching game details:', error);
  }
};

// Function to get the current game ID counter
export const getGameIdCounter = async () => {
  try {
    const { contract } = await setupContractWithSigner();
    const count = await contract.gameIdCounter();
    console.log('Current game ID counter:', count);

    const counter = Number(count);
    console.log('Current game ID counter:', counter);
    return counter;
  } catch (error) {
    console.error('Error fetching game ID counter:', error);
  }
};

// Function to get the treasury address
export const getTreasuryAddress = async () => {
  try {
    const { contract } = await setupContractWithSigner();
    const address = await contract.treasury();
    console.log('Treasury address:', address);
    return address;
  } catch (error) {
    console.error('Error fetching treasury address:', error);
  }
};

// Function to get game details by ID without requiring wallet connection
export const getGameDetailsWithoutWallet = async (gameId: number) => {
  try {
    const game = await publicContract.games(gameId);
    console.log('Game detail:', game);
    return {
      player1: game[0],
      player2: game[1],
      betAmount: ethers.formatUnits(game[2], 18),
      tokenAddress: game[3],
      isCompleted: game[4],
      didPlayer1Win: game[5],
    };
  } catch (error) {
    console.error('Error fetching game details:', error);
    return null;
  }
};
