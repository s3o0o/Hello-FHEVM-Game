// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "fhevm/lib/TFHE.sol";

/**
 * @title PrivateNumberGame
 * @dev A private number guessing game using FHEVM
 * This contract demonstrates:
 * - Encrypted secret number generation
 * - Private guess comparison
 * - Encrypted game state management
 * - Privacy-preserving game logic
 */
contract PrivateNumberGame {
    // Game state
    bool public gameActive;
    address public gameMaster;
    uint256 public gameEndTime;
    uint256 public maxGuesses;
    
    // Encrypted game data
    euint32 private secretNumber;
    euint32 private totalGuesses;
    euint32 private correctGuesses;
    
    // Player tracking
    mapping(address => bool) public hasPlayed;
    mapping(address => euint32) private playerGuesses;
    mapping(address => euint32) private playerResults;
    
    // Events
    event GameStarted(uint256 endTime, uint256 maxGuesses);
    event GuessMade(address indexed player, uint256 timestamp);
    event GameEnded();
    event WinnerRevealed(address winner, uint256 secretNumber);
    
    // Modifiers
    modifier onlyGameMaster() {
        require(msg.sender == gameMaster, "Only game master can perform this action");
        _;
    }
    
    modifier gameActive() {
        require(gameActive, "Game is not active");
        _;
    }
    
    modifier gameEnded() {
        require(!gameActive, "Game is still active");
        _;
    }
    
    constructor() {
        gameMaster = msg.sender;
        gameActive = false;
    }
    
    /**
     * @dev Start a new game with encrypted secret number
     * @param encryptedSecret The encrypted secret number (1-100)
     * @param duration Game duration in seconds
     * @param maxAttempts Maximum guesses per player
     */
    function startGame(
        euint32 encryptedSecret, 
        uint256 duration, 
        uint256 maxAttempts
    ) external onlyGameMaster {
        require(!gameActive, "Game is already active");
        require(duration > 0, "Duration must be positive");
        require(maxAttempts > 0, "Max attempts must be positive");
        
        gameActive = true;
        gameEndTime = block.timestamp + duration;
        maxGuesses = maxAttempts;
        
        // Set encrypted secret number
        secretNumber = encryptedSecret;
        
        // Reset game counters
        totalGuesses = TFHE.asEuint32(0);
        correctGuesses = TFHE.asEuint32(0);
        
        emit GameStarted(gameEndTime, maxGuesses);
    }
    
    /**
     * @dev Make a guess in the encrypted game
     * @param encryptedGuess The encrypted guess (1-100)
     */
    function makeGuess(euint32 encryptedGuess) external gameActive {
        require(block.timestamp < gameEndTime, "Game has ended");
        require(!hasPlayed[msg.sender], "You have already played");
        
        // Store encrypted guess
        playerGuesses[msg.sender] = encryptedGuess;
        hasPlayed[msg.sender] = true;
        
        // Increment total guesses
        totalGuesses = TFHE.add(totalGuesses, TFHE.asEuint32(1));
        
        // Check if guess is correct (encrypted comparison)
        ebool isCorrect = TFHE.eq(encryptedGuess, secretNumber);
        
        // Store encrypted result
        playerResults[msg.sender] = TFHE.select(isCorrect, TFHE.asEuint32(1), TFHE.asEuint32(0));
        
        // Increment correct guesses if this guess is correct
        euint32 correctIncrement = TFHE.select(isCorrect, TFHE.asEuint32(1), TFHE.asEuint32(0));
        correctGuesses = TFHE.add(correctGuesses, correctIncrement);
        
        emit GuessMade(msg.sender, block.timestamp);
    }
    
    /**
     * @dev End the game and reveal results
     */
    function endGame() external onlyGameMaster {
        require(gameActive, "Game is not active");
        require(block.timestamp >= gameEndTime, "Game has not ended yet");
        
        gameActive = false;
        emit GameEnded();
    }
    
    /**
     * @dev Get encrypted secret number
     * @return The encrypted secret number
     */
    function getSecretNumber() external view returns (euint32) {
        return secretNumber;
    }
    
    /**
     * @dev Get encrypted total guesses count
     * @return The encrypted total guesses
     */
    function getTotalGuesses() external view returns (euint32) {
        return totalGuesses;
    }
    
    /**
     * @dev Get encrypted correct guesses count
     * @return The encrypted correct guesses
     */
    function getCorrectGuesses() external view returns (euint32) {
        return correctGuesses;
    }
    
    /**
     * @dev Get player's encrypted guess
     * @param player The player address
     * @return The encrypted guess
     */
    function getPlayerGuess(address player) external view returns (euint32) {
        return playerGuesses[player];
    }
    
    /**
     * @dev Get player's encrypted result
     * @param player The player address
     * @return The encrypted result (1 if correct, 0 if wrong)
     */
    function getPlayerResult(address player) external view returns (euint32) {
        return playerResults[player];
    }
    
    /**
     * @dev Check if a player has played
     * @param player The player address
     * @return True if player has played
     */
    function hasPlayerPlayed(address player) external view returns (bool) {
        return hasPlayed[player];
    }
    
    /**
     * @dev Get game information
     * @return active Whether the game is active
     * @return endTime The game end time
     * @return timeRemaining Time remaining in seconds
     * @return maxAttempts Maximum guesses allowed
     */
    function getGameInfo() external view returns (
        bool active, 
        uint256 endTime, 
        uint256 timeRemaining, 
        uint256 maxAttempts
    ) {
        active = gameActive;
        endTime = gameEndTime;
        timeRemaining = gameActive && block.timestamp < gameEndTime ? 
                       gameEndTime - block.timestamp : 0;
        maxAttempts = maxGuesses;
    }
    
    /**
     * @dev Check if game has ended
     * @return True if game has ended
     */
    function isGameEnded() external view returns (bool) {
        return !gameActive || block.timestamp >= gameEndTime;
    }
    
    /**
     * @dev Get game master address
     * @return The game master address
     */
    function getGameMaster() external view returns (address) {
        return gameMaster;
    }
}
