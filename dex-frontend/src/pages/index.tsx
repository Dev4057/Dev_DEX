"use client";

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useBalance } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { MBTC_ADDRESS, METH_ADDRESS, ROUTER_ADDRESS, ERC20_ABI, ROUTER_ABI } from '../constants/contracts';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: hash, writeContractAsync } = useWriteContract();

  // --- STATE ---
  const [payAmount, setPayAmount] = useState('');
  const [isSwapped, setIsSwapped] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false); // DARK MODE STATE

  // --- DARK MODE LOGIC ---
  useEffect(() => {
    // Check local storage or system preference on load
    const savedMode = localStorage.getItem('theme');
    if (savedMode === 'dark' || (!savedMode && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

const toggleDarkMode = () => {
    // Calculate the exact opposite of whatever mode we are in right now
    const newMode = !isDarkMode;
    
    // Force the HTML class and LocalStorage to match our new mode
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
    
    // Finally, tell React to update the Sun/Moon UI
    setIsDarkMode(newMode);
  };

  // --- DYNAMIC DATA ---
  const tokenIn = isSwapped ? METH_ADDRESS : MBTC_ADDRESS;
  const tokenOut = isSwapped ? MBTC_ADDRESS : METH_ADDRESS;
  const tokenInSymbol = isSwapped ? 'mETH' : 'mBTC';
  const tokenOutSymbol = isSwapped ? 'mBTC' : 'mETH';

  // --- BALANCES ---
  const { data: btcBalance, refetch: refetchBtc } = useBalance({
    address, token: MBTC_ADDRESS, query: { enabled: !!address, refetchInterval: 3000 }
  });

  const { data: ethBalance, refetch: refetchEth } = useBalance({
    address, token: METH_ADDRESS, query: { enabled: !!address, refetchInterval: 3000 }
  });

  // --- TRANSACTION WATCHER ---
  const { isLoading: isWaitingForBlock, isSuccess: txSuccess } = useWaitForTransactionReceipt({ hash, confirmations: 1 });

  useEffect(() => {
    if (txSuccess) {
      refetchBtc();
      refetchEth();
      setPayAmount('');
      setIsProcessing(false);
    }
  }, [txSuccess, refetchBtc, refetchEth]);

  const formatBalance = (val: string | undefined) => {
    if (!val) return "0.00";
    return Number(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 });
  };

  const displayPayBalance = isSwapped ? formatBalance(ethBalance?.formatted) : formatBalance(btcBalance?.formatted);
  const displayReceiveBalance = isSwapped ? formatBalance(btcBalance?.formatted) : formatBalance(ethBalance?.formatted);

  const handleToggleSwap = () => {
    setIsSwapped(!isSwapped);
    setPayAmount('');
  };

  const handleSwap = async () => {
    if (!payAmount || isNaN(Number(payAmount)) || Number(payAmount) <= 0) return;
    try {
      setIsProcessing(true);
      const amountInWei = parseUnits(payAmount, 18);
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      await writeContractAsync({
        address: ROUTER_ADDRESS,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [amountInWei, BigInt(0), tokenIn, tokenOut, address as `0x${string}`, deadline],
      });
    } catch (e) {
      console.error("Swap error:", e);
      setIsProcessing(false);
    }
  };

  return (

    <div className="min-h-screen bg-[#F9F9F8] dark:bg-[#0A0A0A] text-[#1C1C1C] dark:text-[#F2F2F2] font-sans antialiased transition-colors duration-300">
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black dark:bg-white rounded-full flex items-center justify-center transition-colors">
            <div className="w-2 h-2 bg-white dark:bg-black rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Dev_DEX</h1>
        </div>
        
        <div className="flex items-center gap-4">
          {/* THEME TOGGLE BUTTON */}
          <button 
            onClick={toggleDarkMode} 
            className="p-2.5 rounded-full bg-white dark:bg-[#1A1A1A] border border-[#EBEBEB] dark:border-[#2A2A2A] shadow-sm hover:scale-110 active:scale-95 transition-all text-[#7D7D7D] dark:text-[#A0A0A0]"
          >
            {isDarkMode ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>
            )}
          </button>
          
          <ConnectButton accountStatus="avatar" showBalance={false} />
        </div>
      </header>

      <main className="flex flex-col items-center justify-center pt-24 px-4">
        <div className="w-full max-w-[440px] bg-white dark:bg-[#121212] rounded-[2.5rem] p-3 shadow-sm border border-[#F2F2F2] dark:border-[#262626] transition-colors">
          <div className="px-4 py-2 mb-2"><h2 className="text-xs font-bold uppercase text-[#A0A0A0] dark:text-[#555]">Swap</h2></div>

          {/* INPUT PAY */}
          <div className="bg-[#F9F9F8] dark:bg-[#1A1A1A] rounded-[2rem] p-5 mb-1.5 border border-transparent focus-within:border-[#EAEAEA] dark:focus-within:border-[#333] transition-colors">
            <div className="flex justify-between mb-4 text-xs font-semibold text-[#7D7D7D] dark:text-[#888]">
              <span>YOU PAY</span>
              <span>BALANCE: {displayPayBalance}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <input type="text" placeholder="0" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-transparent text-4xl outline-none w-full font-medium placeholder:text-[#D4D4D4] dark:placeholder:text-[#444]" />
              <div className="bg-white dark:bg-[#262626] px-4 py-2 rounded-2xl shadow-sm font-bold flex items-center gap-2 border border-[#EBEBEB] dark:border-[#333] transition-colors">
                <span className={isSwapped ? "text-blue-500" : "text-orange-500"}>{isSwapped ? "Ξ" : "₿"}</span>
                {tokenInSymbol}
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-5 relative z-10">
            <button onClick={handleToggleSwap} className="bg-white dark:bg-[#262626] p-3 rounded-2xl border border-[#EBEBEB] dark:border-[#333] shadow-sm hover:rotate-180 transition-all duration-500 text-[#1C1C1C] dark:text-white">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10l5 5 5-5M7 14l5-5 5 5"/></svg>
            </button>
          </div>

          {/* INPUT RECEIVE */}
          <div className="bg-[#F9F9F8] dark:bg-[#1A1A1A] rounded-[2rem] p-5 mt-1.5 border border-transparent transition-colors">
            <div className="flex justify-between mb-4 text-xs font-semibold text-[#7D7D7D] dark:text-[#888]">
              <span>YOU RECEIVE</span>
              <span>BALANCE: {displayReceiveBalance}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <input type="text" placeholder="0" value={payAmount} readOnly className="bg-transparent text-4xl outline-none w-full font-medium opacity-40" />
              <div className="bg-white dark:bg-[#262626] px-4 py-2 rounded-2xl shadow-sm font-bold flex items-center gap-2 border border-[#EBEBEB] dark:border-[#333] transition-colors">
                <span className={!isSwapped ? "text-blue-500" : "text-orange-500"}>{!isSwapped ? "Ξ" : "₿"}</span>
                {tokenOutSymbol}
              </div>
            </div>
          </div>

          <button 
            onClick={handleSwap} 
            disabled={isProcessing || isWaitingForBlock || !payAmount || !isConnected} 
            className={`w-full rounded-[1.5rem] py-5 mt-3 font-bold text-lg transition-all
              ${(!isConnected || !payAmount) ? "bg-[#EAEAEA] dark:bg-[#262626] text-[#A0A0A0] dark:text-[#555]" : 
                (isProcessing || isWaitingForBlock) ? "bg-[#4D4D4D] text-white cursor-wait" : 
                "bg-[#1C1C1C] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-200"}
            `}
          >
            {!isConnected ? "Connect Wallet" : 
             (isProcessing || isWaitingForBlock) ? "Updating Blockchain..." : "Swap Tokens"}
          </button>
        </div>
        
        {/* Success Message popup */}
        {txSuccess && (
          <div className="mt-6 text-sm font-semibold text-green-500 dark:text-green-400 animate-pulse flex items-center gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
            Swap Confirmed On-Chain!
          </div>
        )}
      </main>
    </div>
  );
}