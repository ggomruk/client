'use client';

import React, { useEffect, useState } from 'react'
import { StakingAssetCard } from './_components/StakingAssetCard'
import { ActiveStaking } from './_components/ActiveStaking'
import { binanceService, TickerData } from './_api/binance.service';
import { Wallet, TrendingUp, Activity, PieChart, ArrowUpRight, ArrowDownRight, Plus } from 'lucide-react';

interface MarketData {
  symbol: string;
  ticker: TickerData;
  klines: number[];
}

const PAIRS = [
  { symbol: 'BTCUSDT', name: 'Bitcoin', subtitle: 'BTC/USDT', iconColor: 'text-orange-500', iconBg: 'bg-gradient-to-br from-orange-500/20 to-orange-600/20', chartColor: '#f97316' },
  { symbol: 'ETHUSDT', name: 'Ethereum', subtitle: 'ETH/USDT', iconColor: 'text-purple-500', iconBg: 'bg-gradient-to-br from-purple-500/20 to-purple-600/20', chartColor: '#7c3aed' },
  { symbol: 'BNBUSDT', name: 'BNB Chain', subtitle: 'BNB/USDT', iconColor: 'text-yellow-500', iconBg: 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/20', chartColor: '#eab308' },
  { symbol: 'SOLUSDT', name: 'Solana', subtitle: 'SOL/USDT', iconColor: 'text-teal-500', iconBg: 'bg-gradient-to-br from-teal-500/20 to-teal-600/20', chartColor: '#14b8a6' },
];

const quickStats = [
  { label: "Portfolio Value", value: "$48,532.00", change: "+12.5%", isPositive: true, icon: Wallet, color: "from-[#7c3aed] to-[#a855f7]" },
  { label: "Today's P&L", value: "+$1,234.56", change: "+2.6%", isPositive: true, icon: TrendingUp, color: "from-[#10b981] to-[#22c55e]" },
  { label: "Active Strategies", value: "8", change: "2 new", isPositive: true, icon: Activity, color: "from-[#06b6d4] to-[#0ea5e9]" },
  { label: "Win Rate", value: "67.8%", change: "+5.2%", isPositive: true, icon: PieChart, color: "from-[#ec4899] to-[#f472b6]" },
];

const AppPage = () => {
    const [marketData, setMarketData] = useState<Record<string, MarketData>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
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
            } catch (error) {
                console.error("Failed to fetch market data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
        // Optional: Set up interval for polling
        const interval = setInterval(fetchData, 10000); // 10 seconds
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
                                Good Morning 👋
                            </h1>
                            <p className="text-sm md:text-base text-[#a1a1aa]">Here's your portfolio summary</p>
                        </div>
                        <button className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] flex items-center justify-center shadow-lg hover:scale-105 transition-transform">
                            <Plus className="w-6 h-6 text-white" />
                        </button>
                    </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {quickStats.map((stat, index) => {
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
                        <button className="text-sm text-[#06b6d4] hover:text-[#7c3aed] transition-colors font-medium">
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
                                        icon={<span className={`${pair.iconColor} font-bold text-lg`}>◆</span>}
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
                <ActiveStaking />
            </div>
        </div>
    )
}

export default AppPage