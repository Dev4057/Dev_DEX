"use client";

import { useState, useEffect } from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { 
  useAccount, 
  useReadContract, 
  useWriteContract, 
  useWaitForTransactionReceipt,
  useBalance 
} from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { MBTC_ADDRESS, METH_ADDRESS, ROUTER_ADDRESS, ERC20_ABI, ROUTER_ABI } from '../constants/contracts';

export default function Home() {
  const { address, isConnected } = useAccount();
  const { data: hash, writeContractAsync, isPending: isSending } = useWriteContract();

  // --- STATE ---
  const [payAmount, setPayAmount] = useState('');
  const [isSwapped, setIsSwapped] = useState(false); 
  const [isProcessing, setIsProcessing] = useState(false);

  // --- DYNAMIC DATA ---
  const tokenIn = isSwapped ? METH_ADDRESS : MBTC_ADDRESS;
  const tokenOut = isSwapped ? MBTC_ADDRESS : METH_ADDRESS;
  const tokenInSymbol = isSwapped ? 'mETH' : 'mBTC';
  const tokenOutSymbol = isSwapped ? 'mBTC' : 'mETH';

  // --- 1. IMPROVED BALANCE FETCHING ---
  // We use useBalance because it's optimized for UI refreshes
  const { data: btcBalance, refetch: refetchBtc } = useBalance({
    address,
    token: MBTC_ADDRESS,
    query: { enabled: !!address, refetchInterval: 3000 }
  });

  const { data: ethBalance, refetch: refetchEth } = useBalance({
    address,
    token: METH_ADDRESS,
    query: { enabled: !!address, refetchInterval: 3000 }
  });

  // --- 2. THE "GHOST" FIX: WAIT FOR RECEIPT ---
  // This hook watches the blockchain for the specific transaction hash
  const { isLoading: isWaitingForBlock, isSuccess: txSuccess } = useWaitForTransactionReceipt({ 
    hash,
    confirmations: 1 // Wait for at least 1 block confirmation
  });

  // --- 3. THE "CHAIN REACTION" ---
  // When the transaction is successful on-chain, FORCE the balances to update immediately
  useEffect(() => {
    if (txSuccess) {
      console.log("Transaction confirmed! Refetching balances...");
      refetchBtc();
      refetchEth();
      setPayAmount('');
      setIsProcessing(false);
    }
  }, [txSuccess, refetchBtc, refetchEth]);

  const displayPayBalance = isSwapped ? ethBalance?.formatted : btcBalance?.formatted;
  const displayReceiveBalance = isSwapped ? btcBalance?.formatted : ethBalance?.formatted;

  const handleToggle = () => {
    setIsSwapped(!isSwapped);
    setPayAmount('');
  };

  const handleSwap = async () => {
    if (!payAmount || isNaN(Number(payAmount)) || Number(payAmount) <= 0) return;
    
    try {
      setIsProcessing(true);
      const amountInWei = parseUnits(payAmount, 18);
      
      // FIXED: Deadline must be in SECONDS (Math.floor / 1000)
      const deadline = BigInt(Math.floor(Date.now() / 1000) + 1200);

      await writeContractAsync({
        address: ROUTER_ADDRESS,
        abi: ROUTER_ABI,
        functionName: 'swapExactTokensForTokens',
        args: [
          amountInWei, 
          BigInt(0), // amountOutMin: 0 for testing to avoid slippage reverts
          tokenIn, 
          tokenOut, 
          address as `0x${string}`, 
          deadline
        ],
      });
    } catch (e) {
      console.error("Swap error:", e);
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
          <h1 className="text-xl font-bold tracking-tight">Dev_DEX</h1>
        </div>
        <ConnectButton accountStatus="avatar" showBalance={false} />
      </header>

      <main className="flex flex-col items-center justify-center pt-24 px-4">
        <div className="w-full max-w-[440px] bg-white rounded-[2.5rem] p-3 shadow-sm border border-[#F2F2F2]">
          <div className="px-4 py-2 mb-2"><h2 className="text-xs font-bold uppercase text-[#A0A0A0]">Swap</h2></div>

          {/* INPUT PAY */}
          <div className="bg-[#F9F9F8] rounded-[2rem] p-5 mb-1.5 border border-transparent focus-within:border-[#EAEAEA]">
            <div className="flex justify-between mb-4 text-xs font-semibold text-[#7D7D7D]">
              <span>YOU PAY</span>
              <span>BALANCE: {displayPayBalance || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <input type="text" placeholder="0" value={payAmount} onChange={(e) => setPayAmount(e.target.value)} className="bg-transparent text-4xl outline-none w-full font-medium" />
              <div className="bg-white px-4 py-2 rounded-2xl shadow-sm font-bold flex items-center gap-2 border border-[#EBEBEB]">
                <span className={isSwapped ? "text-blue-500" : "text-orange-500"}>{isSwapped ? "Ξ" : "₿"}</span>
                {tokenInSymbol}
              </div>
            </div>
          </div>

          <div className="flex justify-center -my-5 relative z-10">
            <button onClick={handleToggle} className="bg-white p-3 rounded-2xl border border-[#EBEBEB] shadow-sm hover:rotate-180 transition-all duration-500"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M7 10l5 5 5-5M7 14l5-5 5 5"/></svg></button>
          </div>

          {/* INPUT RECEIVE */}
          <div className="bg-[#F9F9F8] rounded-[2rem] p-5 mt-1.5 border border-transparent">
            <div className="flex justify-between mb-4 text-xs font-semibold text-[#7D7D7D]">
              <span>YOU RECEIVE</span>
              <span>BALANCE: {displayReceiveBalance || "0.00"}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
              <input type="text" placeholder="0" value={payAmount} readOnly className="bg-transparent text-4xl outline-none w-full font-medium opacity-40" />
              <div className="bg-white px-4 py-2 rounded-2xl shadow-sm font-bold flex items-center gap-2 border border-[#EBEBEB]">
                <span className={!isSwapped ? "text-blue-500" : "text-orange-500"}>{!isSwapped ? "Ξ" : "₿"}</span>
                {tokenOutSymbol}
              </div>
            </div>
          </div>

          <button 
            onClick={handleSwap} 
            disabled={isProcessing || isWaitingForBlock || !payAmount || !isConnected} 
            className={`w-full text-white rounded-[1.5rem] py-5 mt-3 font-bold text-lg transition-all
              ${(!isConnected || !payAmount) ? "bg-[#EAEAEA] text-[#A0A0A0]" : 
                (isProcessing || isWaitingForBlock) ? "bg-[#4D4D4D] cursor-wait" : "bg-[#1C1C1C] hover:bg-black"}
            `}
          >
            {!isConnected ? "Connect Wallet" : 
             (isProcessing || isWaitingForBlock) ? "Updating Blockchain..." : "Swap Tokens"}
          </button>
        </div>
      </main>
    </div>
  );
}