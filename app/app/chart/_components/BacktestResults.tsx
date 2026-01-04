'use client';

import React, { useState } from 'react';
import { TrendingUp, TrendingDown, Download, Activity, BarChart2, Percent, DollarSign, X } from 'lucide-react';
import { useBacktest } from '../../_provider/backtest.context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../_components/ui/dialog";
import { Button } from "../../_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../_components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../_components/ui/tabs";
import { ScrollArea } from "../../_components/ui/scroll-area";

export default function BacktestResults() {
  const { result, isRunning, clearResults } = useBacktest();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (!result && !isRunning) {
    return null;
  }

  if (isRunning) {
    return (
      <div className="w-full bg-[#18181b] border border-[#3f3f46] rounded-lg text-[#fafafa] mt-4 p-4">
        <div className="flex items-center justify-center gap-2">
          <Activity className="w-4 h-4 animate-spin text-[#7c3aed]" />
          <span className="text-sm">Running backtest...</span>
        </div>
      </div>
    );
  }

  if (!result) return null;

  const profitLoss = result.finalBalance - result.initialBalance;

  const exportToCSV = () => {
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
    <>
      {/* Summary Card */}
      <div className="w-full bg-[#18181b] border-t border-[#3f3f46] text-[#fafafa]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#3f3f46]">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <h3 className="text-sm font-medium">Backtest Results</h3>
          </div>
          <button 
            onClick={clearResults}
            className="text-[#a1a1aa] hover:text-[#fafafa] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Metrics */}
        <div className="px-4 py-3 space-y-3">
          {/* Total Return */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#a1a1aa]">Total Return</span>
            <span className={`text-sm font-semibold ${result.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {result.totalReturn >= 0 ? '+' : ''}{result.totalReturn.toFixed(2)}%
            </span>
          </div>

          {/* Win Rate */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#a1a1aa]">Win Rate</span>
            <span className="text-sm font-semibold">{result.winRate.toFixed(2)}%</span>
          </div>

          {/* Total Trades */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#a1a1aa]">Total Trades</span>
            <span className="text-sm font-semibold">{result.totalTrades}</span>
          </div>

          {/* Profit/Loss */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#a1a1aa]">Profit/Loss</span>
            <span className={`text-sm font-semibold ${profitLoss >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              ${profitLoss.toFixed(2)}
            </span>
          </div>
        </div>

        {/* View Detailed Report Button */}
        <div className="px-4 pb-4">
          <button 
            onClick={() => setIsDetailsOpen(true)}
            className="w-full bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] text-sm font-medium py-2 px-4 rounded-lg transition-colors"
          >
            View Detailed Report
          </button>
        </div>
      </div>

      {/* Details Dialog */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl bg-[#18181b] border-[#3f3f46] text-[#fafafa] h-[80vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 border-b border-[#3f3f46]">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold">Backtest Analysis</DialogTitle>
                <DialogDescription className="text-[#a1a1aa]">
                  {result.strategyName} • {new Date(result.startTime).toLocaleDateString()} - {new Date(result.endTime).toLocaleDateString()}
                </DialogDescription>
              </div>
              <Button variant="outline" size="sm" onClick={exportToCSV} className="gap-2 border-[#3f3f46] hover:bg-[#27272a]">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden">
             <Tabs defaultValue="overview" className="h-full flex flex-col">
              <div className="px-6 pt-4">
                <TabsList className="bg-[#27272a] text-[#a1a1aa]">
                  <TabsTrigger value="overview" className="data-[state=active]:bg-[#3f3f46] data-[state=active]:text-[#fafafa]">Overview</TabsTrigger>
                  <TabsTrigger value="trades" className="data-[state=active]:bg-[#3f3f46] data-[state=active]:text-[#fafafa]">Trades</TabsTrigger>
                  <TabsTrigger value="metrics" className="data-[state=active]:bg-[#3f3f46] data-[state=active]:text-[#fafafa]">Metrics</TabsTrigger>
                </TabsList>
              </div>

              <ScrollArea className="flex-1 p-6">
                <TabsContent value="overview" className="mt-0 space-y-6">
                  {/* Key Metrics Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <MetricCard 
                      label="Total Return" 
                      value={`${result.totalReturn.toFixed(2)}%`} 
                      icon={<Percent className="w-4 h-4" />}
                      trend={result.totalReturn >= 0 ? 'up' : 'down'}
                    />
                    <MetricCard 
                      label="Net Profit" 
                      value={`${(result.finalBalance - result.initialBalance).toFixed(2)} USDT`} 
                      icon={<DollarSign className="w-4 h-4" />}
                      trend={result.finalBalance >= result.initialBalance ? 'up' : 'down'}
                    />
                    <MetricCard 
                      label="Win Rate" 
                      value={`${result.winRate.toFixed(2)}%`} 
                      icon={<Activity className="w-4 h-4" />}
                    />
                    <MetricCard 
                      label="Profit Factor" 
                      value={result.profitFactor.toFixed(2)} 
                      icon={<BarChart2 className="w-4 h-4" />}
                    />
                  </div>

                  {/* Equity Curve Placeholder - In a real app, use a chart library here */}
                  <Card className="bg-[#27272a]/50 border-[#3f3f46]">
                    <CardHeader>
                      <CardTitle className="text-sm font-medium">Equity Curve</CardTitle>
                    </CardHeader>
                    <CardContent className="h-64 flex items-center justify-center text-[#a1a1aa]">
                      Equity Chart Visualization
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="trades" className="mt-0">
                  <div className="space-y-2">
                    {result.trades.map((trade, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-[#27272a]/50 border border-[#3f3f46]">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${trade.type === 'buy' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                            {trade.type === 'buy' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                          </div>
                          <div>
                            <div className="font-medium text-sm">{trade.symbol}</div>
                            <div className="text-xs text-[#a1a1aa]">{new Date(trade.entryTime).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-medium text-sm ${trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)} USDT
                          </div>
                          <div className="text-xs text-[#a1a1aa]">{trade.pnlPercent.toFixed(2)}%</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="metrics" className="mt-0">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-[#a1a1aa]">Risk Metrics</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm p-2 bg-[#27272a]/30 rounded">
                            <span>Max Drawdown</span>
                            <span className="font-mono">{result.maxDrawdown.toFixed(2)}%</span>
                          </div>
                          <div className="flex justify-between text-sm p-2 bg-[#27272a]/30 rounded">
                            <span>Sharpe Ratio</span>
                            <span className="font-mono">{result.sharpeRatio.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <h3 className="text-sm font-medium text-[#a1a1aa]">Trade Stats</h3>
                         <div className="space-y-2">
                          <div className="flex justify-between text-sm p-2 bg-[#27272a]/30 rounded">
                            <span>Total Trades</span>
                            <span className="font-mono">{result.totalTrades}</span>
                          </div>
                          <div className="flex justify-between text-sm p-2 bg-[#27272a]/30 rounded">
                            <span>Avg Trade</span>
                            <span className="font-mono">{result.averageTrade.toFixed(2)} USDT</span>
                          </div>
                        </div>
                      </div>
                   </div>
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function MetricCard({ label, value, icon, trend }: { label: string, value: string, icon: React.ReactNode, trend?: 'up' | 'down' }) {
  return (
    <Card className="bg-[#27272a]/50 border-[#3f3f46]">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-[#a1a1aa]">{label}</span>
          <div className="text-[#a1a1aa]">{icon}</div>
        </div>
        <div className={`text-xl font-bold ${trend === 'up' ? 'text-green-400' : trend === 'down' ? 'text-red-400' : 'text-[#fafafa]'}`}>
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
