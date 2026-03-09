//SPDX_License-Identifier:MIT

pragma solidity ^0.8.19;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";


/// @title DEX Pair Contract (Liquidity Pool)
/// @notice Handles the swapping of two specific tokens and mints LP tokens to liquidity providers.
/// @dev Inherits ERC20 because the pool itself issues "LP Tokens" as receipts for deposits.


contract DexPair is ERC20{

    // --- State Variables ---

    // The two tokens that this pool will allow users to swap between.
    address public token0;
    address public token1;

    // The internal balances of the tokens currently sitting in the pool.
    // We track these internally rather than just calling `balanceOf` to prevent certain types of manipulation.


    uint256 public reserve0;
    uint256 public reserve1;

    // --- Events ---
    event Mint(address indexed sender, uint256 amount0, uint256 amount1);
    event Burn(address indexed sender, uint256 amount0, uint256 amount1, address indexed to);
    event Swap(
        address indexed sender,
        uint256 amount0In,
        uint256 amount1In,
        uint256 amount0Out,
        uint256 amount1Out,
        address indexed to
    );



    // --- Initialization ---

    /// @notice We pass "DEX LP Token" to the OpenZeppelin ERC20 constructor.
    // Explaination of the below constructor:
    // 1. The `constructor` is a special function that runs once when the contract is deployed. It's used to set up initial state and configurations.
    // 2. `ERC20("DEX LP Token", "DEX-LP")` is calling the constructor of the parent ERC20 contract from OpenZeppelin. This initializes our contract as an ERC20 token with the name "
    // 3. DEX LP Token" and the symbol "DEX-LP". This means that our contract will have all the standard ERC20 functionality (like `transfer`, `balanceOf`, etc.) and will represent shares of the liquidity pool.
    // 4. By inheriting from ERC20 and calling its constructor, we ensure that our DEX Pair contract can mint and manage LP tokens that represent users' shares in the liquidity pool. This is essential for tracking how much of the pool each liquidity provider owns and for allowing them to redeem their shares later on.
    constructor() ERC20("DEX LP Token", "DEX-LP") {}



    /// @notice Sets up the pool with its two trading pairs. 
    /// @dev This is called ONCE by the Factory contract right after deployment.
    function initialize(address _token0, address _token1) external {
        require(token0 == address(0) && token1 == address(0), "DexPair: ALREADY_INITIALIZED");
        token0 = _token0;
        token1 = _token1;
    }




    // --- Core AMM Logic ---
    /// @notice Updates the internal reserves after a deposit, withdrawal, or swap.
    function _update(uint256 balance0, uint256 balance1) private{
        reserve0=balance0;
        reserve1=balance1;
    }


    /// @notice The core trading function. Takes one token and gives the user the other.
    /// @param amount0Out The amount of token0 the user wants to take OUT of the pool.
    /// @param amount1Out The amount of token1 the user wants to take OUT of the pool

    function swap (uint256 amount0Out, uint256 amount1Out, address to) external{
        require (amount0Out>0 || amount1Out>0, "DexPair: INSUFFICIENT_OUTPUT_AMOUNT");
        require (amount0Out<reserve0 && amount1Out<reserve1, "DexPair: INSUFFICIENT_LIQUIDITY");

        // 1. Send the requested tokens to the user

        if(amount0Out>0) IERC20(token0).transfer(to,amount0Out);
        if(amount1Out>0) IERC20(token1).transfer(to, amount1Out);



        // 2. Figure out how many tokens the user sent IN to pay for this swap
        uint256 balance0 = IERC20(token0).balanceOf(address(this));
        uint256 balance1 = IERC20(token1).balanceOf(address(this));

        // Explaination of the below calculations:
        // 1. We calculate `amount0In` and `amount1In` by
        // comparing the current balances of the tokens in the contract (`balance0` and `balance1`) with the reserves before the swap (`reserve0` and `reserve1`) minus the amounts sent out (`amount0Out` and `amount1Out`).
        uint256 amount0In = balance0 > reserve0 - amount0Out ? balance0 - (reserve0 - amount0Out) : 0;
        uint256 amount1In = balance1 > reserve1 - amount1Out ? balance1 - (reserve1 - amount1Out) : 0;
        require(amount0In > 0 || amount1In > 0, "DexPair: INSUFFICIENT_INPUT_AMOUNT");
    

    // 3. THE CONSTANT PRODUCT FORMULA (x * y = k)
        // We ensure the new balances multiplied together are >= the old reserves multiplied together.
        // *Note: In a production DEX, a 0.3% fee is deducted here before the math is checked.
        require(balance0 * balance1 >= reserve0 * reserve1, "DexPair: K_CONSTANT_FAILED");

    // 4. Update the internal reserves to match the new balances
        _update(balance0, balance1);

        emit Swap(msg.sender, amount0In, amount1In, amount0Out, amount1Out, to);
    }
}




//Total explaination of this contract :

/**

 */