'use client';

import React, { useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Activity, 
  BarChart2, 
  Percent, 
  DollarSign, 
  Calendar,
  Clock,
  Target,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { useBacktest } from '../../_provider/backtest.context';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../../_components/ui/dialog";
import { Button } from "../../_components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../../_components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../_components/ui/tabs";
import { ScrollArea } from "../../_components/ui/scroll-area";
import { Badge } from "../../_components/ui/badge";

export default function BacktestResults() {
  const { result, isRunning } = useBacktest();
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  if (isRunning) {
    return (
      <Card className="w-full bg-zinc-900 border-zinc-800 text-zinc-100 mt-4">
        <CardContent className="h-24 flex items-center justify-center gap-3">
          <Activity className="w-5 h-5 animate-spin text-indigo-500" />
          <span className="text-zinc-400 font-medium">Running strategy backtest...</span>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  const profitLoss = result.finalBalance - result.initialBalance;
  const isProfit = profitLoss >= 0;

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
      {/* Overview Dashboard Card */}
      <Card className="w-full bg-zinc-900/50 border-zinc-800 text-zinc-100 mt-4 overflow-hidden">
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/80">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isProfit ? 'bg-emerald-500' : 'bg-red-500'}`} />
            <h3 className="font-semibold text-zinc-100">Backtest Summary</h3>
          </div>
          <Badge variant={isProfit ? "default" : "destructive"} className={`${isProfit ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'} border-0`}>
            {isProfit ? '+' : ''}{result.totalReturn.toFixed(2)}%
          </Badge>
        </div>

        <div className="p-4 grid grid-cols-2 gap-y-6 gap-x-4">
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wider block">Net PnL</span>
            <div className={`text-lg font-mono font-medium whitespace-nowrap ${isProfit ? 'text-emerald-400' : 'text-red-400'}`}>
              {isProfit ? '+' : ''}{profitLoss.toFixed(2)}
              <span className="text-xs text-zinc-500 ml-1">USDT</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wider block">Win Rate</span>
            <div className="text-lg font-mono font-medium text-zinc-100 whitespace-nowrap">
              {result.winRate.toFixed(2)}%
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wider block">Trades</span>
            <div className="text-lg font-mono font-medium text-zinc-100 whitespace-nowrap">
              {result.totalTrades}
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xs text-zinc-500 uppercase tracking-wider block">Max DD</span>
            <div className="text-lg font-mono font-medium text-red-400 whitespace-nowrap">
              {result.maxDrawdown.toFixed(2)}%
            </div>
          </div>
        </div>

        <div className="px-4 pb-4">
          <Button 
            onClick={() => setIsDetailsOpen(true)}
            variant="outline"
            className="w-full bg-zinc-900 border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 transition-all"
          >
            View Detailed Analysis
          </Button>
        </div>
      </Card>

      {/* Detailed Analysis Dialog - Full Screen Mode */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-[95vw] lg:max-w-6xl w-full bg-zinc-950 border-zinc-800 text-zinc-100 h-[85vh] flex flex-col p-0 gap-0 shadow-2xl">
          {/* Dialog Header of Detailed Analysis */}
          <DialogHeader className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-500" />
                  Backtest Analysis
                </DialogTitle>
                <DialogDescription className="text-zinc-400 mt-1 flex items-center gap-4 text-xs">
                  <span className="flex items-center gap-1">
                    <Target className="w-3 h-3" /> {result.strategyName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {new Date(result.startTime).toLocaleDateString()} - {new Date(result.endTime).toLocaleDateString()}
                  </span>
                </DialogDescription>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={exportToCSV} 
                className="gap-2 border-zinc-700 hover:bg-zinc-800 text-zinc-300 mr-8"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden bg-zinc-950">
             <Tabs defaultValue="overview" className="h-full flex flex-col">
              <div className="px-6 border-b border-zinc-800 bg-zinc-900/30">
                <TabsList className="h-12 bg-transparent gap-6 p-0">
                  <TabItem value="overview">Overview</TabItem>
                  <TabItem value="metrics">Advanced Metrics</TabItem>
                  <TabItem value="trades">Trade History</TabItem>
                </TabsList>
              </div>

              <ScrollArea className="flex-1">
                <div className="p-6 max-w-7xl mx-auto w-full">
                  <TabsContent value="overview" className="mt-0 space-y-6">
                    {/* KPI Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <KPICard 
                        label="Total Return" 
                        value={`${result.totalReturn.toFixed(2)}%`}
                        subValue={`${(result.finalBalance - result.initialBalance).toFixed(2)} USDT`}
                        icon={<Percent className="w-4 h-4 text-blue-400" />}
                        trend={result.totalReturn >= 0 ? 'up' : 'down'}
                        color={result.totalReturn >= 0 ? 'text-emerald-400' : 'text-red-400'}
                      />
                      <KPICard 
                        label="Sharpe Ratio" 
                        value={result.sharpeRatio.toFixed(2)}
                        subValue="Risk Adjusted Return"
                        icon={<Activity className="w-4 h-4 text-purple-400" />}
                        color="text-zinc-100"
                      />
                      <KPICard 
                        label="Win Rate" 
                        value={`${result.winRate.toFixed(2)}%`}
                        subValue={`${result.totalTrades} Total Trades`}
                        icon={<Target className="w-4 h-4 text-emerald-400" />}
                        color="text-zinc-100"
                      />
                      <KPICard 
                        label="Max Drawdown" 
                        value={`${result.maxDrawdown.toFixed(2)}%`}
                        subValue="Peak to Valley"
                        icon={<TrendingDown className="w-4 h-4 text-red-500" />}
                        color="text-red-400"
                      />
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Equity Curve Area */}
                      <Card className="lg:col-span-2 bg-zinc-900/30 border-zinc-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium text-zinc-300">Equity Curve</CardTitle>
                        </CardHeader>
                        <CardContent className="h-[300px] flex items-center justify-center border-t border-zinc-800/50 relative overflow-hidden">
                          <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/50 to-transparent pointer-events-none" />
                          <div className="text-zinc-500 flex flex-col items-center gap-2">
                            <BarChart2 className="w-8 h-8 opacity-50" />
                            <span className="text-sm">Chart visualization requires historical data points</span>
                          </div>
                        </CardContent>
                      </Card>

                      {/* Quick Stats Side Panel */}
                      <Card className="bg-zinc-900/30 border-zinc-800">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-base font-medium text-zinc-300">Performance Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4 pt-4">
                          <StatRow label="Initial Balance" value={`$${result.initialBalance.toFixed(2)}`} />
                          <StatRow label="Final Balance" value={`$${result.finalBalance.toFixed(2)}`} highlight />
                          <div className="border-t border-zinc-800 my-2" />
                          <StatRow label="Profit Factor" value={result.profitFactor.toFixed(2)} />
                          <StatRow label="Avg Trade" value={`$${result.averageTrade.toFixed(2)}`} />
                          <div className="border-t border-zinc-800 my-2" />
                          <StatRow label="Leverage" value={`${result.leverageApplied}x`} />
                          <StatRow label="Duration" value={`${((new Date(result.endTime).getTime() - new Date(result.startTime).getTime()) / (1000 * 60 * 60 * 24)).toFixed(1)} days`} />
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="metrics" className="mt-0 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <MetricsSection title="Return Metrics">
                           <MetricItem label="Total Net Profit" value={`${profitLoss.toFixed(2)} USDT`} color={isProfit ? 'text-emerald-400' : 'text-red-400'} />
                           <MetricItem label="Gross Profit" value="--" />
                           <MetricItem label="Gross Loss" value="--" />
                        </MetricsSection>
                        
                        <MetricsSection title="Risk Metrics">
                           <MetricItem label="Max Drawdown" value={`${result.maxDrawdown.toFixed(2)}%`} color="text-red-400" />
                           <MetricItem label="Sharpe Ratio" value={result.sharpeRatio.toFixed(2)} />
                           <MetricItem label="Sortino Ratio" value="--" />
                        </MetricsSection>

                        <MetricsSection title="Trade Statistics">
                           <MetricItem label="Total Trades" value={result.totalTrades} />
                           <MetricItem label="Winning Trades" value="--" />
                           <MetricItem label="Losing Trades" value="--" />
                           <MetricItem label="Win Rate" value={`${result.winRate.toFixed(2)}%`} />
                        </MetricsSection>
                    </div>
                  </TabsContent>

                  <TabsContent value="trades" className="mt-0">
                    <Card className="bg-zinc-900/30 border-zinc-800">
                      <div className="relative w-full overflow-auto">
                        <table className="w-full text-sm text-left">
                          <thead className="text-xs text-zinc-500 uppercase bg-zinc-900/50 sticky top-0">
                            <tr>
                              <th className="px-6 py-3 font-medium">Type</th>
                              <th className="px-6 py-3 font-medium">Symbol</th>
                              <th className="px-6 py-3 font-medium">Time</th>
                              <th className="px-6 py-3 font-medium text-right">PnL</th>
                              <th className="px-6 py-3 font-medium text-right">Return</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-zinc-800">
                            {result.trades.map((trade, i) => (
                              <tr key={i} className="hover:bg-zinc-800/30 transition-colors">
                                <td className="px-6 py-3">
                                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    trade.type === 'buy' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                                  }`}>
                                    {trade.type === 'buy' ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                    {trade.type.toUpperCase()}
                                  </span>
                                </td>
                                <td className="px-6 py-3 font-medium text-zinc-300">{trade.symbol}</td>
                                <td className="px-6 py-3 text-zinc-500 font-mono text-xs">
                                  {new Date(trade.entryTime).toLocaleString()}
                                </td>
                                <td className={`px-6 py-3 text-right font-mono ${trade.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {trade.pnl >= 0 ? '+' : ''}{trade.pnl.toFixed(2)}
                                </td>
                                <td className={`px-6 py-3 text-right font-mono ${trade.pnlPercent >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                  {trade.pnlPercent.toFixed(2)}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {result.trades.length === 0 && (
                          <div className="text-center py-12 text-zinc-500 bg-zinc-900/20">
                            No trades recorded in this backtest
                          </div>
                        )}
                      </div>
                    </Card>
                  </TabsContent>
                </div>
              </ScrollArea>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

// Sub-components for cleaner structure

function TabItem({ value, children }: { value: string, children: React.ReactNode }) {
  return (
    <TabsTrigger 
      value={value} 
      className="data-[state=active]:bg-transparent data-[state=active]:text-indigo-400 data-[state=active]:border-b-2 data-[state=active]:border-indigo-500 rounded-none h-full px-2 text-zinc-500 hover:text-zinc-300 transition-colors"
    >
      {children}
    </TabsTrigger>
  );
}

function KPICard({ label, value, subValue, icon, trend, color = 'text-zinc-100' }: any) {
  return (
    <Card className="bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 transition-colors px-1 py-3">
      <CardContent className="p-6">
        <div className="flex justify-between align-center items-start mb-4">
          <span className="py-1.5 text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
          <div className="p-1.5 bg-zinc-800 rounded-md">
            {icon}
          </div>
        </div>
        <div className={`text-2xl font-bold font-mono ${color} flex items-baseline gap-2`}>
          {value}
          {trend && (
             <span className={`text-xs ${trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
               {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
             </span>
          )}
        </div>
        {subValue && <div className="text-xs text-zinc-500 mt-1">{subValue}</div>}
      </CardContent>
    </Card>
  );
}

function StatRow({ label, value, highlight = false }: { label: string, value: string | number, highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm gap-2 py-1">
      <span className="text-zinc-500 whitespace-nowrap">{label}</span>
      <span className={`font-mono text-right whitespace-nowrap ${highlight ? 'text-zinc-100 font-semibold' : 'text-zinc-300'}`}>{value}</span>
    </div>
  );
}

function MetricsSection({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <Card className="bg-zinc-900/30 border-zinc-800">
      <CardHeader className="pb-3 border-b border-zinc-800/50">
         <CardTitle className="text-sm font-medium text-zinc-400 uppercase tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {children}
      </CardContent>
    </Card>
  );
}

function MetricItem({ label, value, color = "text-zinc-300" }: { label: string, value: string | number, color?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-zinc-500">{label}</span>
      <span className={`text-sm font-mono font-medium ${color}`}>{value}</span>
    </div>
  );
}
