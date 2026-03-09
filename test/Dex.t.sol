// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// 1. Import the Foundry Standard Library (gives us testing utilities and cheatcodes)
import {Test, console} from "forge-std/Test.sol";

// 2. Import all the contracts we just built in the src/ folder
import {MockERC20} from "../src/MockERC20.sol";
import {DexFactory} from "../src/DexFactory.sol";
import {DexRouter} from "../src/DexRouter.sol";
import {DexPair} from "../src/DexPair.sol";

/// @title DEX End-to-End Test Suite
contract DexTest is Test {
    
    // --- State Variables ---

    // We declare our contract variables at the contract level so all test functions can access them
    DexFactory factory;
    DexRouter router;
    MockERC20 tokenA;
    MockERC20 tokenB;

    // Foundry Cheatcode: `makeAddr` creates a dummy wallet address with a specific label 
    // so our console logs are easy to read (e.g., it will say "alice" instead of "0x123...")
    address alice = makeAddr("alice");
    address bob = makeAddr("bob");

    // --- The Setup Phase ---

    /// @notice setUp() runs exactly ONCE before every single test function.
    /// @dev Think of this as resetting the entire blockchain to a clean slate.
    function setUp() public {
        
        // 1. Deploy the Master Infrastructure
        factory = new DexFactory();
        router = new DexRouter(address(factory));

        // 2. Deploy the Mock Tokens (Minting 1 million of each to the test contract itself)
        // We multiply by 1e18 because standard ERC-20 tokens have 18 decimal places.
        tokenA = new MockERC20("Token A", "TKNA", 1_000_000 * 1e18);
        tokenB = new MockERC20("Token B", "TKNB", 1_000_000 * 1e18);

        // 3. Fund our test users! (Alice and Bob)
        // We use the custom mint function we wrote to give them each 10,000 tokens
        tokenA.mint(alice, 10_000 * 1e18);
        tokenB.mint(alice, 10_000 * 1e18);
        
        tokenA.mint(bob, 10_000 * 1e18);
        tokenB.mint(bob, 10_000 * 1e18);
    }

    // --- The Tests ---

    /// @notice A basic test to ensure our setUp phase worked perfectly.
    /// @dev All test functions MUST start with the word "test" (e.g., test_NameOfTest).
    function test_InitialDeploymentAndFunding() public {
        
        // 1. Assert that Alice got her money
        // assertEq checks if the first value equals the second value. If not, the test fails.
        assertEq(tokenA.balanceOf(alice), 10_000 * 1e18);
        assertEq(tokenB.balanceOf(alice), 10_000 * 1e18);

        // 2. Assert that the Factory deployed with zero existing pairs
        assertEq(factory.allPairsLength(), 0);

        // 3. Assert that the Router correctly linked to the Factory
        assertEq(address(router.factory()), address(factory));
        
        // Use console.log to print variables to the terminal during the test!
        console.log("Alice's Token A Balance:", tokenA.balanceOf(alice));
    }
    /// @notice Tests if Alice can successfully create a pool and add liquidity.
    function test_AliceAddsLiquidity() public {
        
        uint256 amountA = 1000 * 1e18;
        uint256 amountB = 1000 * 1e18;

        // 1. Start the Prank! The blockchain now thinks "msg.sender" is Alice.
        vm.startPrank(alice);

        // 2. The Approval (Crucial Step)
        // Alice MUST approve the Router to take her tokens before she calls addLiquidity.
        tokenA.approve(address(router), amountA);
        tokenB.approve(address(router), amountB);

        // 3. Add Liquidity
        // She deposits 1000 of Token A and 1000 of Token B. 
        // We pass 0 for the minimums since we aren't testing slippage yet.
        // We set the deadline to 'block.timestamp' so it doesn't expire.

        router.addLiquidity(
            address(tokenA),
            address(tokenB),
            amountA,
            amountB,
            0,
            0,
            alice,
            block.timestamp
        );

        // 4. Stop the Prank
        vm.stopPrank();

        // --- The Assertions (Did it work?) ---

        // Verify the Factory actually created the pool
        assertEq(factory.allPairsLength(), 1);

        // Get the address of the newly created pair
        address newPairAddress = factory.getPair(address(tokenA), address(tokenB));
        
        // Ensure it's not the zero address
        assertTrue(newPairAddress != address(0));

        // Verify the pool actually received Alice's money
        assertEq(tokenA.balanceOf(newPairAddress), amountA);
        assertEq(tokenB.balanceOf(newPairAddress), amountB);

        // Verify Alice's balance went down
        assertEq(tokenA.balanceOf(alice), 9_000 * 1e18); // She started with 10k, spent 1k
    }


    /// @notice Tests the core AMM math by having Bob execute a swap.
    function test_BobSwapsTokens() public {
        
        // --- 1. Setup Phase: Alice Funds the Pool ---
        uint256 initialLiquidity = 1000 * 1e18;
        
        vm.startPrank(alice);
        tokenA.approve(address(router), initialLiquidity);
        tokenB.approve(address(router), initialLiquidity);
        router.addLiquidity(
            address(tokenA), 
            address(tokenB), 
            initialLiquidity, 
            initialLiquidity, 
            0, 
            0, 
            alice, 
            block.timestamp
        );
        vm.stopPrank();

        // --- 2. Bob Prepares for the Trade ---
        // Find the pool Alice just created
        address pairAddress = factory.getPair(address(tokenA), address(tokenB));
        DexPair pair = DexPair(pairAddress);
        
        // Bob wants to trade 100 Token A. 
        uint256 swapAmountIn = 100 * 1e18; 
        
        // Because of the x * y = k curve, adding 10% more Token A means he can't get exactly 
        // 100 Token B back. Mathematically, he can safely extract 90 Token B without breaking the constant.
        uint256 expectedOut = 90 * 1e18;   

        // --- 3. Bob Executes the Trade ---
        vm.startPrank(bob);
        
        // Step A: Bob sends his 100 Token A directly to the pool
        tokenA.transfer(pairAddress, swapAmountIn);
        
        // Step B: We figure out which token is token0 and which is token1 (since the Factory sorts them)
        (address token0,) = address(tokenA) < address(tokenB) ? (address(tokenA), address(tokenB)) : (address(tokenB), address(tokenA));
        
        // Step C: Bob asks for 0 of the token he sent in, and 90 of the token he wants out
        uint256 amount0Out = address(tokenA) == token0 ? 0 : expectedOut;
        uint256 amount1Out = address(tokenA) == token0 ? expectedOut : 0;

        // Trigger the swap! The pair contract will calculate:
        // (1000 + 100) * (1000 - 90) = 1,001,000. 
        // Since 1,001,000 is >= 1,000,000 (the original k), the trade succeeds!
        pair.swap(amount0Out, amount1Out, bob);
        
        vm.stopPrank();

        // --- 4. The Assertions (Did Bob get his money?) ---
        
        // Bob started with 10k. He should now have 10,090 Token B.
        assertEq(tokenB.balanceOf(bob), (10_000 * 1e18) + expectedOut);
        
        // Bob started with 10k. He spent 100. He should now have 9,900 Token A.
        assertEq(tokenA.balanceOf(bob), (10_000 * 1e18) - swapAmountIn);
    }
}