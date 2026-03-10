"use client";

import { useState } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { MBTC_ADDRESS, METH_ADDRESS, ROUTER_ADDRESS, ERC20_ABI, ROUTER_ABI } from '../constants/contracts';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: hash, writeContractAsync } = useWriteContract();

  // --- STATE ---
  const [payAmount, setPayAmount] = useState('');
  const [isSwapped, setIsSwapped] = useState(false); // false: BTC->ETH, true: ETH->BTC
  const [isProcessing, setIsProcessing] = useState(false);

  // --- DYNAMIC DATA ---
  const tokenIn = isSwapped ? METH_ADDRESS : MBTC_ADDRESS;
  const tokenOut = isSwapped ? MBTC_ADDRESS : METH_ADDRESS;
  const tokenInSymbol = isSwapped ? 'mETH' : 'mBTC';
  const tokenOutSymbol = isSwapped ? 'mBTC' : 'mETH';

  // --- AUTOMATIC BALANCE REFRESH (Every 2 Seconds) ---
  const { data: btcBalance, refetch: refetchBtc } = useReadContract({
    address: MBTC_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { refetchInterval: 2000 } // <--- Force UI refresh
  });

  const { data: ethBalance, refetch: refetchEth } = useReadContract({
    address: METH_ADDRESS,
    abi: ERC20_ABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
    query: { refetchInterval: 2000 } // <--- Force UI refresh
  });

  const format = (data: any) => data ? Number(formatUnits(data, 18)).toLocaleString(undefined, { maximumFractionDigits: 4 }) : "0.00";
  
  const displayPayBalance = isSwapped ? format(ethBalance) : format(btcBalance);
  const displayReceiveBalance = isSwapped ? format(btcBalance) : format(ethBalance);

  // --- WATCH FOR SUCCESS ---
  const { isLoading: isWaitingForBlock } = useWaitForTransactionReceipt({ hash });

  // --- LOGIC ---
  const handleToggle = () => {
    setIsSwapped(!isSwapped);
    setPayAmount('');
  };
const handleSwap = async () => {
    if (!payAmount || isNaN(Number(payAmount)) || Number(payAmount) <= 0) {
      console.log("Invalid amount entered");
      return;
    }
    
    try {
      setIsProcessing(true);
      console.log("--- Starting Swap Sequence ---");
      
      // 1. Convert to BigInt Wei
      const amountInWei = parseUnits(payAmount, 18);
      console.log("Amount in Wei:", amountInWei.toString());

      // 2. Set a 20-minute deadline
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      // 3. Trigger the Contract Write
      console.log("Sending transaction to wallet...");
      const tx = await writeContractAsync({
        address: ROUTER_ADDRESS,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [
          amountInWei, 
          BigInt(0), // Min amount out (0 for testing)
          tokenIn, 
          tokenOut, 
          address as `0x${string}`, 
          deadline
        ],
      });

      console.log("Transaction Hash received:", tx);
      setPayAmount('');
      
    } catch (e: any) {
      console.error("CRITICAL ERROR DURING SWAP:");
      console.error("Error Message:", e.message);
      // This will tell us if it's a 'User Rejected', 'Insufficient Funds', or 'Contract Revert'
      alert(`Error: ${e.shortMessage || "Check console for details"}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F9F9F8] text-[#1C1C1C] font-sans antialiased">
      <header className="flex justify-between items-center p-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-black rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full"></div>
          </div>
          <h1 className="text-xl font-bold tracking-tight">Dev_dex</h1>
        </div>
        <ConnectButton accountStatus="avatar" showBalance={false} />
      </header>

      <main className="flex flex-col items-center justify-center pt-24 px-4">
        <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] p-3 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-[#F2F2F2]">
          
          <div className="px-4 py-2 mb-2 flex justify-between items-center">
            <h2 className="text-sm font-bold uppercase tracking-widest text-[#A0A0A0]">Swap</h2>
          </div>

          {/* INPUT PAY */}
          <div className="bg-[#F9F9F8] rounded-[2rem] p-5 mb-1.5 border border-transparent focus-within:border-[#EAEAEA] transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-[#7D7D7D] uppercase">You pay</span>
              <span className="text-xs text-[#A0A0A0]">Balance: {displayPayBalance}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <input 
                type="text" 
                placeholder="0" 
                value={payAmount} 
                onChange={(e) => setPayAmount(e.target.value)} 
                className="bg-transparent text-4xl outline-none w-full font-medium placeholder:text-[#D4D4D4]" 
              />
              <div className="bg-white px-4 py-2 rounded-2xl shadow-sm font-bold flex items-center gap-2 border border-[#EBEBEB]">
                <span className={isSwapped ? "text-blue-500" : "text-orange-500"}>{isSwapped ? "Ξ" : "₿"}</span>
                {tokenInSymbol}
              </div>
            </div>
          </div>

          {/* TOGGLE */}
          <div className="flex justify-center -my-5 relative z-10">
            <button 
              onClick={handleToggle} 
              className="bg-white p-3 rounded-2xl border border-[#EBEBEB] shadow-sm hover:shadow-md hover:scale-110 active:scale-95 transition-all duration-300 text-[#1C1C1C]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 10l5 5 5-5M7 14l5-5 5 5"/></svg>
            </button>
          </div>

          {/* INPUT RECEIVE */}
          <div className="bg-[#F9F9F8] rounded-[2rem] p-5 mt-1.5 border border-transparent focus-within:border-[#EAEAEA] transition-all">
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-semibold text-[#7D7D7D] uppercase">You receive</span>
              <span className="text-xs text-[#A0A0A0]">Balance: {displayReceiveBalance}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <input 
                type="text" 
                placeholder="0" 
                value={payAmount} 
                readOnly 
                className="bg-transparent text-4xl outline-none w-full font-medium opacity-40" 
              />
              <div className="bg-white px-4 py-2 rounded-2xl shadow-sm font-bold flex items-center gap-2 border border-[#EBEBEB]">
                <span className={!isSwapped ? "text-blue-500" : "text-orange-500"}>{!isSwapped ? "Ξ" : "₿"}</span>
                {tokenOutSymbol}
              </div>
            </div>
          </div>

          {/* SWAP BUTTON */}
          <button 
            onClick={handleSwap} 
            disabled={isProcessing || isWaitingForBlock || !payAmount || !isConnected} 
            className={`w-full text-white rounded-[1.5rem] py-5 mt-3 font-bold text-lg transition-all shadow-lg shadow-black/5
              ${(!isConnected || !payAmount) ? "bg-[#EAEAEA] text-[#A0A0A0] cursor-not-allowed shadow-none" : 
                (isProcessing || isWaitingForBlock) ? "bg-[#4D4D4D] cursor-wait" : 
                "bg-[#1C1C1C] hover:bg-black active:scale-[0.98]"}
            `}
          >
            {!isConnected ? "Connect Wallet" : 
             (isProcessing || isWaitingForBlock) ? "Confirming on Sepolia..." : 
             "Swap Tokens"}
          </button>
        </div>
        
        {/* NETWORK STATUS FOOTER */}
        <div className="mt-8 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#D4D4D4]">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
          Sepolia Testnet Active
        </div>
      </main>
    </div>
  );
}