# 🌊 Dev_dex | Full-Stack Decentralized Exchange

**Dev_dex** is a minimalist, high-performance Decentralized Exchange (DEX) built on the Ethereum Sepolia Testnet. It features a custom Automated Market Maker (AMM) engine, a professional-grade Foundry development suite, and a sleek, responsive React frontend.

---

## 🚀 Live Demo
- **Network:** Sepolia Testnet
- **Router Address:** `0x3433132188517D0BD03aB118a810038E2926c439`
---

## ✨ Features

### 🛠 Smart Contracts (Solidity)
- **AMM Core:** Constant Product Market Maker ($x \cdot y = k$) logic for automated swaps.
- **Factory & Router Pattern:** Industry-standard architecture (similar to Uniswap V2) for managing liquidity pools and routing trades.
- **Liquidity Provision:** Integrated "Add Liquidity" functions that mint LP tokens to providers.
- **Security:** Built using OpenZeppelin standards for robust, audited ERC-20 mock tokens.

### 💻 Frontend (Next.js & Tailwind)
- **RainbowKit & Wagmi:** Seamless wallet connection (MetaMask, WalletConnect, Coinbase).
- **Real-time State:** Automatic balance refetching (every 2 seconds) and transaction tracking via `useWaitForTransactionReceipt`.
- **Responsive UI:** A minimalist "Alabaster" design optimized for both desktop and mobile web3 browsers.
- **Slippage Protection:** Integrated deadline checks to ensure transaction security.

---

## 🏗 Tech Stack

- **Backend:** Solidity, Foundry (Forge/Cast)
- **Frontend:** Next.js 14, TypeScript, Tailwind CSS
- **Web3:** Wagmi, Viem, RainbowKit
- **Network:** Ethereum Sepolia Testnet

---

## 🛠 Installation & Setup

### Prerequisites
- [Foundry](https://book.getfoundry.sh/getting-started/installation)
- [Node.js v18+](https://nodejs.org/)
- A Sepolia RPC URL (Infura/Alchemy)

### 1. Backend Setup
```bash
# Install Foundry dependencies
forge install

# Run Tests
forge test -vv

```

### 2. Frontend Setup

```bash
cd dex-frontend
npm install
npm run dev

```

---

## 📜 Deployment History

| Contract | Address |
| --- | --- |
| **DexRouter** | `0x3433132188517D0BD03aB118a810038E2926c439` |
| **DexFactory** | `0xe21bd00b203cf8fff4b77939e7424bd02af12881` |
| **Mock Bitcoin (mBTC)** | `0x85b9fB95E90c94672BC5A7ba008c1AA5C5E00E24` |
| **Mock Ethereum (mETH)** | `0x529f6A3503C9438CcA6dF89C2141a103Eb382f7b` |

---

## 🤝 Contributing

This project was built for educational purposes. Feel free to fork it, submit PRs, or use it as a boilerplate for your own AMM experiments!

---

## 📄 License

MIT License - Copyright (c) 2026 Devang Gandhi

```

---

### Tips for your GitHub Profile:
1.  **Screenshots:** Take a high-quality screenshot of your finished UI and place it right under the main title. This makes people want to scroll down!
2.  **The "Cast" Commands:** You can actually add a section in the README titled "CLI Interactions" and paste those `cast` commands we used to check balances. It shows you know how to use the command line, which is a huge "plus" for senior developers.


```