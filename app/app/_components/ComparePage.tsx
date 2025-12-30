import { useState, useEffect } from "react";
import { ClipboardList, Trophy, Download } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { backtestService } from "../_api/backtest.service";

interface Backtest {
  id: string;
  name: string;
  strategy: string;
  symbol: string;
  date: string;
  selected: boolean;
  result?: any;
}

interface Metric {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface ComparisonResult {
  backtestId: string;
  name: string;
  strategy: string;
  metrics: Record<string, number>;
  ranks: Record<string, number>;
  avgRank: number;
}

export function ComparePage() {
  const [backtests, setBacktests] = useState<Backtest[]>([]);

  const [metrics, setMetrics] = useState<Metric[]>([
    { id: "total_return", name: "Total Return", description: "Overall profit/loss percentage", selected: true },
    { id: "sharpe_ratio", name: "Sharpe Ratio", description: "Risk-adjusted return metric", selected: true },
    // { id: "max_drawdown", name: "Max Drawdown", description: "Largest peak-to-trough decline", selected: true },
    // { id: "profit_factor", name: "Profit Factor", description: "Ratio of gross profit to gross loss", selected: false },
    // { id: "win_rate", name: "Win Rate", description: "Percentage of winning trades", selected: false },
    { id: "total_trades", name: "Total Trades", description: "Number of executed trades", selected: false },
  ]);

  const [results, setResults] = useState<ComparisonResult[] | null>(null);
  const [bestStrategy, setBestStrategy] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const history = await backtestService.getHistory();
        const mappedHistory = history.map(h => ({
          id: h.id,
          name: h.name,
          strategy: h.strategy,
          symbol: h.symbol,
          date: new Date(h.date).toLocaleDateString(),
          selected: false,
          result: h.result
        }));
        setBacktests(mappedHistory);
      } catch (error) {
        console.error("Failed to fetch backtest history", error);
      }
    };
    fetchHistory();
  }, []);

  const toggleBacktest = (id: string) => {
    setBacktests(backtests.map(b => b.id === id ? { ...b, selected: !b.selected } : b));
  };

  const toggleMetric = (id: string) => {
    setMetrics(metrics.map(m => m.id === id ? { ...m, selected: !m.selected } : m));
  };

  const selectedCount = backtests.filter(b => b.selected).length;
  const selectedMetrics = metrics.filter(m => m.selected);
  const canCompare = selectedCount >= 2 && selectedMetrics.length > 0;

  const runComparison = () => {
    setIsComparing(true);
    
    setTimeout(() => {
      const selectedBacktests = backtests.filter(b => b.selected);
      
      const comparisonResults: ComparisonResult[] = selectedBacktests.map(b => {
        const perf = b.result?.performance || {};
        const metrics: Record<string, number> = {
          total_return: perf.cstrategy ? parseFloat(perf.cstrategy.toFixed(2)) : 0,
          sharpe_ratio: perf.sharpe ? parseFloat(perf.sharpe.toFixed(2)) : 0,
          max_drawdown: 0, 
          profit_factor: 0, 
          win_rate: 0, 
          total_trades: perf.trades || 0,
        };
        
        return {
          backtestId: b.id,
          name: b.name,
          strategy: b.strategy,
          metrics,
          ranks: {}, 
          avgRank: 0 
        };
      });

      // Calculate ranks
      selectedMetrics.forEach(metric => {
        const sorted = [...comparisonResults].sort((a, b) => {
            return b.metrics[metric.id] - a.metrics[metric.id];
        });
        
        sorted.forEach((res, idx) => {
            res.ranks[metric.id] = idx + 1;
        });
      });

      // Calculate avg rank
      comparisonResults.forEach(res => {
        const ranks = selectedMetrics.map(m => res.ranks[m.id]);
        const sum = ranks.reduce((a, b) => a + b, 0);
        res.avgRank = sum / ranks.length;
      });
      
      // Sort by avg rank
      comparisonResults.sort((a, b) => a.avgRank - b.avgRank);

      setResults(comparisonResults);
      setBestStrategy(comparisonResults[0]);
      setIsComparing(false);
    }, 500);
  };

  return (
    <div className="overflow-y-auto p-8">
      {/* Page Header */}
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-[30px] font-bold gradient-text mb-2 leading-[36px]">
          Strategy Comparison
        </h1>
        <p className="text-base text-[#a1a1aa]">
          Compare multiple strategies side-by-side across key metrics
        </p>
      </div>

        {/* Selection Panel */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Select Backtests */}
          <Card variant="glass" className="p-6 animate-slideIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#fafafa]">Select Backtests</h3>
              <span className="px-3 py-1 bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] text-white text-xs rounded-full font-semibold">
                {selectedCount} Selected
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {backtests.length === 0 ? (
                <div className="text-center py-8 text-[#a1a1aa]">
                  <p>No backtests found.</p>
                  <p className="text-sm mt-2">Run a strategy in the Strategy Builder or Optimizer to see it here.</p>
                </div>
              ) : (
                backtests.map((backtest, index) => (
                <button
                  key={backtest.id}
                  onClick={() => toggleBacktest(backtest.id)}
                  className={`w-full p-4 rounded-lg border transition-all duration-300 text-left
                    ${backtest.selected
                      ? "bg-gradient-to-r from-[#7c3aed]/20 to-[#06b6d4]/20 border-[#7c3aed] shadow-lg"
                      : "bg-[#27272a] border-[#3f3f46] hover:border-[#7c3aed]/50"
                    }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${backtest.selected ? "border-[#7c3aed] bg-[#7c3aed]" : "border-[#a1a1aa]"}`}
                    >
                      {backtest.selected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#fafafa] font-semibold">{backtest.name}</p>
                      <p className="text-xs text-[#a1a1aa] mt-1">
                        {backtest.strategy} • {backtest.symbol} • {backtest.date}
                      </p>
                    </div>
                  </div>
                </button>
              )))}
            </div>
          </Card>

          {/* Select Metrics */}
          <Card variant="glass" className="p-6 animate-slideIn" style={{ animationDelay: "100ms" }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#fafafa]">Select Metrics</h3>
              <span className="px-3 py-1 bg-gradient-to-r from-[#06b6d4] to-[#7c3aed] text-white text-xs rounded-full font-semibold">
                {selectedMetrics.length} Selected
              </span>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {metrics.map((metric, index) => (
                <button
                  key={metric.id}
                  onClick={() => toggleMetric(metric.id)}
                  className={`w-full p-4 rounded-lg border transition-all duration-300 text-left
                    ${metric.selected
                      ? "bg-gradient-to-r from-[#06b6d4]/20 to-[#7c3aed]/20 border-[#06b6d4] shadow-lg"
                      : "bg-[#27272a] border-[#3f3f46] hover:border-[#06b6d4]/50"
                    }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all
                      ${metric.selected ? "border-[#06b6d4] bg-[#06b6d4]" : "border-[#a1a1aa]"}`}
                    >
                      {metric.selected && (
                        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-[#fafafa] font-semibold">{metric.name}</p>
                      <p className="text-xs text-[#a1a1aa] mt-1">{metric.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Compare Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          loading={isComparing}
          disabled={!canCompare}
          onClick={runComparison}
        >
          {isComparing 
            ? "Comparing strategies..." 
            : canCompare 
              ? `Compare ${selectedCount} Strategies` 
              : "Select at least 2 strategies"}
        </Button>

        {/* Results Section */}
        {results && bestStrategy && (
          <div className="mt-8 space-y-6 animate-fadeIn">
            {/* Best Overall Card */}
            <Card variant="glass" className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-yellow-500/20 to-orange-500/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10 flex items-center gap-6">
                <Trophy className="w-16 h-16 text-yellow-400 animate-float" />
                <div>
                  <p className="text-xs font-semibold text-[#a1a1aa] tracking-widest mb-2">BEST OVERALL STRATEGY</p>
                  <h3 className="text-3xl font-bold text-[#fafafa] mb-1">{bestStrategy.name}</h3>
                  <p className="text-[#a1a1aa]">Ranked #1 most often across all metrics</p>
                </div>
              </div>
            </Card>

            {/* Comparison Table */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#fafafa]">Comparison Table</h3>
                <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                  Export CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#3f3f46]">
                      <th className="text-left py-4 px-4 text-xs font-semibold text-[#a1a1aa]">Strategy</th>
                      {selectedMetrics.map(metric => (
                        <th key={metric.id} className="text-right py-4 px-4 text-xs font-semibold text-[#a1a1aa]">
                          {metric.name}
                        </th>
                      ))}
                      <th className="text-right py-4 px-4 text-xs font-semibold text-[#a1a1aa]">Avg Rank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr
                        key={result.backtestId}
                        className={`border-b border-[#3f3f46] hover:bg-[#27272a]/50 transition-colors
                          ${index === 0 ? "bg-gradient-to-r from-yellow-500/10 to-orange-500/10" : ""}`}
                      >
                        <td className="py-4 px-4">
                          <p className="text-[#fafafa] font-semibold">{result.name}</p>
                          <p className="text-xs text-[#a1a1aa] mt-1">{result.strategy}</p>
                        </td>
                        {selectedMetrics.map(metric => {
                          const value = result.metrics[metric.id];
                          const rank = result.ranks[metric.id];
                          return (
                            <td key={metric.id} className="py-4 px-4 text-right">
                              <p className={`font-semibold ${
                                metric.id === "total_return" && value > 0 ? "text-green-400" :
                                metric.id === "max_drawdown" ? "text-red-400" :
                                "text-[#fafafa]"
                              }`}>
                                {metric.id === "total_return" || metric.id === "max_drawdown" || metric.id === "win_rate"
                                  ? `${value > 0 && metric.id !== "max_drawdown" ? "+" : ""}${value}%`
                                  : value}
                              </p>
                              <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-semibold
                                ${rank === 1 ? "bg-yellow-500/20 text-yellow-400" : ""}
                                ${rank === 2 ? "bg-gray-500/20 text-gray-400" : ""}
                                ${rank === 3 ? "bg-orange-500/20 text-orange-400" : ""}
                                ${rank > 3 ? "bg-[#27272a] text-[#a1a1aa]" : ""}`}
                              >
                                #{rank}
                              </span>
                            </td>
                          );
                        })}
                        <td className="py-4 px-4 text-right">
                          <p className="text-2xl font-bold text-[#fafafa]">{result.avgRank.toFixed(1)}</p>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* Metric Rankings Grid */}
            <div>
              <h3 className="text-xl font-bold text-[#fafafa] mb-4">Metric Rankings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {selectedMetrics.map((metric, index) => (
                  <Card
                    key={metric.id}
                    variant="glass"
                    className="p-4 hover:scale-105 transition-transform"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h4 className="font-semibold text-[#fafafa] mb-3">{metric.name}</h4>
                    <div className="space-y-2">
                      {results.slice(0, 3).map((result, i) => (
                        <div key={result.backtestId} className="flex items-center gap-3 hover:bg-[#27272a]/50 rounded-lg p-2 transition-colors">
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                            ${i === 0 ? "bg-yellow-500 text-white" : ""}
                            ${i === 1 ? "bg-gray-400 text-white" : ""}
                            ${i === 2 ? "bg-orange-500 text-white" : ""}`}
                          >
                            {i + 1}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-[#fafafa] truncate">{result.name}</p>
                          </div>
                          <p className="text-sm font-semibold text-[#a1a1aa]">
                            {result.metrics[metric.id]}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
  );
}
