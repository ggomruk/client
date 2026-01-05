'use client';

import { useState, useEffect } from "react";
import { Star, Beaker } from "lucide-react";
import { useWebsocket } from '../_provider/binance.websocket';
import { PanelProvider } from '../_provider/panel.context';
import StrategyBuilder from "./_components/StrategyBuilder";
import FinancialChart from "./_components/FinancialChart";

const tradingPairs = [
  { name: "Bitcoin", symbol: "BTCUSDT" },
  { name: "Ethereum", symbol: "ETHUSDT" },
  { name: "BNB", symbol: "BNBUSDT" },
  { name: "Solana", symbol: "SOLUSDT" },
  { name: "Cardano", symbol: "ADAUSDT" },
  { name: "XRP", symbol: "XRPUSDT" },
  { name: "Dogecoin", symbol: "DOGEUSDT" },
  { name: "Polygon", symbol: "MATICUSDT" },
];

export default function ChartPage() {
  const { symbol: selectedPair, setSymbol, symbolData } = useWebsocket();
  const [searchQuery, setSearchQuery] = useState("");

  const filteredPairs = tradingPairs.filter(pair => 
    pair.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pair.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PanelProvider>
      <div className="flex-1 bg-[#09090b] flex flex-col h-screen lg:overflow-hidden overflow-y-auto">
      {/* Page Header */}
      <div className="p-4 md:p-6 border-b border-[#3f3f46] flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-[#a78bfa] to-[#22d3ee] bg-clip-text text-transparent mb-1 md:mb-2">
                Trading Charts
              </h1>
              <p className="text-xs md:text-sm text-[#a1a1aa]">Real-time price charts and market data</p>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Pair Selector */}
      <div className="lg:hidden border-b border-[#3f3f46] bg-[#18181b] flex-shrink-0">
        <div className="flex overflow-x-auto p-2 gap-2 no-scrollbar">
          {tradingPairs.map((pair) => (
            <button
              key={pair.symbol}
              onClick={() => setSymbol(pair.symbol)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                selectedPair === pair.symbol
                  ? "bg-[#7c3aed] text-white"
                  : "bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] hover:text-[#fafafa]"
              }`}
            >
              {pair.name}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-row lg:overflow-hidden relative">
        {/* Left Sidebar - Trading Pairs */}
        <div className="hidden lg:flex flex-col w-64 bg-[#18181b] border-r border-[#3f3f46]">
          {/* Search */}
          <div className="p-3 md:p-4 border-b border-[#3f3f46] flex items-center gap-2">
            <input
              type="text"
              placeholder="Search pairs..."
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-[#fafafa] placeholder-[#71717a] focus:outline-none focus:border-[#7c3aed] transition-colors"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            <div className="p-3">
              <div className="flex items-center gap-2 text-xs text-[#a1a1aa] mb-3">
              </div>

              <div className="space-y-1">
                {filteredPairs.map((item, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSymbol(item.symbol);
                    }}
                    className={`w-full p-2 rounded-lg transition-all ${
                      selectedPair === item.symbol
                        ? "bg-gradient-to-r from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[#7c3aed]/30"
                        : "hover:bg-[#27272a]"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Star className="w-3 h-3 text-[#a1a1aa]" />
                      <div className="flex flex-col items-start flex-1">
                        <span className="text-sm font-medium text-[#fafafa]">{item.symbol}</span>
                        <span className="text-xs text-[#a1a1aa]">{item.name}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="flex-1 flex flex-col bg-[#09090b] min-w-0">
          {/* Pair Info */}
          <div className="bg-[#18181b] border-b border-[#3f3f46] p-3 md:p-4 flex-shrink-0">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-6">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg md:text-xl text-[#fafafa] font-bold">{selectedPair}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-[#a1a1aa]">Last Price</div>
                <div className={`text-base md:text-lg font-bold ${symbolData && symbolData.priceChangePercent >= 0 ? 'text-[#05df72]' : 'text-[#ff6467]'}`}>
                  {symbolData?.lastPrice.toFixed(2) || '--'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#a1a1aa]">24h Change</div>
                <div className={`text-base md:text-lg font-bold ${symbolData && symbolData.priceChangePercent >= 0 ? 'text-[#05df72]' : 'text-[#ff6467]'}`}>
                  {symbolData ? `${symbolData.priceChangePercent >= 0 ? '+' : ''}${symbolData.priceChangePercent.toFixed(2)}%` : '--'}
                </div>
              </div>
              <div>
                <div className="text-xs text-[#a1a1aa]">24h High</div>
                <div className="text-sm text-[#fafafa]">{symbolData?.highPrice.toFixed(2) || '--'}</div>
              </div>
              <div>
                <div className="text-xs text-[#a1a1aa]">24h Low</div>
                <div className="text-sm text-[#fafafa]">{symbolData?.lowPrice.toFixed(2) || '--'}</div>
              </div>
              <div>
                <div className="text-xs text-[#a1a1aa]">24h Volume</div>
                <div className="text-sm text-[#fafafa]">{symbolData?.quantity.toFixed(2) || '--'}</div>
              </div>
            </div>
          </div>

          {/* Chart */}
          <div className="flex-1 bg-[#18181b] relative flex flex-col lg:flex-row lg:overflow-hidden">
            <div className="w-full h-[60vh] lg:h-full lg:flex-1 relative min-h-0">
              <FinancialChart />
            </div>
            
            {/* Strategy Builder Panel */}
            <div className="w-full lg:w-80 h-[600px] lg:h-full border-t lg:border-t-0 lg:border-l border-[#3f3f46]">
              <StrategyBuilder />
            </div>
          </div>
        </div>


      </div>
      </div>
    </PanelProvider>
  );
}
