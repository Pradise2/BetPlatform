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
    if (balance < (betAmountInUnits)) {
      throw new Error('Not enough tokens to join game');
    }

    // Step 2: Approve the contract to spend the tokens
    const approveTx = await tokenContract.approve(FLIP_GAME_ADDRESS, betAmountInUnits);
    await approveTx.wait();
    console.log('Token approved successfully.');

    // Step 3: Proceed with the transaction if the bet amounts match
    const tx = await contract.joinGame(gameId, betAmountInUnits);
    await tx.wait();
    console.log('Game joined successfully');
  } catch (error) {
    console.error('Error joining game:', error);
    handleContractError(error as ContractError);
  }
};