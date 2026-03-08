//SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


// 2. The Import Statement: We bring in OpenZeppelin's highly secure, audited ERC20 standard.
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";


/// @title Mock ERC20 Token for DEX Testing
/// @notice This contract creates a basic ERC20 token used strictly for local testing.
/// @dev Inherits from OpenZeppelin's ERC20. Includes an unprotected mint function for easy testing.

contract MockERC20 is ERC20{

        // --- Events ---

    /// @notice Emitted whenever new tokens are minted for testing.
    /// @dev The `indexed` keyword allows off-chain applications to filter logs by these specific addresses.
    /// @param minter The address that called the mint function.
    /// @param to The address that received the newly minted tokens.
    /// @param amount The number of tokens minted.
    event TokensMinted(address indexed minter, address indexed to, uint256 amount);


    /// @notice Deploys the token and mints an initial supply to the deployer.
    /// @param name_ The full name of the token (e.g., "Mock Bitcoin").
    /// @param symbol_ The ticker symbol (e.g., "mBTC").
    /// @param initialSupply_ The amount of tokens to mint immediately upon deployment.

constructor(string memory name_, string memory symbol_, uint256 initialSupply_) ERC20(name_, symbol_) {
        // msg.sender is a global variable representing the address that called this function.
        // During deployment, msg.sender is the address deploying the contract.
        // _mint is an internal OpenZeppelin function that creates new tokens.
        _mint(msg.sender, initialSupply_);
        // Emitting the event for the initial supply minted during deployment
        emit TokensMinted(msg.sender, msg.sender, initialSupply_);
    }

    /// @notice Mints new tokens and assigns them to the specified address.
    /// @param to The address that will receive the newly minted tokens.
    /// @param amount The number of tokens to mint.
    function mint(address to , uint256 amount   ) external {
        _mint(to, amount);

        // 3. The Emit Statement: This writes the log to the blockchain.
        // We use msg.sender to record exactly who triggered this function call.
        emit TokensMinted(msg.sender, to, amount);
    }
}