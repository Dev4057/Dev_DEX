// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script, console} from "forge-std/Script.sol";
import {MockERC20} from "../src/MockERC20.sol";
import {DexFactory} from "../src/DexFactory.sol";
import {DexRouter} from "../src/DexRouter.sol";

/// @title DEX Deployment Script
/// @notice Deploys the core DEX infrastructure and mock tokens to a network.
contract DeployDex is Script {
    
    function run() external {
        
        // Start Broadcasting! 
        // By leaving this empty, Foundry automatically uses the --private-key flag from your terminal.
        vm.startBroadcast();

        // --- DEPLOYMENTS ---

        DexFactory factory = new DexFactory();
        console.log("DexFactory deployed to:", address(factory));

        DexRouter router = new DexRouter(address(factory));
        console.log("DexRouter deployed to:", address(router));

        MockERC20 tokenA = new MockERC20("Mock Bitcoin", "mBTC", 1_000_000 * 1e18);
        MockERC20 tokenB = new MockERC20("Mock Ethereum", "mETH", 1_000_000 * 1e18);
        
        console.log("Token A (mBTC) deployed to:", address(tokenA));
        console.log("Token B (mETH) deployed to:", address(tokenB));

        // Stop Broadcasting
        vm.stopBroadcast();
    }
}