// src/constants/contracts.ts

// --- LIVE SEPOLIA ADDRESSES ---
export const ROUTER_ADDRESS = "0x3433132188517D0BD03aB118a810038E2926c439";
export const MBTC_ADDRESS = "0x85b9fB95E90c94672BC5A7ba008c1AA5C5E00E24";
export const METH_ADDRESS = "0x529f6A3503C9438CcA6dF89C2141a103Eb382f7b";

// --- ABIs ---

// The Router ABI (Extracted directly from your Foundry artifacts)
export const ROUTER_ABI = [
  {
    "inputs": [{"internalType": "address","name": "_factory","type": "address"}],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {"internalType": "address","name": "tokenA","type": "address"},
      {"internalType": "address","name": "tokenB","type": "address"},
      {"internalType": "uint256","name": "amountADesired","type": "uint256"},
      {"internalType": "uint256","name": "amountBDesired","type": "uint256"},
      {"internalType": "uint256","name": "amountAMin","type": "uint256"},
      {"internalType": "uint256","name": "amountBMin","type": "uint256"},
      {"internalType": "address","name": "to","type": "address"},
      {"internalType": "uint256","name": "deadline","type": "uint256"}
    ],
    "name": "addLiquidity",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "factory",
    "outputs": [{"internalType": "contract DexFactory","name": "","type": "address"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "uint256","name": "amountIn","type": "uint256"},
      {"internalType": "uint256","name": "amountOutMin","type": "uint256"},
      {"internalType": "address","name": "tokenIn","type": "address"},
      {"internalType": "address","name": "tokenOut","type": "address"},
      {"internalType": "address","name": "to","type": "address"},
      {"internalType": "uint256","name": "deadline","type": "uint256"}
    ],
    "name": "swapExactTokensForTokens",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;

// The standard ERC20 ABI (For reading balances and approving the Router)
export const ERC20_ABI = [
  {
    "inputs": [{"internalType": "address","name": "account","type": "address"}],
    "name": "balanceOf",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "spender","type": "address"},
      {"internalType": "uint256","name": "amount","type": "uint256"}
    ],
    "name": "approve",
    "outputs": [{"internalType": "bool","name": "","type": "bool"}],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {"internalType": "address","name": "owner","type": "address"},
      {"internalType": "address","name": "spender","type": "address"}
    ],
    "name": "allowance",
    "outputs": [{"internalType": "uint256","name": "","type": "uint256"}],
    "stateMutability": "view",
    "type": "function"
  }
] as const;