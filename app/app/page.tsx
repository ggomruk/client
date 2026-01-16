'use client';

import React, { useEffect, useState } from 'react'
import { StakingAssetCard } from './_components/StakingAssetCard'
import { ActiveStaking } from './_components/ActiveStaking'
import { binanceService, TickerData } from './_api/binance.service';
import { backtestService } from './_api/backtest.service';
import { optimizerService } from './_api/optimizer.service';
import { onchainService } from './_api/onchain.service';
import { Wallet, TrendingUp, Activity, PieChart, ArrowUpRight, ArrowDownRight, Plus, Cpu, Fish, X } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface MarketData {
  symbol: string;
  ticker: TickerData;
  klines: number[];
}

interface QuickStat {
    label: string;
    value: string;
    change: string;
    isPositive: boolean;
    icon: any;
    color: string;
}

const PAIRS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', subtitle: 'BTC/USDT', iconColor: 'text-orange-500', icon: 'images/btc.svg', iconBg: 'bg-gradient-to-br from-orange-500/20 to-orange-600/20', chartColor: '#f97316' },
  { symbol: 'ETHUSDT', name: 'Ethereum', subtitle: 'ETH/USDT', iconColor: 'text-purple-500', icon: 'images/eth.svg', iconBg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20', chartColor: '#7c3aed' },
  { symbol: 'BNBUSDT', name: 'BNB Chain', subtitle: 'BNB/USDT', iconColor: 'text-yellow-500', icon: 'images/bnb.svg', iconBg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20', chartColor: '#eab308' },
  { symbol: 'SOLUSDT', name: 'Solana', subtitle: 'SOL/USDT', iconColor: 'text-teal-500', icon: 'images/sol.svg', iconBg: 'bg-gradient-to-br from-teal-500/20 to-teal-600/20', chartColor: '#14b8a6' },
];

const ALL_PAIRS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', subtitle: 'BTC/USDT', icon: 'images/btc.svg', iconBg: 'bg-gradient-to-br from-orange-500/20 to-orange-600/20', chartColor: '#f97316' },
  { symbol: 'ETHUSDT', name: 'Ethereum', subtitle: 'ETH/USDT', icon: 'images/eth.svg', iconBg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20', chartColor: '#7c3aed' },
  { symbol: 'BNBUSDT', name: 'BNB Chain', subtitle: 'BNB/USDT', icon: 'images/bnb.svg', iconBg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20', chartColor: '#eab308' },
  { symbol: 'SOLUSDT', name: 'Solana', subtitle: 'SOL/USDT', icon: 'images/sol.svg', iconBg: 'bg-gradient-to-br from-teal-500/20 to-teal-600/20', chartColor: '#14b8a6' },
  { symbol: 'XRPUSDT', name: 'XRP', subtitle: 'XRP/USDT', icon: 'images/xrp.svg', iconBg: 'bg-gradient-to-br from-gray-500/20 to-gray-600/20', chartColor: '#6b7280' },
  { symbol: 'ADAUSDT', name: 'Cardano', subtitle: 'ADA/USDT', icon: 'images/ada.svg', iconBg: 'bg-gradient-to-br from-blue-500/20 to-blue-600/20', chartColor: '#3b82f6' },
  { symbol: 'DOGEUSDT', name: 'Dogecoin', subtitle: 'DOGE/USDT', icon: 'images/doge.svg', iconBg: 'bg-gradient-to-br from-amber-500/20 to-amber-600/20', chartColor: '#f59e0b' },
  { symbol: 'AVAXUSDT', name: 'Avalanche', subtitle: 'AVAX/USDT', icon: 'images/avax.svg', iconBg: 'bg-gradient-to-br from-red-500/20 to-red-600/20', chartColor: '#ef4444' },
  { symbol: 'SHIBUSDT', name: 'Shiba Inu', subtitle: 'SHIB/USDT', icon: 'images/shib.svg', iconBg: 'bg-gradient-to-br from-orange-400/20 to-orange-500/20', chartColor: '#fb923c' },
  { symbol: 'LINKUSDT', name: 'Chainlink', subtitle: 'LINK/USDT', icon: 'images/link.svg', iconBg: 'bg-gradient-to-br from-blue-400/20 to-blue-500/20', chartColor: '#60a5fa' },
  { symbol: 'TRXUSDT', name: 'TRON', subtitle: 'TRX/USDT', icon: 'images/trx.svg', iconBg: 'bg-gradient-to-br from-red-400/20 to-red-500/20', chartColor: '#f87171' },
];

const AppPage = () => {
    const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<QuickStat[]>([
        { label: "Market Sentiment", value: "Loading...", change: "--", isPositive: true, icon: TrendingUp, color: "from-[#10b981] to-[#22c55e]" },
        { label: "Backtests Run", value: "0", change: "Last: --", isPositive: true, icon: Activity, color: "from-[#7c3aed] to-[#a855f7]" },
        { label: "Optimizations", value: "0", change: "Idle", isPositive: true, icon: Cpu, color: "from-[#ec4899] to-[#f472b6]" },
        { label: "Whale Activity", value: "0", change: "24h Count", isPositive: true, icon: Fish, color: "from-[#06b6d4] to-[#0ea5e9]" },
    ]);

    const [recentBacktest, setRecentBacktest] = useState<any>(null);
    const [showAllPairs, setShowAllPairs] = useState(false);
    const [allPairsData, setAllPairsData] = useState<Record<string, MarketData>>({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Fetch Market Data (Pairs)
                const promises = PAIRS.map(async (pair) => {
                    const [ticker, klines] = await Promise.all([
                        binanceService.get24hrTicker(pair.symbol),
                        binanceService.getKlines(pair.symbol)
                    ]);
                    return { symbol: pair.symbol, ticker, klines };
                });

                const results = await Promise.all(promises);
                const dataMap = results.reduce((acc, item) => {
                    acc[item.symbol] = item;
                    return acc;
                }, {} as Record<string, MarketData>);
                setMarketData(dataMap);

                // 2. Derive Market Sentiment
                const positivePairs = results.filter(r => parseFloat(r.ticker.priceChangePercent) > 0).length;
                const sentimentValue = positivePairs >= results.length / 2 ? "Bullish" : "Bearish";
                const sentimentChange = `${positivePairs}/${results.length} Up`;

                // 3. Fetch User Stats (Parallel)
                const [backtests, optimizations, whaleTx] = await Promise.allSettled([
                    backtestService.getHistory(),
                    optimizerService.getOptimizations(),
                    onchainService.getTransactions({ limit: 1 })
                ]);
                
                // Process Backtests
                let totalBacktests = "0";
                let lastBacktestInfo = "No runs";
                let backtestPositive = true;
                
                if (backtests.status === 'fulfilled' && Array.isArray(backtests.value)) {
                    totalBacktests = backtests.value.length.toString();
                    if (backtests.value.length > 0) {
                        const last = backtests.value[0]; // Assuming sorted descending
                        setRecentBacktest(last); // Store for ActiveStaking
                        
                        // Try to extract return from summary or result
                        const ret = (last as any).result?.totalReturn || (last as any).summary?.totalReturn || 0;
                        lastBacktestInfo = `Last: ${ret > 0 ? '+' : ''}${parseFloat(ret).toFixed(2)}%`;
                        backtestPositive = ret >= 0;
                    }
                }

                // Process Optimizations
                let totalOpts = "0";
                let optStatus = "No jobs";
                if (optimizations.status === 'fulfilled') {
                    // optimizerService might return wrapped payload. Handle both.
                    const payload: any = optimizations.value; 
                    const list = Array.isArray(payload) ? payload : (payload.payload || []);
                    totalOpts = list.length.toString();
                    if (list.length > 0) {
                        const last = list[list.length - 1]; // Assuming append order or check date
                        optStatus = last.status || "Unknown";
                    }
                }

                // // Process OnChain
                // let whaleCount = "0";
                // if (whaleTx.status === 'fulfilled') {
                //     // Response is PaginatedTransactionsResponse
                //     whaleCount = whaleTx.value.pagination?.total?.toString() || "0";
                // }

                setStats([
                    { 
                        label: "Market Sentiment", 
                        value: sentimentValue, 
                        change: sentimentChange, 
                        isPositive: sentimentValue === "Bullish", 
                        icon: TrendingUp, 
                        color: "from-[#10b981] to-[#22c55e]" 
                    },
                    { 
                        label: "Your Backtests", 
                        value: totalBacktests, 
                        change: lastBacktestInfo, 
                        isPositive: backtestPositive, 
                        icon: Activity, 
                        color: "from-[#7c3aed] to-[#a855f7]" 
                    },
                    { 
                        label: "Your Optimizations", 
                        value: totalOpts, 
                        change: optStatus, 
                        isPositive: true, 
                        icon: Cpu, 
                        color: "from-[#ec4899] to-[#f472b6]" 
                    },
                    // { 
                    //     label: "Whale Activity", 
                    //     value: whaleCount, 
                    //     change: "24h Txs", 
                    //     isPositive: true, 
                    //     icon: Fish, 
                    //     color: "from-[#06b6d4] to-[#0ea5e9]" 
                    // },
                ]);

            } catch (error) {
                console.error("Failed to fetch dashboard data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 30000); // 30 seconds poll
        return () => clearInterval(interval);
    }, []);

    // Helper to format currency
    const formatPrice = (price: string) => {
        const p = parseFloat(price);
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(p);
    };

    const formatVolume = (vol: string) => {
        const v = parseFloat(vol);
        if (v >= 1e9) return (v / 1e9).toFixed(2) + 'B';
        if (v >= 1e6) return (v / 1e6).toFixed(2) + 'M';
        return (v / 1e3).toFixed(2) + 'K';
    };

    // Fetch all pairs data when modal opens
    useEffect(() => {
        if (!showAllPairs) return;
        
        const fetchAllPairs = async () => {
            try {
                const promises = ALL_PAIRS.map(async (pair) => {
                    const [ticker, klines] = await Promise.all([
                        binanceService.get24hrTicker(pair.symbol),
                        binanceService.getKlines(pair.symbol)
                    ]);
                    return { symbol: pair.symbol, ticker, klines };
                });

                const results = await Promise.all(promises);
                const dataMap = results.reduce((acc, item) => {
                    acc[item.symbol] = item;
                    return acc;
                }, {} as Record<string, MarketData>);
                setAllPairsData(dataMap);
            } catch (error) {
                console.error("Failed to fetch all pairs data", error);
            }
        };

        fetchAllPairs();
    }, [showAllPairs]);

    return (
        <div className="flex-1 bg-[#09090b] overflow-y-auto relative p-4 md:p-6 lg:p-8">
            {/* Floating Particles Background */}
            <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                <div 
                    className="absolute top-1/4 -left-20 w-96 h-96 bg-[#7c3aed] rounded-full mix-blend-multiply filter blur-3xl opacity-10"
                    style={{ animation: 'float-blob 8s ease-in-out infinite' }}
                />
                <div 
                    className="absolute top-1/3 -right-20 w-96 h-96 bg-[#06b6d4] rounded-full mix-blend-multiply filter blur-3xl opacity-10"
                    style={{ animation: 'float-blob 8s ease-in-out infinite', animationDelay: '2s' }}
                />
            </div>
            
            <div className="relative z-10 max-w-7xl mx-auto">
                {/* Header Section */}
                <div className="mb-6 md:mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="animate-fadeIn">
                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                                {
                                    new Date().getHours() < 12 ? 'Good Morning👋' :
                                    new Date().getHours() < 18 ? 'Good Afternoon👋' :
                                    'Good Evening👋'
                                }
                            </h1>
                        </div>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div
                                key={index}
                                className="bg-[#18181b] rounded-2xl p-5 border border-[#27272a] hover:border-[#7c3aed]/50 transition-all hover:scale-[1.02] group cursor-pointer"
                                style={{ animation: `scale-in 0.5s ease-out ${index * 0.1}s both` }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
                                        <Icon className="w-6 h-6 text-white" />
                                    </div>
                                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold ${
                                        stat.isPositive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                                    }`}>
                                        {stat.isPositive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {stat.change}
                                    </div>
                                </div>
                                <p className="text-[#a1a1aa] text-sm mb-1">{stat.label}</p>
                                <p className="text-white text-2xl font-bold">{stat.value}</p>
                            </div>
                        );
                    })}
                </div>

                {/* Top Trading Pairs */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-[#fafafa]">
                            Top Trading Pairs
                        </h2>
                        <button 
                            onClick={() => setShowAllPairs(true)}
                            className="text-sm text-[#06b6d4] hover:text-[#7c3aed] transition-colors font-medium"
                        >
                            View All
                        </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {PAIRS.map((pair, index) => {
                            const data = marketData[pair.symbol];
                            const price = data ? formatPrice(data.ticker.lastPrice) : 'Loading...';
                            const change = data ? parseFloat(data.ticker.priceChangePercent).toFixed(2) + '%' : '0.00%';
                            const isPositive = data ? parseFloat(data.ticker.priceChangePercent) >= 0 : true;
                            const volume = data ? formatVolume(data.ticker.quoteVolume) : '0';
                            const chartData = data ? data.klines : [];

                            return (
                                <div key={pair.symbol} style={{ animation: `slide-up 0.5s ease-out ${index * 0.1}s both` }}>
                                    <StakingAssetCard
                                        name={pair.name}
                                        subtitle={pair.subtitle}
                                        percentage={price}
                                        percentageChange={change}
                                        isPositive={isPositive}
                                        currentValue={`Vol: $${volume}`}
                                        icon={
                                            <Image 
                                                src={`/${pair.icon}`} 
                                                alt={pair.name}
                                                width={24}
                                                height={24}
                                                className="w-6 h-6"
                                            />
                                        }
                                        iconBg={pair.iconBg}
                                        chartData={chartData}
                                        chartColor={pair.chartColor}
                                        label="Price"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Active Strategy Analysis - includes backtest functionality */}
                <ActiveStaking recentBacktest={recentBacktest} />
            </div>

            {/* All Pairs Modal */}
            {showAllPairs && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <div 
                        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                        onClick={() => setShowAllPairs(false)}
                    />
                    
                    {/* Modal Content */}
                    <div className="relative bg-[#18181b] rounded-2xl border border-[#27272a] w-full max-w-6xl max-h-[85vh] overflow-hidden animate-fadeIn">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-[#27272a]">
                            <h2 className="text-2xl font-bold text-white">All Trading Pairs</h2>
                            <button 
                                onClick={() => setShowAllPairs(false)}
                                className="p-2 rounded-lg hover:bg-[#27272a] transition-colors"
                            >
                                <X className="w-6 h-6 text-[#a1a1aa]" />
                            </button>
                        </div>
                        
                        {/* Grid */}
                        <div className="p-6 overflow-y-auto max-h-[calc(85vh-88px)]">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {ALL_PAIRS.map((pair, index) => {
                                    const data = allPairsData[pair.symbol] || marketData[pair.symbol];
                                    const price = data ? formatPrice(data.ticker.lastPrice) : 'Loading...';
                                    const change = data ? parseFloat(data.ticker.priceChangePercent).toFixed(2) + '%' : '0.00%';
                                    const isPositive = data ? parseFloat(data.ticker.priceChangePercent) >= 0 : true;
                                    const volume = data ? formatVolume(data.ticker.quoteVolume) : '0';
                                    const chartData = data ? data.klines : [];

                                    return (
                                        <div 
                                            key={pair.symbol} 
                                            style={{ animation: `scale-in 0.3s ease-out ${index * 0.05}s both` }}
                                        >
                                            <StakingAssetCard
                                                name={pair.name}
                                                subtitle={pair.subtitle}
                                                percentage={price}
                                                percentageChange={change}
                                                isPositive={isPositive}
                                                currentValue={`Vol: $${volume}`}
                                                icon={
                                                    <Image 
                                                        src={`/${pair.icon}`} 
                                                        alt={pair.name}
                                                        width={24}
                                                        height={24}
                                                        className="w-6 h-6"
                                                    />
                                                }
                                                iconBg={pair.iconBg}
                                                chartData={chartData}
                                                chartColor={pair.chartColor}
                                                label="Price"
                                            />
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AppPage