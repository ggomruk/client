'use client';

import React, { useEffect, useState } from 'react'
import { StakingAssetCard } from './_components/StakingAssetCard'
import { ActiveStaking } from './_components/ActiveStaking'
import { binanceService, TickerData } from './_api/binance.service';

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
        <div className="p-8">
            {/* Header */}
            <div className="mb-8 animate-fadeIn">
                <h1 className="text-[30px] font-bold gradient-text mb-2 leading-[36px]">
                    Trading Dashboard
                </h1>
                <p className="text-base text-[#a1a1aa]">
                    Monitor your strategies and backtest performance
                </p>
            </div>

            {/* Top Trading Pairs */}
            <div className="mb-8 animate-slideIn">
                <h2 className="text-xl font-bold text-[#fafafa] mb-4">
                    Top Trading Pairs
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {PAIRS.map((pair) => {
                        const data = marketData[pair.symbol];
                        const price = data ? formatPrice(data.ticker.lastPrice) : 'Loading...';
                        const change = data ? parseFloat(data.ticker.priceChangePercent).toFixed(2) + '%' : '0.00%';
                        const isPositive = data ? parseFloat(data.ticker.priceChangePercent) >= 0 : true;
                        const volume = data ? formatVolume(data.ticker.quoteVolume) : '0';
                        const chartData = data ? data.klines : [];

                        return (
                            <StakingAssetCard
                                key={pair.symbol}
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
                        );
                    })}
                </div>
            </div>

            {/* Active Strategy Analysis - includes backtest functionality */}
            <ActiveStaking />
        </div>
    )
}

export default AppPage