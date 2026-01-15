import { useState } from "react";
import { Copy, ExternalLink, RefreshCw, BarChart3, AlertCircle, Play, TrendingUp, ArrowUpRight } from "lucide-react";

const metrics = [
  { label: "Momentum", sublabel: "Price Momentum", value: "+12.5%", badge: "7D", type: "positive" },
  { label: "Volatility", sublabel: "Standard Deviation", value: "18.2%", change: "+2.1%", badge: "30D", type: "neutral" },
  { label: "Volume", sublabel: "Trading Volume", value: "$2.4B", badge: "24H", type: "neutral" },
  { label: "RSI", sublabel: "Relative Strength", value: "58.3", detail: "Neutral Zone", type: "neutral" },
];

export function ActiveStaking() {
  const [backtestPeriod, setBacktestPeriod] = useState(4);

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#fafafa]">Active Strategy Analysis</h2>
        <div className="flex items-center gap-2">
          <button className="p-2.5 hover:bg-[#27272a] rounded-xl transition-colors group">
            <BarChart3 className="w-5 h-5 text-[#a1a1aa] group-hover:text-[#fafafa] transition-colors" />
          </button>
          <button className="p-2.5 hover:bg-[#27272a] rounded-xl transition-colors group">
            <RefreshCw className="w-5 h-5 text-[#a1a1aa] group-hover:text-[#fafafa] transition-colors" />
          </button>
          <button className="p-2.5 hover:bg-[#27272a] rounded-xl transition-colors group">
            <AlertCircle className="w-5 h-5 text-[#a1a1aa] group-hover:text-[#fafafa] transition-colors" />
          </button>
        </div>
      </div>

      {/* Main Strategy Card */}
      <div className="bg-[#18181b] rounded-3xl p-6 md:p-8 mb-6 border border-[#27272a] hover:border-[#7c3aed]/30 transition-all relative overflow-hidden group">
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7c3aed]/10 to-[#06b6d4]/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#06b6d4]/10 to-transparent rounded-full blur-3xl"></div>
        
        {/* Last Update */}
        <div className="flex items-center gap-2 text-xs text-[#a1a1aa] mb-4 relative z-10">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Last Update - 5 minutes ago</span>
          <AlertCircle className="w-3 h-3" />
        </div>

        {/* Strategy Header */}
        <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
          <h3 className="text-2xl md:text-3xl text-[#fafafa] font-bold">BTC/USDT Strategy</h3>
          <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-orange-500/30">
            B
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button className="p-2 hover:bg-[#27272a] rounded-lg transition-colors">
              <Copy className="w-4 h-4 text-[#a1a1aa] hover:text-[#fafafa]" />
            </button>
            <button className="p-2 hover:bg-[#27272a] rounded-lg transition-colors">
              <ExternalLink className="w-4 h-4 text-[#a1a1aa] hover:text-[#fafafa]" />
            </button>
          </div>
          <button className="ml-auto px-4 py-2.5 bg-[#27272a] text-[#fafafa] text-sm rounded-xl hover:bg-[#3f3f46] transition-colors border border-[#3f3f46] font-medium">
            View Details
          </button>
        </div>

        {/* Performance */}
        <div className="mb-8 relative z-10">
          <div className="text-sm text-[#a1a1aa] mb-3 font-medium">Current Performance (ROI)</div>
          <div className="flex flex-wrap items-center gap-4">
            <span className="text-5xl md:text-6xl text-green-400 font-bold">+24.86%</span>
            <button className="px-6 py-3 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white text-sm rounded-xl hover:shadow-lg hover:shadow-purple-500/30 transition-all flex items-center gap-2 font-medium">
              <Play className="w-4 h-4" />
              Run Backtest
            </button>
            <button className="px-5 py-3 bg-[#27272a] text-[#fafafa] text-sm rounded-xl hover:bg-[#3f3f46] transition-colors border border-[#3f3f46] font-medium">
              Export Data
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
          {metrics.map((metric, index) => (
            <div key={index} className="relative" style={{ animation: `scale-in 0.5s ease-out ${index * 0.1}s both` }}>
              <div className="bg-[#27272a]/50 rounded-2xl p-4 border border-[#3f3f46] hover:border-[#7c3aed]/50 transition-all hover:scale-[1.02] cursor-pointer group/card">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm text-[#fafafa] font-semibold">{metric.label}</span>
                  <div className="px-2 py-0.5 bg-[#18181b] text-[#a1a1aa] text-xs rounded-full font-medium">
                    {metric.badge}
                  </div>
                </div>
                <div className="text-xs text-[#a1a1aa] mb-3">{metric.sublabel}</div>
                
                {/* Value Section */}
                <div className={`text-2xl font-bold mb-1 ${metric.type === "positive" ? "text-green-400" : "text-[#fafafa]"}`}>
                  {metric.value}
                </div>
                {metric.change && (
                  <div className="flex items-center gap-1 text-xs text-green-400">
                    <ArrowUpRight className="w-3 h-3" />
                    {metric.change}
                  </div>
                )}
                {metric.detail && (
                  <div className="text-xs text-[#06b6d4] mt-1">{metric.detail}</div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Backtest Period */}
      <div className="bg-[#18181b] rounded-2xl p-6 border border-[#27272a] hover:border-[#7c3aed]/30 transition-all" style={{ animation: 'scale-in 0.5s ease-out 0.3s both' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#fafafa] font-semibold text-lg">Backtest Period</h3>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-[#27272a] text-[#fafafa] text-sm rounded-xl hover:bg-[#3f3f46] transition-colors border border-[#3f3f46] font-medium">
              6 Months
            </button>
            <button className="px-4 py-2 bg-[#27272a] text-[#fafafa] text-sm rounded-xl hover:bg-[#3f3f46] transition-colors border border-[#3f3f46] font-medium">
              1 Year
            </button>
          </div>
        </div>
        
        <div className="text-sm text-[#a1a1aa] mb-6 font-medium">Time Range (Months)</div>
        
        {/* Slider */}
        <div className="relative pt-10 pb-4">
          <input
            type="range"
            min="0"
            max="6"
            value={backtestPeriod}
            onChange={(e) => setBacktestPeriod(Number(e.target.value))}
            className="w-full h-2 bg-[#27272a] rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7c3aed 0%, #06b6d4 ${(backtestPeriod / 6) * 100}%, #27272a ${(backtestPeriod / 6) * 100}%, #27272a 100%)`
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-14 h-14 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-2xl border-4 border-[#18181b] flex items-center justify-center shadow-lg shadow-purple-500/30">
            <span className="text-white text-lg font-bold">{backtestPeriod}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
