//SPDX-License-Identifier:MIT

pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {DexFactory} from "./DexFactory.sol";
import {DexPair} from "./DexPair.sol";


/// @title DEX Router Contract
/// @notice The safe entry point for users to add liquidity and execute swaps.

contract DexRouter{
// --- State Variables ---

// The router needs to know where the master Factory is to find the pools.
DexFactory public immutable factory;

// --- Modifiers ---
/// @notice Ensures a transaction doesn't sit in the mempool for too long.

    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "DexRouter: EXPIRED_DEADLINE");
        _;
    }


    // --- Constructor ---

    constructor(address _factory) {
        factory = DexFactory(_factory);
    }


    // --- Core Functions ---


    /// @notice Safely adds liquidity to a pool.
    /// @param tokenA The address of the first token.
    /// @param tokenB The address of the second token.
    /// @param amountADesired The amount of tokenA the user WANTS to deposit.
    /// @param amountBDesired The amount of tokenB the user WANTS to deposit.
    /// @param amountAMin The minimum amount of tokenA they are willing to deposit (Slippage protection).
    /// @param amountBMin The minimum amount of tokenB they are willing to deposit (Slippage protection).
    /// @param to The address that receives the LP tokens.
    /// @param deadline The UNIX timestamp after which this transaction must fail.



    function addLiquidity(
        address tokenA,
        address tokenB,
        uint256 amountADesired,
        uint256 amountBDesired,
        uint256 amountAMin,
        uint256 amountBMin,
        address to,
        uint256 deadline
    ) external ensure(deadline) {
        // 1. Ask the factory if a pool exists. If not, tell the factory to create one!
        if (factory.getPair(tokenA, tokenB) == address(0)) {
            factory.createPair(tokenA, tokenB);
        }

        address pairAddress = factory.getPair(tokenA, tokenB);

        // 2. Transfer the tokens from the user's wallet into the Pair contract.
        // *Note: The user must have called `approve()` on both tokens before calling this!
        IERC20(tokenA).transferFrom(msg.sender, pairAddress, amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, pairAddress, amountBDesired);

        // (In a full production router, optimal amounts are mathematically calculated here 
        // to ensure the user doesn't deposit at the wrong ratio. We are bypassing the 
        // complex math library here for readability).
    }


    /// @notice Safely swaps an exact amount of Token A for Token B.
    /// @param amountIn The exact amount of input tokens the user is spending.
    /// @param amountOutMin The absolute minimum amount of output tokens they will accept.
    /// @param tokenIn The token they are spending.
    /// @param tokenOut The token they are buying.
    /// @param to The address receiving the bought tokens.
    /// @param deadline The time limit for the trade.
    function swapExactTokensForTokens(
        uint256 amountIn,
        uint256 amountOutMin,
        address tokenIn,
        address tokenOut,
        address to,
        uint256 deadline
    ) external ensure(deadline) {
        
        // 1. Find the pool
        address pairAddress = factory.getPair(tokenIn, tokenOut);
        require(pairAddress != address(0), "DexRouter: POOL_DOES_NOT_EXIST");

        // 2. Take the user's money and send it to the pool
        IERC20(tokenIn).transferFrom(msg.sender, pairAddress, amountIn);

        // 3. Calculate how much they should get back (Simplified for example)
        // A production router queries the reserves and does the x*y=k math here.
        // Let's assume the math outputs a variable called `amountOut`.
        uint256 amountOut = 1000; // Mock calculation placeholder
        
        // 4. THE SEATBELT (Slippage Check)
        require(amountOut >= amountOutMin, "DexRouter: INSUFFICIENT_OUTPUT_AMOUNT");

        // 5. Tell the pair to execute the trade
        // We pass 0 for the token we aren't extracting.
        (address token0, ) = tokenIn < tokenOut ? (tokenIn, tokenOut) : (tokenOut, tokenIn);
        
        uint256 amount0Out = tokenIn == token0 ? 0 : amountOut;
        uint256 amount1Out = tokenIn == token0 ? amountOut : 0;

        DexPair(pairAddress).swap(amount0Out, amount1Out, to);
    }
}
