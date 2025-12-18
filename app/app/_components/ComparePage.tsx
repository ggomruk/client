import { useState } from "react";
import { ClipboardList, Trophy, Download } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";

interface Backtest {
  id: string;
  name: string;
  strategy: string;
  symbol: string;
  date: string;
  selected: boolean;
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
  const [backtests, setBacktests] = useState<Backtest[]>([
    { id: "1", name: "MACD Strategy", strategy: "MACD", symbol: "BTCUSDT", date: "Jan 15, 2024", selected: false },
    { id: "2", name: "RSI Strategy", strategy: "RSI", symbol: "BTCUSDT", date: "Jan 16, 2024", selected: false },
    { id: "3", name: "Bollinger Strategy", strategy: "Bollinger Bands", symbol: "ETHUSDT", date: "Jan 17, 2024", selected: false },
    { id: "4", name: "SMA Crossover", strategy: "SMA", symbol: "BTCUSDT", date: "Jan 18, 2024", selected: false },
  ]);

  const [metrics, setMetrics] = useState<Metric[]>([
    { id: "total_return", name: "Total Return", description: "Overall profit/loss percentage", selected: true },
    { id: "sharpe_ratio", name: "Sharpe Ratio", description: "Risk-adjusted return metric", selected: true },
    { id: "max_drawdown", name: "Max Drawdown", description: "Largest peak-to-trough decline", selected: true },
    { id: "profit_factor", name: "Profit Factor", description: "Ratio of gross profit to gross loss", selected: false },
    { id: "win_rate", name: "Win Rate", description: "Percentage of winning trades", selected: false },
    { id: "total_trades", name: "Total Trades", description: "Number of executed trades", selected: false },
  ]);

  const [results, setResults] = useState<ComparisonResult[] | null>(null);
  const [bestStrategy, setBestStrategy] = useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);

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
      // Generate mock comparison results
      const mockResults: ComparisonResult[] = backtests
        .filter(b => b.selected)
        .map((b, index) => ({
          backtestId: b.id,
          name: b.name,
          strategy: b.strategy,
          metrics: {
            total_return: [24.86, 18.45, 15.23, 22.10][index] || 0,
            sharpe_ratio: [1.84, 1.52, 1.38, 1.67][index] || 0,
            max_drawdown: [-8.4, -12.3, -9.8, -10.5][index] || 0,
            profit_factor: [2.34, 1.89, 1.75, 2.12][index] || 0,
            win_rate: [68.5, 62.3, 59.8, 65.4][index] || 0,
            total_trades: [1247, 1156, 1089, 1198][index] || 0,
          },
          ranks: {
            total_return: index + 1,
            sharpe_ratio: index + 1,
            max_drawdown: index + 1,
            profit_factor: index + 1,
            win_rate: index + 1,
            total_trades: index + 1,
          },
          avgRank: index + 1
        }));
      
      setResults(mockResults);
      setBestStrategy(mockResults[0]);
      setIsComparing(false);
    }, 1500);
  };

  return (
    <div className="flex-1 bg-[#09090b] overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Page Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-xl flex items-center justify-center animate-float shadow-lg">
              <ClipboardList className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Strategy Comparison</h1>
              <p className="text-[#a1a1aa] text-sm mt-1">Compare multiple strategies side-by-side across key metrics</p>
            </div>
          </div>
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
              {backtests.map((backtest, index) => (
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
              ))}
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
    </div>
  );
}
