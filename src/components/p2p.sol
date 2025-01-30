// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract PvpFlipGame is ReentrancyGuard, Ownable {
    mapping(uint256 => Game) public games;
    uint256 public gameIdCounter;

    address public treasury;
    mapping(address => bool) public supportedTokens;
    mapping(address => string) public tokenNames; // New mapping to store token names
    address[] public supportedTokenAddresses;

    uint256[] public gameIds; // Array to store all game IDs

    struct Game {
        address player1;
        address player2;
        uint256 betAmount;
        address tokenAddress;
        bool isCompleted;
        bool player1Choice; // Player 1's choice: false (0) for head, true (1) for tail
    }

    event GameCreated(uint256 gameId, address player1, uint256 betAmount, address tokenAddress, bool player1Choice);
    event GameJoined(uint256 gameId, address player1, address player2, uint256 betAmount, address tokenAddress);
    event GameResolved(uint256 gameId, address winner, uint256 payout, uint256 treasuryAmount);
    event TokenAdded(address tokenAddress, string tokenName); // Event to track token addition
    event TokenRemoved(address tokenAddress); // Event to track token removal

    constructor() {
        treasury = address(this);
    }

    modifier onlyPlayer1(uint256 gameId) {
        require(msg.sender == games[gameId].player1, "Only Player 1 can call this");
        _;
    }

    modifier gameExists(uint256 gameId) {
        require(games[gameId].player1 != address(0), "Game does not exist");
        _;
    }

    modifier gameNotCompleted(uint256 gameId) {
        require(!games[gameId].isCompleted, "Game already completed");
        _;
    }

    modifier tokenSupported(address tokenAddress) {
        require(supportedTokens[tokenAddress], "Token is not supported");
        _;
    }

    // Function to add a supported token and its name
    function addSupportedToken(address tokenAddress, string calldata tokenName) external onlyOwner {
        require(!supportedTokens[tokenAddress], "Token already supported");
        supportedTokens[tokenAddress] = true;
        tokenNames[tokenAddress] = tokenName; // Save the token name
        supportedTokenAddresses.push(tokenAddress);

        emit TokenAdded(tokenAddress, tokenName); // Emit event with the token name
    }

    // Function to remove a supported token
    function removeSupportedToken(address tokenAddress) external onlyOwner {
        require(supportedTokens[tokenAddress], "Token not supported");
        supportedTokens[tokenAddress] = false;
        delete tokenNames[tokenAddress]; // Remove the token name

        // Remove the token from the supportedTokenAddresses array
        for (uint i = 0; i < supportedTokenAddresses.length; i++) {
            if (supportedTokenAddresses[i] == tokenAddress) {
                supportedTokenAddresses[i] = supportedTokenAddresses[supportedTokenAddresses.length - 1];
                supportedTokenAddresses.pop();
                break;
            }
        }

        emit TokenRemoved(tokenAddress); // Emit event when token is removed
    }

    /** 
     * @dev Create a game by Player 1. Player 1 sends their bet and chooses head (0) or tail (1).
     * @param betAmount The bet amount to participate in the game.
     * @param tokenAddress The address of the token Player 1 is using for the bet.
     * @param player1Choice Player 1's choice: false (0) for head, true (1) for tail.
     */
    function createGame(uint256 betAmount, address tokenAddress, bool player1Choice) external tokenSupported(tokenAddress) {
        require(betAmount > 0, "Bet amount must be greater than zero");

        IERC20 token = IERC20(tokenAddress);
        token.transferFrom(msg.sender, treasury, betAmount);

        uint256 gameId = gameIdCounter++;
        games[gameId] = Game({
            player1: msg.sender,
            player2: address(0),
            betAmount: betAmount,
            tokenAddress: tokenAddress,
            isCompleted: false,
            player1Choice: player1Choice
        });

        gameIds.push(gameId); // Add the game ID to the list of all games

        emit GameCreated(gameId, msg.sender, betAmount, tokenAddress, player1Choice);
    }

    /** 
     * @dev Player 2 joins the game. Player 2 implicitly takes the opposite choice of Player 1.
     * @param gameId The game ID to join.
     */
    function joinGame(uint256 gameId) external gameExists(gameId) gameNotCompleted(gameId) {
        Game storage game = games[gameId];
        require(game.player2 == address(0), "Game already has two players"); // Ensure only 1 player is in the game
        require(msg.sender != game.player1, "Player 1 cannot join their own game");

        IERC20 token = IERC20(game.tokenAddress);
        uint256 betAmount = game.betAmount;

        // Player 2 sends the same amount as Player 1's bet
        token.transferFrom(msg.sender, treasury, betAmount);

        // Player 2 is added to the game
        game.player2 = msg.sender;

        // Emit event for game join
        emit GameJoined(gameId, game.player1, msg.sender, betAmount, game.tokenAddress);

        // Automatically resolve the game once Player 2 joins
        resolveGame(gameId);
    }

    /** 
     * @dev Resolve the game and determine the winner based on Player 1's choice.
     * @param gameId The game ID to resolve.
     */
    function resolveGame(uint256 gameId) internal gameExists(gameId) gameNotCompleted(gameId) nonReentrant {
        Game storage game = games[gameId];
        require(game.player2 != address(0), "Game does not have two players");

        // Simulate a coin flip (0 = head, 1 = tail)
        bool coinFlipResult = uint8(block.timestamp % 2) == 1;

        // Determine the winner
        bool didPlayer1Win = (coinFlipResult == game.player1Choice);

        IERC20 token = IERC20(game.tokenAddress);
        uint256 winnerPayout = game.betAmount * 190 / 100; // 1.90x payout
        uint256 treasuryAmount = game.betAmount * 10 / 100; // 0.10x treasury fee

        if (didPlayer1Win) {
            token.transfer(game.player1, winnerPayout);
        } else {
            token.transfer(game.player2, winnerPayout);
        }

        token.transfer(treasury, treasuryAmount);
        game.isCompleted = true;

        emit GameResolved(gameId, didPlayer1Win ? game.player1 : game.player2, winnerPayout, treasuryAmount);
    }

    /** 
     * @dev Allow the owner to withdraw treasury funds.
     * @param tokenAddress The address of the token to withdraw.
     * @param amount The amount to withdraw.
     */
    function withdrawTreasuryFunds(address tokenAddress, uint256 amount) external onlyOwner {
        require(supportedTokens[tokenAddress], "Token not supported");
        IERC20 token = IERC20(tokenAddress);
        require(token.balanceOf(treasury) >= amount, "Insufficient treasury balance");
        token.transfer(msg.sender, amount);
    }

    /** 
     * @dev Returns a list of all supported token addresses.
     * @return The array of supported token addresses.
     */
    function getSupportedTokens() external view returns (address[] memory) {
        return supportedTokenAddresses;
    }

    /** 
     * @dev Returns a list of all game IDs.
     * @return The array of all game IDs.
     */
    function getAllGamesInfo() external view returns (Game[] memory) {
        Game[] memory allGames = new Game[](gameIds.length);
        for (uint256 i = 0; i < gameIds.length; i++) {
            allGames[i] = games[gameIds[i]]; // Fetch game details using the game ID
        }
        return allGames;
    }
}
