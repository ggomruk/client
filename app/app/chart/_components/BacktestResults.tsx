'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, TrendingUp, TrendingDown, Download } from 'lucide-react';
import { useBacktest } from '../../_provider/backtest.context';

export default function BacktestResults() {
  const { result, isRunning } = useBacktest();
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'trades' | 'stats'>('overview');

  if (!result && !isRunning) {
    return null;
  }

  const exportToCSV = () => {
    if (!result) return;

    const csv = `Metric,Value
Strategy,${result.strategyName}
Total Return,${result.totalReturn.toFixed(2)}%
Sharpe Ratio,${result.sharpeRatio.toFixed(2)}
Max Drawdown,${result.maxDrawdown.toFixed(2)}%
Total Trades,${result.totalTrades}
Win Rate,${result.winRate.toFixed(2)}%
Final Balance,${result.finalBalance.toFixed(2)} USDT
Leverage,${result.leverageApplied}x`;

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backtest_${result.backtestId}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="border-t border-[#3f3f46] bg-[#18181b]">
      {/* Header - Always Visible */}
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-[#27272a]/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-text-secondary" />
            ) : (
              <ChevronUp className="w-5 h-5 text-text-secondary" />
            )}
            <h3 className="text-lg font-semibold text-text-primary">Backtest Results</h3>
          </div>
          
          {result && !isExpanded && (
            <div className="flex items-center gap-4 text-sm">
              <div className={`flex items-center gap-1 ${result.totalReturn >= 0 ? 'text-[#05df72]' : 'text-[#ff6467]'}`}>
                {result.totalReturn >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                <span className="font-semibold">{result.totalReturn.toFixed(2)}%</span>
              </div>
              <div className="text-text-secondary">
                Win Rate: <span className="text-text-primary font-medium">{result.winRate.toFixed(1)}%</span>
              </div>
              <div className="text-text-secondary">
                Trades: <span className="text-text-primary font-medium">{result.totalTrades}</span>
              </div>
            </div>
          )}
        </div>

        {result && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              exportToCSV();
            }}
            className="flex items-center gap-2 px-3 py-1.5 bg-[#27272a] hover:bg-[#3f3f46] border border-[#3f3f46] rounded-lg text-sm text-text-primary transition-colors"
          >
            <Download className="w-4 h-4" />
            Export
          </button>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && result && (
        <div className="border-t border-[#3f3f46]">
          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4 p-4 bg-[#09090b]">
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">Strategy</span>
              <span className="text-sm font-semibold text-text-primary mt-1">{result.strategyName}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">Total Return</span>
              <span className={`text-sm font-semibold mt-1 ${result.totalReturn >= 0 ? 'text-[#05df72]' : 'text-[#ff6467]'}`}>
                {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
              </span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">Sharpe Ratio</span>
              <span className="text-sm font-semibold text-text-primary mt-1">{result.sharpeRatio.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">Max Drawdown</span>
              <span className="text-sm font-semibold text-[#ff6467] mt-1">{result.maxDrawdown.toFixed(2)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">Total Trades</span>
              <span className="text-sm font-semibold text-text-primary mt-1">{result.totalTrades}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">Win Rate</span>
              <span className="text-sm font-semibold text-text-primary mt-1">{result.winRate.toFixed(2)}%</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">Final Balance</span>
              <span className="text-sm font-semibold text-text-primary mt-1">${result.finalBalance.toFixed(2)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-text-secondary">Leverage</span>
              <span className="text-sm font-semibold text-text-primary mt-1">{result.leverageApplied}x</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 px-4 border-t border-[#3f3f46] bg-[#18181b]">
            <button
              onClick={() => setActiveTab('overview')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'overview'
                  ? 'text-[#7c3aed] border-[#7c3aed]'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('trades')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'trades'
                  ? 'text-[#7c3aed] border-[#7c3aed]'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              Trade Log
            </button>
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === 'stats'
                  ? 'text-[#7c3aed] border-[#7c3aed]'
                  : 'text-text-secondary border-transparent hover:text-text-primary'
              }`}
            >
              Statistics
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-4 bg-[#09090b] max-h-64 overflow-y-auto">
            {activeTab === 'overview' && (
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                  <span className="text-sm text-text-secondary">Profit/Loss</span>
                  <span className={`text-sm font-semibold ${result.totalReturn >= 0 ? 'text-[#05df72]' : 'text-[#ff6467]'}`}>
                    ${(result.finalBalance - (result.leveredPerformance?.initial_balance || 10000)).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                  <span className="text-sm text-text-secondary">Return on Investment</span>
                  <span className={`text-sm font-semibold ${result.totalReturn >= 0 ? 'text-[#05df72]' : 'text-[#ff6467]'}`}>
                    {result.totalReturn.toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                  <span className="text-sm text-text-secondary">Risk-Adjusted Return (Sharpe)</span>
                  <span className="text-sm font-semibold text-text-primary">{result.sharpeRatio.toFixed(3)}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                  <span className="text-sm text-text-secondary">Maximum Drawdown</span>
                  <span className="text-sm font-semibold text-[#ff6467]">{result.maxDrawdown.toFixed(2)}%</span>
                </div>
              </div>
            )}

            {activeTab === 'trades' && (
              <div className="space-y-2">
                {result.performance?.trades && result.performance.trades.length > 0 ? (
                  result.performance.trades.map((trade: any, index: number) => (
                    <div key={index} className="flex justify-between items-center p-3 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                      <div className="flex flex-col">
                        <span className={`text-sm font-semibold ${trade.direction === 'long' ? 'text-[#05df72]' : 'text-[#ff6467]'}`}>
                          {trade.direction.toUpperCase()}
                        </span>
                        <span className="text-xs text-text-secondary">{new Date(trade.entry_time).toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`text-sm font-semibold ${trade.pnl >= 0 ? 'text-[#05df72]' : 'text-[#ff6467]'}`}>
                          {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}%
                        </span>
                        <span className="text-xs text-text-secondary">Exit: {new Date(trade.exit_time).toLocaleString()}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-text-secondary">
                    <p className="text-sm">No trades found</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stats' && (
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                  <span className="text-xs text-text-secondary block">Winning Trades</span>
                  <span className="text-sm font-semibold text-[#05df72] block mt-1">
                    {Math.round(result.totalTrades * (result.winRate / 100))}
                  </span>
                </div>
                <div className="p-3 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                  <span className="text-xs text-text-secondary block">Losing Trades</span>
                  <span className="text-sm font-semibold text-[#ff6467] block mt-1">
                    {result.totalTrades - Math.round(result.totalTrades * (result.winRate / 100))}
                  </span>
                </div>
                <div className="p-3 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                  <span className="text-xs text-text-secondary block">Win Rate</span>
                  <span className="text-sm font-semibold text-text-primary block mt-1">{result.winRate.toFixed(1)}%</span>
                </div>
                <div className="p-3 bg-[#18181b] rounded-lg border border-[#3f3f46]">
                  <span className="text-xs text-text-secondary block">Leverage Used</span>
                  <span className="text-sm font-semibold text-text-primary block mt-1">{result.leverageApplied}x</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {isRunning && (
        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-3 text-text-secondary">
            <div className="w-5 h-5 border-2 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-sm">Running backtest...</span>
          </div>
        </div>
      )}
    </div>
  );
}
