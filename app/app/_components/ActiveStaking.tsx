import { useState, useEffect } from "react";
import { Copy, ExternalLink, RefreshCw, BarChart3, AlertCircle, Play, TrendingUp, ArrowUpRight, TrendingDown, ArrowDownRight } from "lucide-react";

interface ActiveStrategyProps {
  recentBacktest: any | null; // Use flexible type or match full BacktestHistoryItem
}

export function ActiveStaking({ recentBacktest }: ActiveStrategyProps) {
  const [backtestPeriod, setBacktestPeriod] = useState(4);

  // Derive metrics from real backtest data if available
  const hasData = !!recentBacktest;
  const metrics = getMetricsFromBacktest(recentBacktest);
  const strategyName = recentBacktest?.strategy || recentBacktest?.backtestParams?.strategyName || "No Active Strategy";
  const symbol = recentBacktest?.symbol || recentBacktest?.backtestParams?.symbol || "---";
  const roi = recentBacktest?.result?.totalReturn || recentBacktest?.summary?.totalReturn || 0;
  const isPositive = roi >= 0;

  function getMetricsFromBacktest(data: any) {
    if (!data) return defaultMetrics;

    const result = data.result || data.summary || {};
    const params = data.backtestParams || {};
    
    return [
      { 
        label: "Win Rate", 
        sublabel: "Trade Win Ratio", 
        value: `${(result.winRate || 0).toFixed(2)}%`, 
        badge: "All", 
        type: (result.winRate || 0) > 50 ? "positive" : "neutral",
        detail: `${result.totalTrades || 0} Trades`
      },
      { 
        label: "Drawdown", 
        sublabel: "Max Drawdown", 
        value: `${(result.maxDrawdown || 0).toFixed(2)}%`, 
        badge: "Max", 
        type: "neutral",
        detail: "Risk Metric"
      },
      { 
        label: "Sharpe", 
        sublabel: "Sharpe Ratio", 
        value: (result.sharpeRatio || 0).toFixed(2), 
        badge: "Risk", 
        type: (result.sharpeRatio || 0) > 1 ? "positive" : "neutral" 
      },
      { 
        label: "PnL", 
        sublabel: "Profit and Loss", 
        value: `$${(result.totalProfit || (result.finalBalance - params.initialCapital) || 0).toFixed(2)}`, 
        detail: "Net Profit", 
        type: (result.totalProfit || 0) >= 0 ? "positive" : "negative" 
      },
    ];
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-[#fafafa]">Recent Strategy Performance</h2>
        <div className="flex items-center gap-2">
            {/* Buttons hidden or can be wired up later */}
        </div>
      </div>

      {hasData ? (
        /* Main Strategy Card with Real Data */
        <div className="bg-[#18181b] rounded-3xl p-6 md:p-8 mb-6 border border-[#27272a] hover:border-[#7c3aed]/30 transition-all relative overflow-hidden group">
            {/* Background Gradient */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-[#7c3aed]/10 to-[#06b6d4]/10 rounded-full blur-3xl opacity-50 group-hover:opacity-70 transition-opacity"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-[#06b6d4]/10 to-transparent rounded-full blur-3xl"></div>
            
            {/* Last Update */}
            <div className="flex items-center gap-2 text-xs text-[#a1a1aa] mb-4 relative z-10">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Completed: {new Date(recentBacktest.date || recentBacktest.createdAt).toLocaleString()}</span>
            <AlertCircle className="w-3 h-3" />
            </div>

            {/* Strategy Header */}
            <div className="flex flex-wrap items-center gap-3 mb-6 relative z-10">
            <h3 className="text-2xl md:text-3xl text-[#fafafa] font-bold">{symbol} Strategy</h3>
            <div className="px-3 py-1 bg-[#27272a] rounded-lg text-sm text-[#a1a1aa] border border-[#3f3f46]">
                {strategyName}
            </div>
            </div>

            {/* Performance */}
            <div className="mb-8 relative z-10">
            <div className="text-sm text-[#a1a1aa] mb-3 font-medium">Total Return (ROI)</div>
            <div className="flex flex-wrap items-center gap-4">
                <span className={`text-5xl md:text-6xl font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{Number(roi).toFixed(2)}%
                </span>
            </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10">
            {metrics.map((metric, index) => (
                <div key={index} className="relative">
                <div className="bg-[#27272a]/50 rounded-2xl p-4 border border-[#3f3f46] hover:border-[#7c3aed]/50 transition-all hover:scale-[1.02] cursor-pointer group/card">
                    <div className="flex items-center justify-between mb-3">
                    <span className="text-sm text-[#fafafa] font-semibold">{metric.label}</span>
                    <div className="px-2 py-0.5 bg-[#18181b] text-[#a1a1aa] text-xs rounded-full font-medium">
                        {metric.badge}
                    </div>
                    </div>
                    <div className="text-xs text-[#a1a1aa] mb-3">{metric.sublabel}</div>
                    
                    {/* Value Section */}
                    <div className={`text-2xl font-bold mb-1 ${metric.type === "positive" ? "text-green-400" : metric.type === "negative" ? "text-red-400" : "text-[#fafafa]"}`}>
                    {metric.value}
                    </div>
                    {metric.detail && (
                    <div className="text-xs text-[#06b6d4] mt-1">{metric.detail}</div>
                    )}
                </div>
                </div>
            ))}
            </div>
        </div>
      ) : (
        /* Empty State */
        <div className="bg-[#18181b] rounded-3xl p-12 mb-6 border border-[#27272a] flex flex-col items-center justify-center text-center">
            <BarChart3 className="w-16 h-16 text-[#27272a] mb-4" />
            <h3 className="text-xl text-[#fafafa] font-bold mb-2">No Active Strategies</h3>
            <p className="text-[#a1a1aa] mb-6">Run a backtest to see performance analysis here.</p>
        </div>
      )}
    </div>
  );
}

const defaultMetrics = [
    { label: "Win Rate", sublabel: "Trade Win Ratio", value: "--", badge: "All", type: "neutral" },
    { label: "Drawdown", sublabel: "Max Drawdown", value: "--", badge: "Max", type: "neutral" },
    { label: "Sharpe", sublabel: "Sharpe Ratio", value: "--", badge: "Risk", type: "neutral" },
    { label: "PnL", sublabel: "Profit and Loss", value: "--", detail: "Net Profit", type: "neutral" },
];
