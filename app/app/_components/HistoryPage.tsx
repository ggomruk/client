import { useState } from "react";
import { Clock, RefreshCw, TrendingUp, TrendingDown, Download, X } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface Backtest {
  id: string;
  symbol: string;
  strategy: string;
  status: "completed" | "processing" | "pending" | "error";
  totalReturn?: number;
  progress?: number;
  timestamp: string;
  sharpeRatio?: number;
  maxDrawdown?: number;
  profitFactor?: number;
  winRate?: number;
  totalTrades?: number;
}

export function HistoryPage() {
  const [activeFilter, setActiveFilter] = useState<"all" | "done" | "running" | "error">("all");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedBacktest, setSelectedBacktest] = useState<Backtest | null>(null);
  const [backtests, setBacktests] = useState<Backtest[]>([
    {
      id: "1",
      symbol: "BTCUSDT",
      strategy: "MACD",
      status: "completed",
      totalReturn: 24.86,
      timestamp: "2h ago",
      sharpeRatio: 1.84,
      maxDrawdown: -8.4,
      profitFactor: 2.34,
      winRate: 68.5,
      totalTrades: 1247
    },
    {
      id: "2",
      symbol: "ETHUSDT",
      strategy: "RSI",
      status: "completed",
      totalReturn: -5.67,
      timestamp: "4h ago",
      sharpeRatio: 1.52,
      maxDrawdown: -12.3,
      profitFactor: 1.89,
      winRate: 62.3,
      totalTrades: 1156
    },
    {
      id: "3",
      symbol: "BTCUSDT",
      strategy: "Bollinger Bands",
      status: "processing",
      progress: 67,
      timestamp: "10m ago"
    },
    {
      id: "4",
      symbol: "SOLUSDT",
      strategy: "SMA Crossover",
      status: "pending",
      timestamp: "15m ago"
    },
    {
      id: "5",
      symbol: "ADAUSDT",
      strategy: "Stochastic",
      status: "error",
      timestamp: "1d ago"
    },
    {
      id: "6",
      symbol: "BTCUSDT",
      strategy: "MACD",
      status: "completed",
      totalReturn: 18.45,
      timestamp: "1d ago",
      sharpeRatio: 1.72,
      maxDrawdown: -9.2,
      profitFactor: 2.18,
      winRate: 65.4,
      totalTrades: 1198
    },
    {
      id: "7",
      symbol: "ETHUSDT",
      strategy: "RSI",
      status: "completed",
      totalReturn: 12.34,
      timestamp: "2d ago",
      sharpeRatio: 1.65,
      maxDrawdown: -7.8,
      profitFactor: 2.05,
      winRate: 59.8,
      totalTrades: 1089
    },
  ]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 1000);
  };

  const filteredBacktests = backtests.filter(b => {
    if (activeFilter === "all") return true;
    if (activeFilter === "done") return b.status === "completed";
    if (activeFilter === "running") return b.status === "processing" || b.status === "pending";
    if (activeFilter === "error") return b.status === "error";
    return true;
  });

  const getStatusBadge = (status: Backtest["status"]) => {
    const badges = {
      completed: { bg: "bg-green-500", text: "Completed" },
      processing: { bg: "bg-blue-500", text: "Processing" },
      pending: { bg: "bg-yellow-500", text: "Pending" },
      error: { bg: "bg-red-500", text: "Error" }
    };
    const badge = badges[status];
    return (
      <span className={`${badge.bg} text-white text-xs px-2 py-1 rounded-full font-semibold`}>
        {badge.text}
      </span>
    );
  };

  return (
    <div className="flex-1 bg-[#09090b] overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Page Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-xl flex items-center justify-center animate-float shadow-lg">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-3xl font-bold gradient-text">Backtest History</h1>
              <p className="text-[#a1a1aa] text-sm mt-1">View and manage all your backtest results</p>
            </div>
            <Button
              variant="ghost"
              size="md"
              leftIcon={<RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />}
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              Refresh
            </Button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 mb-6 animate-slideIn">
          <button
            onClick={() => setActiveFilter("all")}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300
              ${activeFilter === "all" 
                ? "bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white shadow-lg scale-105" 
                : "bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] hover:text-[#fafafa]"}`}
          >
            All
          </button>
          <button
            onClick={() => setActiveFilter("done")}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300
              ${activeFilter === "done" 
                ? "bg-green-500 text-white shadow-lg scale-105" 
                : "bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] hover:text-[#fafafa]"}`}
          >
            Done
          </button>
          <button
            onClick={() => setActiveFilter("running")}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300
              ${activeFilter === "running" 
                ? "bg-blue-500 text-white shadow-lg scale-105" 
                : "bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] hover:text-[#fafafa]"}`}
          >
            Running
          </button>
          <button
            onClick={() => setActiveFilter("error")}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-300
              ${activeFilter === "error" 
                ? "bg-red-500 text-white shadow-lg scale-105" 
                : "bg-[#27272a] text-[#a1a1aa] hover:bg-[#3f3f46] hover:text-[#fafafa]"}`}
          >
            Error
          </button>
        </div>

        {/* Backtests Grid */}
        {filteredBacktests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBacktests.map((backtest, index) => (
              <Card
                key={backtest.id}
                variant="glass"
                className={`p-4 cursor-pointer hover:scale-105 hover:shadow-2xl transition-all duration-300
                  ${backtest.status === "processing" ? "animate-pulse" : ""}`}
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setSelectedBacktest(backtest)}
              >
                {/* Top Row */}
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-[#fafafa]">{backtest.symbol}</h3>
                  {getStatusBadge(backtest.status)}
                </div>

                {/* Middle Row - Completed */}
                {backtest.status === "completed" && backtest.totalReturn !== undefined && (
                  <div className="mb-3">
                    <div className="flex items-center gap-2">
                      {backtest.totalReturn > 0 ? (
                        <TrendingUp className="w-5 h-5 text-green-400" />
                      ) : (
                        <TrendingDown className="w-5 h-5 text-red-400" />
                      )}
                      <span className={`text-2xl font-bold ${backtest.totalReturn > 0 ? "text-green-400" : "text-red-400"}`}>
                        {backtest.totalReturn > 0 ? "+" : ""}{backtest.totalReturn}%
                      </span>
                    </div>
                  </div>
                )}

                {/* Middle Row - Processing */}
                {backtest.status === "processing" && backtest.progress !== undefined && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-[#a1a1aa]">Progress</span>
                      <span className="text-xs font-semibold text-blue-400">{backtest.progress}%</span>
                    </div>
                    <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 animate-shimmer"
                        style={{ width: `${backtest.progress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Middle Row - Pending */}
                {backtest.status === "pending" && (
                  <div className="mb-3">
                    <span className="text-sm text-yellow-400">Waiting to start...</span>
                  </div>
                )}

                {/* Middle Row - Error */}
                {backtest.status === "error" && (
                  <div className="mb-3">
                    <span className="text-sm text-red-400">Failed to complete</span>
                  </div>
                )}

                {/* Bottom Row */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#a1a1aa]">{backtest.timestamp}</span>
                  <span className="text-[#a1a1aa]">{backtest.strategy}</span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          // Empty State
          <Card variant="glass" className="p-12 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <Clock className="w-8 h-8 text-[#a1a1aa]" />
            </div>
            <h3 className="text-lg font-bold text-[#fafafa] mb-2">No {activeFilter === "all" ? "" : activeFilter} backtests</h3>
            <p className="text-sm text-[#a1a1aa]">
              {activeFilter === "error" 
                ? "All your backtests completed successfully" 
                : "Run your first backtest on the Dashboard"}
            </p>
          </Card>
        )}

        {/* Details Modal */}
        {selectedBacktest && selectedBacktest.status === "completed" && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn"
            onClick={() => setSelectedBacktest(null)}
          >
            <Card
              variant="glass"
              className="max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-slideIn"
              onClick={(e) => e?.stopPropagation()}
            >
              <div className="sticky top-0 bg-[#18181b]/95 backdrop-blur-sm p-6 border-b border-[#3f3f46] z-10">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold gradient-text">{selectedBacktest.symbol}</h2>
                    <p className="text-sm text-[#a1a1aa] mt-1">{selectedBacktest.strategy} • {selectedBacktest.timestamp}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                      Export CSV
                    </Button>
                    <button
                      onClick={() => setSelectedBacktest(null)}
                      className="w-8 h-8 flex items-center justify-center text-[#a1a1aa] hover:text-[#fafafa] hover:bg-[#27272a] rounded-lg transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-6">
                {/* Key Metrics Grid */}
                <h3 className="text-lg font-bold text-[#fafafa] mb-4">Performance Metrics</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs text-[#a1a1aa] mb-1">Total Return</p>
                    <p className={`text-2xl font-bold ${selectedBacktest.totalReturn! > 0 ? "text-green-400" : "text-red-400"}`}>
                      {selectedBacktest.totalReturn! > 0 ? "+" : ""}{selectedBacktest.totalReturn}%
                    </p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs text-[#a1a1aa] mb-1">Sharpe Ratio</p>
                    <p className="text-2xl font-bold text-[#fafafa]">{selectedBacktest.sharpeRatio}</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs text-[#a1a1aa] mb-1">Max Drawdown</p>
                    <p className="text-2xl font-bold text-red-400">{selectedBacktest.maxDrawdown}%</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs text-[#a1a1aa] mb-1">Profit Factor</p>
                    <p className="text-2xl font-bold text-[#fafafa]">{selectedBacktest.profitFactor}</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs text-[#a1a1aa] mb-1">Win Rate</p>
                    <p className="text-2xl font-bold text-[#06b6d4]">{selectedBacktest.winRate}%</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-xs text-[#a1a1aa] mb-1">Total Trades</p>
                    <p className="text-2xl font-bold text-[#fafafa]">{selectedBacktest.totalTrades}</p>
                  </div>
                </div>

                {/* Equity Curve Placeholder */}
                <h3 className="text-lg font-bold text-[#fafafa] mb-4">Equity Curve</h3>
                <div className="glass rounded-lg p-12 text-center mb-8 border-dashed">
                  <TrendingUp className="w-12 h-12 text-[#a1a1aa] mx-auto mb-3" />
                  <p className="text-sm text-[#a1a1aa]">Equity curve chart coming soon</p>
                </div>

                {/* Trade List Placeholder */}
                <h3 className="text-lg font-bold text-[#fafafa] mb-4">Trade History</h3>
                <div className="glass rounded-lg p-12 text-center border-dashed">
                  <Clock className="w-12 h-12 text-[#a1a1aa] mx-auto mb-3" />
                  <p className="text-sm text-[#a1a1aa]">Trade list coming soon</p>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
