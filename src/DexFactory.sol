// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;


import {DexPair} from "./DexPair.sol";


/// @title DEX Factory Contract
/// @notice Deploys new trading pairs and keeps a registry of all existing pools.



contract DexFactory{

    //--- State Variables ---

    // A double mapping to easily look up a pair. 
    // Example: getPair[TokenA][TokenB] returns the address of their DexPair contract.


    mapping (address=> mapping(address=>address )) public getPair;


    // An array to keep track of all pairs created by this factory.
    //Example: allPairs[0] gives the address of the first DexPair created, allPairs[1] gives the second, and so on.

    address[] public allPairs; // here the deployed Pool's addresses will be stored !!

    /// @notice Emitted whenever a brand new trading pool is created.
    /// @param token0 The first token in the pair (sorted by address).
    /// @param token1 The second token in the pair (sorted by address).
    /// @param pair The address of the newly deployed DexPair contract.
    /// @param pairLength The total number of pairs that now exist.

    event PairCreated(address indexed token0, address indexed token1, address pair, uint256 pairLength);

    function allPairsLength() external view returns (uint256){

        returns allPairs.length;
    }
    
    /// @notice Deploys a new DexPair contract for two tokens.
    /// @param tokenA The address of the first token.
    /// @param tokenB The address of the second token.
    /// @return pair The address of the newly created DexPair contract.

    function createPair(address tokenA, address tokenB) external returns (address pair){
        require(tokenA != tokenB, "DexFactory: IDENTICAL_ADDRESSES");


        // 1. Sort the tokens
        // We always sort tokens cryptographically (by their hex address) so that 
        // a pool for TokenA/TokenB is the exact same pool as TokenB/TokenA.


        (address token0, address token1)=tokenA<tokenB  ?(tokenA,tokenB): (tokenA, tokenB);
        require(token0 != address(0), "DexFactory: ZERO_ADDRESS");


        // 2. Check if the pair already exists
        // We don't want to fragment liquidity by having two separate pools for the same tokens.
        require(getPair[token0][token1] == address(0), "DexFactory: PAIR_EXISTS");



        // 3. Deploy the new Pair contract
        // The `new` keyword deploys a fresh copy of the DexPair bytecode to the blockchain.
        DexPair newPair = new DexPair();



        // 4. Initialize the newly deployed pair with the two tokens
        newPair.initialize(token0, token1);


        // Grab the address of the newly deployed contract
        pair = address(newPair);

        // 5. Update the registry
        // We populate the mapping in both directions so lookups are easy.
        getPair[token0][token1] = pair;
        getPair[token1][token0] = pair; // Populating the reverse direction
        allPairs.push(pair);



        // 6. Announce the creation to the blockchain
        emit PairCreated(token0, token1, pair, allPairs.length);
        

    }

}




