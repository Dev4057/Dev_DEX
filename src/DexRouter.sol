//SPDX-License-Identifier:MIT
pragma solidity ^0.8.19;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {DexFactory} from "./DexFactory.sol";
import {DexPair} from "./DexPair.sol";

/// @title DEX Router Contract
/// @notice The safe entry point for users to add liquidity and execute swaps.
contract DexRouter{
    
    // --- State Variables ---
    DexFactory public immutable factory;

    // --- Modifiers ---
    modifier ensure(uint256 deadline) {
        require(deadline >= block.timestamp, "DexRouter: EXPIRED_DEADLINE");
        _;
    }

    // --- Constructor ---
    constructor(address _factory) {
        factory = DexFactory(_factory);
    }

    // --- Core Functions ---

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
        if (factory.getPair(tokenA, tokenB) == address(0)) {
            factory.createPair(tokenA, tokenB);
        }

        address pairAddress = factory.getPair(tokenA, tokenB);

        IERC20(tokenA).transferFrom(msg.sender, pairAddress, amountADesired);
        IERC20(tokenB).transferFrom(msg.sender, pairAddress, amountBDesired);

        DexPair(pairAddress).mint(to);
    }

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

        uint256 amountOut;
        
       // --- MEMORY SCOPE START ---
        {
            (address token0, ) = tokenIn < tokenOut ? (tokenIn, tokenOut) : (tokenOut, tokenIn);
            
            // THE FIX: We call the native public variables instead of getReserves()
            // because the live V1 Pair on Sepolia doesn't have the helper function!
            uint256 reserve0 = DexPair(pairAddress).reserve0();
            uint256 reserve1 = DexPair(pairAddress).reserve1();
            
            (uint256 reserveIn, uint256 reserveOut) = tokenIn == token0 ? (reserve0, reserve1) : (reserve1, reserve0);

            require(reserveIn > 0 && reserveOut > 0, "DexRouter: INSUFFICIENT_LIQUIDITY");

            // Calculate true output using x * y = k (with 0.3% fee)
            uint256 amountInWithFee = amountIn * 997;
            amountOut = (amountInWithFee * reserveOut) / ((reserveIn * 1000) + amountInWithFee);
        }
        // --- MEMORY SCOPE END ---
        // 3. The Seatbelt (Slippage Check)
        require(amountOut >= amountOutMin, "DexRouter: INSUFFICIENT_OUTPUT_AMOUNT");

        // 4. Tell the pair to execute the trade
        // We calculate amount0Out and amount1Out directly inside the function call 
        // to save even more memory space.
        DexPair(pairAddress).swap(
            tokenIn < tokenOut ? 0 : amountOut, 
            tokenIn < tokenOut ? amountOut : 0, 
            to
        );
    }
}