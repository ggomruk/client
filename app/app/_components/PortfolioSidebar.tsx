import { TrendingUp, TrendingDown, Activity, Plus } from "lucide-react";

export function PortfolioSidebar() {
  return (
    <div className="w-80 bg-[#18181b] border-l border-[#3f3f46] p-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-lg flex items-center justify-center shadow-lg">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <span className="text-[#fafafa] font-semibold">Performance</span>
        </div>
        <button className="px-3 py-1.5 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white text-xs rounded-lg hover:opacity-90 transition-opacity flex items-center gap-1 shadow-lg">
          <Plus className="w-3 h-3" />
          New Test
        </button>
      </div>

      {/* Portfolio Info */}
      <div className="mb-8 animate-slideIn">
        <h2 className="text-[#fafafa] text-xl font-bold mb-2">Backtest Overview</h2>
        <p className="text-sm text-[#a1a1aa]">
          Analyze your trading strategies with historical data and optimize performance.
        </p>
      </div>

      {/* Stats */}
      <div className="space-y-4">
        {/* Main P/L Card */}
        <div className="glass rounded-xl p-4 relative overflow-hidden hover-glow">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 rounded-full blur-3xl"></div>
          <div className="flex items-center justify-between mb-2 relative z-10">
            <span className="text-xs text-[#a1a1aa] font-medium">Total Profit/Loss</span>
            <Activity className="w-4 h-4 text-[#06b6d4]" />
          </div>
          <div className="text-3xl text-green-400 font-bold mb-1 relative z-10">+$12,566</div>
          <div className="flex items-center gap-1 text-xs text-green-400 relative z-10">
            <TrendingUp className="w-3 h-3" />
            <span>+24.8%</span>
          </div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-lg p-3 hover:bg-[#27272a]/50 transition-colors">
            <div className="text-xs text-[#a1a1aa] mb-1">Win Rate</div>
            <div className="text-xl text-[#fafafa] font-bold">68.5%</div>
          </div>
          <div className="glass rounded-lg p-3 hover:bg-[#27272a]/50 transition-colors">
            <div className="text-xs text-[#a1a1aa] mb-1">Total Trades</div>
            <div className="text-xl text-[#fafafa] font-bold">1,247</div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="glass rounded-lg p-3 hover:bg-[#27272a]/50 transition-colors">
            <div className="text-xs text-[#a1a1aa] mb-1">Avg Gain</div>
            <div className="text-xl text-green-400 font-bold">+2.4%</div>
          </div>
          <div className="glass rounded-lg p-3 hover:bg-[#27272a]/50 transition-colors">
            <div className="text-xs text-[#a1a1aa] mb-1">Avg Loss</div>
            <div className="text-xl text-red-400 font-bold">-1.2%</div>
          </div>
        </div>

        <div className="glass rounded-lg p-3 hover:bg-[#27272a]/50 transition-colors">
          <div className="text-xs text-[#a1a1aa] mb-1">Sharpe Ratio</div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl text-[#fafafa] font-bold">1.84</span>
            <span className="text-xs text-green-400">Excellent</span>
          </div>
        </div>

        <div className="glass rounded-lg p-3 hover:bg-[#27272a]/50 transition-colors relative overflow-hidden">
          <div className="text-xs text-[#a1a1aa] mb-1">Max Drawdown</div>
          <div className="text-xl text-red-400 font-bold">-8.4%</div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#27272a] rounded-full overflow-hidden">
            <div className="h-full bg-red-400" style={{ width: '8.4%' }}></div>
          </div>
        </div>

        {/* ROI Distribution */}
        <div className="glass rounded-lg p-3 mt-4">
          <div className="text-xs text-[#a1a1aa] mb-3 font-medium">ROI Distribution</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-[#a1a1aa]">Positive Trades</span>
              <span className="text-green-400 font-semibold">854 (68.5%)</span>
            </div>
            <div className="w-full h-2 bg-[#27272a] rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7c3aed] to-[#06b6d4]" style={{ width: '68.5%' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
