// src/FlipGame.ts

import { ethers } from 'ethers';
import { ABI, ADDRESS } from '../contracts/Contrac';

export const SUPPORTED_TOKENS = {
  STABLEAI: '0x07F41412697D14981e770b6E335051b1231A2bA8',
  DIG: '0x208561379990f106E6cD59dDc14dFB1F290016aF',
  WEB9: '0x09CA293757C6ce06df17B96fbcD9c5f767f4b2E1',
  BNKR: '0x22aF33FE49fD1Fa80c7149773dDe5890D3c76F3b',
  FED: '0x19975a01B71D4674325bd315E278710bc36D8e5f',
  TestToken: '0x54939A9F8084b6D3362BD987dE7E0CD2e96462DC',
};

// Set up provider and contract for public access (read-only)
export const publicProvider = new ethers.JsonRpcProvider(
  'https://base-mainnet.infura.io/v3/b17a040a14bc48cfb3928a73d26f3617'
);
export const publicContract = new ethers.Contract(ADDRESS, ABI, publicProvider);

// Function to set up signer and contract for wallet interaction
async function setupContractWithSigner() {
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(ADDRESS, ABI, signer);
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

    console.log('Token contract:', tokenContract);
    // Convert betAmount to the correct token decimals (18 decimals)
    const betAmountInWei = ethers.parseUnits(betAmount, 18);
console.log('betAmountInWei:', betAmountInWei.toString());
    // Step 1: Check Player 1's balance to make sure they have enough tokens
    const balance = await tokenContract.balanceOf(await signer.getAddress());
    console.log('Player balance:', balance.toString());  // Log the balance to check if it returns a BigInt
console.log('balance:', balance.toString());

    if (balance < (betAmountInWei)) {
      const errorMessage = 'Not enough tokens to create game';
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Step 2: Approve the contract to spend the tokens
    const approveTx = await tokenContract.approve(ADDRESS, betAmountInWei);
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

// Join an existing game
export const joinGame = async (gameId: number) => {
  try {
    console.log('Attempting to join game with ID:', gameId);

    // Set up contract with signer
    const { signer, contract } = await setupContractWithSigner();

    console.log('Contract:', contract);
    console.log('Signer:', signer);

    // Fetch game details
    const game = await contract.games(gameId);
    console.log('Fetched game details:', game);

    // Check if the game has already been completed
    if (game.isCompleted) {
      console.log(`Game with ID ${gameId} has already been completed.`);
      alert('Game has already been completed.');
      return;
    }

    // Create token contract instance
    const tokenContract = new ethers.Contract(game.tokenAddress, [
      'function approve(address spender, uint256 amount) public returns (bool)',
      'function balanceOf(address owner) public view returns (uint256)',
    ], signer);

    // Step 1: Check Player 2's balance to make sure they have enough tokens
    const balance = await tokenContract.balanceOf(await signer.getAddress());
    console.log('Player balance main:', balance);

    // Fetch the player's balance using the provider
    const playerAddress = await signer.getAddress();
    console.log('Player address:', playerAddress);

    const playerBalance = await signer.provider.getBalance(playerAddress);
    console.log('Player balance:', playerBalance.toString());

    console.log('game.betAmount:', game.betAmount);

    if (balance < game.betAmount) {
      console.log(`Player does not have enough balance to join the game.`);
      alert('You do not have enough balance to join the game.');
      return;
    }

    // Step 2: Approve the contract to spend the tokens
    const approveTx = await tokenContract.approve(ADDRESS, game.betAmount);
    await approveTx.wait();
    console.log('Token approved successfully.');

    // Step 3: Get the current nonce
    const currentNonce = await signer.getNonce();
    console.log('Current nonce:', currentNonce);




    // Send the transaction to join the game
    const tx = await contract.joinGame(gameId, { nonce: currentNonce });

    const currentTime = Math.floor(Date.now() / 1000); // Convert to seconds
const timeElapsed = currentTime - tx.startTime;

if (timeElapsed < 20) {
  alert(`Wait for ${20 - timeElapsed} more seconds before joining.`);
  return;
}
    const receipt = await tx.wait();
     console.log('Transaction sent! Hash:', tx.hash);
    if (receipt.status === 1) {
      console.log(`Successfully joined game with ID: ${gameId}`);
      alert(`Successfully joined game with ID: ${gameId}`);
    } else {
      console.log(`Transaction failed for Game ID: ${gameId}`);
      alert(`Transaction failed for Game ID: ${gameId}`);
    }
  } catch (error) {
    console.error('Error joining game:', error);
    alert('An error occurred. Check the console for details.');
  }
};


// Function to cancel a game by its gameId
export async function cancelGame(gameId: number) {
  try {
     // Set up contract with signer
     const { signer, contract } = await setupContractWithSigner();
     console.log('Signer:', signer);

    // Call the cancelGame function on the smart contract
    const tx = await contract.cancelGame(gameId);
    
    // Wait for the transaction to be mined
    const receipt = await tx.wait();
    
    console.log('Game cancelled successfully:', receipt);
    return receipt;
  } catch (error) {
    console.error('Error cancelling the game:', error);
    throw error;
  }
}

