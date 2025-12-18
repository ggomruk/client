import { useState } from "react";
import { Copy, ExternalLink, RefreshCw, BarChart3, AlertCircle, Play } from "lucide-react";

const metrics = [
  { label: "Momentum", sublabel: "Price Momentum", value: "+12.5%", badge: "7D", type: "positive" },
  { label: "Volatility", sublabel: "Standard Deviation", value: "18.2%", change: "+2.1%", badge: "30D", type: "neutral" },
  { label: "Volume", sublabel: "Trading Volume", value: "$2.4B", badge: "24H", type: "neutral" },
  { label: "RSI", sublabel: "Relative Strength", value: "58.3", detail: "Neutral Zone", type: "neutral" },
];

export function ActiveStaking() {
  const [backtestPeriod, setBacktestPeriod] = useState(4);

  return (
    <div className="flex-1 p-6 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm text-[#a1a1aa] font-medium">Active Strategy Analysis</h2>
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-[#27272a] rounded-lg transition-colors">
            <BarChart3 className="w-4 h-4 text-[#a1a1aa] hover:text-[#fafafa]" />
          </button>
          <button className="p-2 hover:bg-[#27272a] rounded-lg transition-colors">
            <RefreshCw className="w-4 h-4 text-[#a1a1aa] hover:text-[#fafafa]" />
          </button>
          <button className="p-2 hover:bg-[#27272a] rounded-lg transition-colors">
            <AlertCircle className="w-4 h-4 text-[#a1a1aa] hover:text-[#fafafa]" />
          </button>
        </div>
      </div>

      {/* Main Strategy Card */}
      <div className="glass rounded-xl p-6 mb-6 hover-glow animate-slideIn relative overflow-hidden">
        {/* Background Gradient */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7c3aed]/10 to-[#06b6d4]/10 rounded-full blur-3xl"></div>
        
        {/* Last Update */}
        <div className="flex items-center gap-2 text-xs text-[#a1a1aa] mb-4 relative z-10">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          <span>Last Update - 5 minutes ago</span>
          <AlertCircle className="w-3 h-3" />
        </div>

        {/* Strategy Header */}
        <div className="flex items-center gap-3 mb-6 relative z-10">
          <h3 className="text-2xl text-[#fafafa] font-bold">BTC/USDT Strategy</h3>
          <div className="w-7 h-7 bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg flex items-center justify-center text-white text-xs font-bold shadow-lg">
            B
          </div>
          <button className="p-1.5 hover:bg-[#27272a] rounded-lg transition-colors">
            <Copy className="w-4 h-4 text-[#a1a1aa] hover:text-[#fafafa]" />
          </button>
          <button className="p-1.5 hover:bg-[#27272a] rounded-lg transition-colors">
            <ExternalLink className="w-4 h-4 text-[#a1a1aa] hover:text-[#fafafa]" />
          </button>
          <button className="ml-auto px-4 py-2 bg-[#27272a] text-[#fafafa] text-sm rounded-lg hover:bg-[#3f3f46] transition-colors border border-[#3f3f46]">
            View Details
          </button>
        </div>

        {/* Performance */}
        <div className="mb-6 relative z-10">
          <div className="text-xs text-[#a1a1aa] mb-2 font-medium">Current Performance (ROI)</div>
          <div className="flex items-center gap-4">
            <span className="text-5xl text-green-400 font-bold">+24.86%</span>
            <button className="px-5 py-2.5 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white text-sm rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2 shadow-lg">
              <Play className="w-4 h-4" />
              Run Backtest
            </button>
            <button className="px-4 py-2 bg-[#27272a] text-[#fafafa] text-sm rounded-lg hover:bg-[#3f3f46] transition-colors border border-[#3f3f46]">
              Export Data
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-4 gap-4 relative z-10">
          {metrics.map((metric, index) => (
            <div key={index} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#fafafa] font-semibold">{metric.label}</span>
                <button className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>
              <div className="text-xs text-[#a1a1aa] mb-3">{metric.sublabel}</div>
              
              {/* Value Section */}
              {metric.label === "Momentum" && (
                <div className="bg-[#27272a]/50 rounded-lg p-3 border border-[#3f3f46] hover:border-[#7c3aed]/50 transition-colors">
                  <div className="text-xs text-[#a1a1aa] mb-1">Trend Direction</div>
                  <div className="text-xl text-green-400 font-bold">{metric.value}</div>
                  <div className="mt-2 px-2 py-1 bg-[#18181b] text-[#fafafa] text-xs rounded inline-block">
                    {metric.badge}
                  </div>
                </div>
              )}
              
              {metric.label === "Volatility" && (
                <div className="bg-[#27272a]/50 rounded-lg p-3 border border-[#3f3f46] hover:border-[#7c3aed]/50 transition-colors">
                  <div className="text-xs text-[#a1a1aa] mb-1">{metric.sublabel}</div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl text-[#fafafa] font-bold">{metric.value}</span>
                    <span className="text-xs text-green-400">{metric.change}</span>
                  </div>
                  <div className="mt-2 px-2 py-1 bg-[#18181b] text-[#fafafa] text-xs rounded inline-block">
                    {metric.badge}
                  </div>
                </div>
              )}
              
              {metric.label === "Volume" && (
                <div className="bg-[#27272a]/50 rounded-lg p-3 border border-[#3f3f46] hover:border-[#7c3aed]/50 transition-colors">
                  <div className="text-xs text-[#a1a1aa] mb-1">24H Volume</div>
                  <div className="text-xl text-[#fafafa] font-bold">{metric.value}</div>
                  <div className="mt-2 px-2 py-1 bg-[#18181b] text-[#fafafa] text-xs rounded inline-block">
                    {metric.badge}
                  </div>
                </div>
              )}
              
              {metric.label === "RSI" && (
                <div className="bg-[#27272a]/50 rounded-lg p-3 border border-[#3f3f46] hover:border-[#7c3aed]/50 transition-colors">
                  <div className="text-xs text-[#a1a1aa] mb-1">{metric.sublabel}</div>
                  <div className="text-xl text-[#fafafa] font-bold mb-1">{metric.value}</div>
                  <div className="text-xs text-[#06b6d4]">{metric.detail}</div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Backtest Period */}
      <div className="glass rounded-xl p-6 animate-slideIn" style={{ animationDelay: '0.1s' }}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-[#fafafa] font-semibold">Backtest Period</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 bg-[#27272a] text-[#fafafa] text-xs rounded-lg hover:bg-[#3f3f46] transition-colors border border-[#3f3f46]">
              6 Months
            </button>
            <button className="px-3 py-1.5 bg-[#27272a] text-[#fafafa] text-xs rounded-lg hover:bg-[#3f3f46] transition-colors border border-[#3f3f46]">
              1 Year
            </button>
          </div>
        </div>
        
        <div className="text-xs text-[#a1a1aa] mb-4 font-medium">Time Range (Months)</div>
        
        {/* Slider */}
        <div className="relative pt-8 pb-2">
          <input
            type="range"
            min="0"
            max="6"
            value={backtestPeriod}
            onChange={(e) => setBacktestPeriod(Number(e.target.value))}
            className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #7c3aed 0%, #06b6d4 ${(backtestPeriod / 6) * 100}%, #27272a ${(backtestPeriod / 6) * 100}%, #27272a 100%)`
            }}
          />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-full border-4 border-[#18181b] flex items-center justify-center shadow-lg">
            <span className="text-white text-sm font-bold">{backtestPeriod}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
