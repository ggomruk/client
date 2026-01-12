'use client';

import React, { useEffect, useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '../../_components/ui/sheet';
import { backtestService, BacktestHistoryItem } from '../../_api/backtest.service';
import { format } from 'date-fns';
import { Loader2, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../../_components/ui/tooltip';

interface BacktestDetailsSheetProps {
  isOpen: boolean;
  onClose: () => void;
  backtest: BacktestHistoryItem | null;
}

export default function BacktestDetailsSheet({
  isOpen,
  onClose,
  backtest: initialBacktest,
}: BacktestDetailsSheetProps) {
  const [backtest, setBacktest] = useState<BacktestHistoryItem | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && initialBacktest) {
      setBacktest(initialBacktest);
      // Fetch full details
      const fetchFull = async () => {
        setLoading(true);
        try {
          const detailed = await backtestService.getDetail(initialBacktest.id);
          if (detailed) {
            setBacktest(detailed);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setLoading(false);
        }
      };
      
      // If we don't have the heavy result data (checking presence of 'performance' or 'levered_performance' which are in result doc but not summary)
      // Or just always fetch to be safe.
      fetchFull();
    } else {
        setBacktest(null);
    }
  }, [isOpen, initialBacktest]);

  if (!isOpen || !initialBacktest) return null;

  // Use the freshest data available (backtest or initialBacktest fallback)
  const currentItem = backtest || initialBacktest;
  if (!currentItem) return null;

  // Helpers to safely extract data
  const summary = currentItem.result?.summary;
  const perf = currentItem.result?.performance;
  const levered = currentItem.result?.levered_performance || currentItem.result?.leveragedPerformance;
  const params = currentItem.backtestParams;

  // --- DERIVED METRICS ---
  
  // 1. Total Return %
  // Priority: Summary -> Performance cstrategy -> 0
  let returnPct = 0;
  if (summary?.totalReturn !== undefined) {
    returnPct = summary.totalReturn; // assumed to be percentage if > 1 or < -1? Use logic from card? 
    // Usually summary.totalReturn is standard percentage (e.g. -4.72 for -4.72%)
    // But check consistency.
  } else if (perf?.cstrategy !== undefined) {
    // cstrategy is typically Wealth Index (e.g. 0.9528). 
    // Return % = (0.9528 - 1) * 100 = -4.72%
    returnPct = (perf.cstrategy - 1) * 100;
  }

  // 2. Net Profit $
  let netProfitValue = 0;
  const initialCapital = perf?.initial_usdt ?? params?.usdt ?? 0;
  const finalCapital = perf?.final_usdt ?? summary?.finalBalance ?? null;
  
  if (finalCapital !== null && initialCapital > 0) {
      netProfitValue = finalCapital - initialCapital;
  } else if (initialCapital > 0) {
      // Estimate from returnPct if absolute values missing
      netProfitValue = initialCapital * (returnPct / 100);
  }

  // 3. Sharpe
  const sharpe = summary?.sharpeRatio ?? perf?.sharpe ?? 0;

  // Full Results Data (everything from analytics server)
  const trades = summary?.totalTrades ?? perf?.trades ?? 0;
  const winRate = summary?.winRate ?? perf?.win_rate ?? 0;
  const maxDrawdown = summary?.maxDrawdown ?? perf?.max_drawdown ?? 0;
  const finalBalanceDisplay = finalCapital ?? 0;
  
  // Strategy Settings - flatten all strategy params
  const strategiesConfig = params?.strategies || {};
  const allStrategyParams: Array<{label: string, value: any}> = [];
  
  Object.entries(strategiesConfig).forEach(([stratName, stratParams]) => {
     if (typeof stratParams === 'object' && stratParams !== null) {
       Object.entries(stratParams).forEach(([key, val]) => {
         allStrategyParams.push({ label: key, value: String(val) });
       });
     }
  });

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-[1000px] bg-zinc-950 border-l border-zinc-800 text-zinc-100 p-0 shadow-2xl overflow-y-auto">
        <div className="p-8 space-y-8">
            <SheetHeader className="mb-2 space-y-4">
               <div className="flex justify-between items-center">
                 <div className="flex items-center gap-2">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-1 text-xs font-mono text-zinc-400">
                        ID: {currentItem.id.slice(-4)}...
                    </div>
                    {loading && <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />}
                 </div>
                 {currentItem.date && (
                    <div className="text-zinc-500 text-sm">
                        {format(new Date(currentItem.date), 'PPP p')}
                    </div>
                 )}
               </div>
              <SheetTitle className="text-4xl font-bold text-white tracking-tight flex items-center gap-3">
                 {currentItem.symbol}
                 {params?.interval && <span className="text-xl text-zinc-500 font-medium">/ {params.interval}</span>}
              </SheetTitle>
            
            </SheetHeader>

            {/* 1. SUMMARY SECTION (Top Banner) */}
            <div className="grid grid-cols-3 gap-px bg-zinc-800/50 rounded-xl overflow-hidden border border-zinc-800">
                <div className="bg-zinc-900/40 p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-1">Return</span>
                    <span className={`text-2xl font-bold ${returnPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {returnPct.toFixed(2)}%
                    </span>
                </div>
                 <div className="bg-zinc-900/40 p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-1">Net Profit</span>
                    <span className={`text-2xl font-bold ${netProfitValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        ${netProfitValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                    </span>
                </div>
                 <div className="bg-zinc-900/40 p-5 flex flex-col items-center justify-center text-center">
                    <span className="text-zinc-400 text-xs uppercase tracking-wider font-semibold mb-1">Sharpe</span>
                    <span className="text-2xl font-bold text-white">
                        {sharpe.toFixed(2)}
                    </span>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8">
              
              {/* 2. STRATEGY SETTINGS SECTION (User Input Parameters) */}
              <section className="space-y-4">
                 <SectionHeader title="Strategy Settings" />
                 
                 {/* General Backtest Config */}
                 <div className="space-y-3">
                   <div className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">General Configuration</div>
                   <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-zinc-900/30 p-4 rounded-lg border border-zinc-800/50">
                      <ParamRow label="Symbol" value={params?.symbol || currentItem.symbol || '-'} />
                      <ParamRow label="Interval" value={params?.interval || '-'} />
                      <ParamRow label="From" value={params?.startDate ? format(new Date(params.startDate), 'PPP') : '-'} />
                      <ParamRow label="To" value={params?.endDate ? format(new Date(params.endDate), 'PPP') : '-'} />
                      <ParamRow label="Initial Capital (USDT)" value={`$${(params?.usdt ?? 0).toLocaleString()}`} />
                      <ParamRow label="Leverage" value={`${params?.leverage ?? 1}x`} />
                      <ParamRow label="Commission Fee (%)" value={`${params?.commission ? (params.commission * 100).toFixed(3) : '0'}%`} />
                      <ParamRow label="Strategy Name" value={params?.strategyName || currentItem.strategy || currentItem.name || '-'} />
                   </div>
                 </div>

                 {/* Strategy-Specific Parameters */}
                 {allStrategyParams.length > 0 && (
                   <div className="space-y-3">
                     <div className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Strategy Parameters</div>
                     <div className="grid grid-cols-2 gap-x-6 gap-y-3 bg-gradient-to-br from-violet-950/20 to-cyan-950/20 p-4 rounded-lg border border-violet-800/30">
                        {allStrategyParams.map((param, idx) => (
                           <ParamRow key={idx} label={param.label} value={String(param.value)} />
                        ))}
                     </div>
                   </div>
                 )}
              </section>

              {/* 3. PERFORMANCE ANALYSIS SECTION (Analytics Server Results) */}
              <section className="space-y-4">
                 <SectionHeader title="Performance Analysis" />
                 
                 <div className="border border-zinc-800 rounded-xl overflow-hidden">
                    {/* Summary Sub-section */}
                     <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Key Metrics</span>
                     </div>
                     <div className="p-4 bg-zinc-900/20 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <MetricTile label="Total Return" value={`${returnPct.toFixed(2)}%`} color={returnPct >= 0 ? 'text-green-400' : 'text-red-400'} />
                        <MetricTile label="Final Balance" value={`$${finalBalanceDisplay.toLocaleString(undefined, { maximumFractionDigits: 2 })}`} />
                        <MetricTile label="Max Drawdown" value={`${(maxDrawdown * 100).toFixed(2)}%`} color="text-red-400" />
                        <MetricTile label="Win Rate" value={`${(winRate * 100).toFixed(1)}%`} />
                        <MetricTile label="Total Trades" value={trades} />
                        <MetricTile label="Profit Factor" value={(perf?.profitFactor ?? 0).toFixed(2)} /> 
                     </div>
                 </div>

                 {/* Detailed Performance Fields */}
                 {perf && (
                   <div className="border border-zinc-800 rounded-xl overflow-hidden mt-4">
                     <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Detailed Performance ({currentItem.result?.leverage_applied || 1}x Leverage)</span>
                     </div>
                     <div className="p-4 bg-zinc-900/20 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        <MetricTile label="CAGR" value={`${((perf.cagr || 0) * 100).toFixed(2)}%`} />
                        <MetricTile label="Ann. Mean" value={`${((perf.ann_mean || 0) * 100).toFixed(2)}%`} />
                        <MetricTile label="Ann. Std" value={`${((perf.ann_std || 0) * 100).toFixed(2)}%`} />
                        <MetricTile label="Initial USDT" value={`$${(perf.initial_usdt || 0).toLocaleString()}`} />
                        <MetricTile label="Final USDT" value={`$${(perf.final_usdt || 0).toLocaleString()}`} />
                        <MetricTile label="Buy & Hold" value={`${((perf['b&h'] || 0) * 100).toFixed(2)}%`} />
                     </div>
                   </div>
                 )}
                 
                 {levered && (
                    <div className="border border-zinc-800 rounded-xl overflow-hidden mt-4">
                        <div className="bg-zinc-900/50 px-4 py-2 border-b border-zinc-800">
                        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wide">Leveraged Performance (Raw)</span>
                        </div>
                        <div className="p-4 bg-zinc-900/20 grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {Object.entries(levered).map(([k, v]) => (
                            <MetricTile key={`lev-perf-${k}`} label={k.replace(/_/g, ' ')} value={typeof v === 'number' ? v.toFixed(4) : String(v)} />
                        ))}
                        </div>
                    </div>
                 )}

                 {/* Fallback for other root-level properties */}
                 {/*
                 <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {currentItem.result && Object.entries(currentItem.result).map(([key, value]) => {
                       if (['summary', 'performance', 'leveragedPerformance', 'levered_performance', 'status', 'resultId', 'leverage_applied', 'strategy_name', 'strategyName'].includes(key)) return null;
                       if (typeof value === 'object') return null;
                       return <MetricTile key={key} label={key.replace(/([A-Z])/g, ' $1').trim()} value={String(value)} />;
                    })}
                 </div>
                 */}
              </section>
            </div>
          </div>
      </SheetContent>
    </Sheet>
  );
}

function SectionHeader({ title }: { title: string }) {
    return (
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-widest border-b border-zinc-800 pb-2">
            {title}
        </h3>
    )
}

function ParamRow({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="text-[11px] text-zinc-500 uppercase tracking-wide">{label}</span>
      <span className="text-sm font-medium text-zinc-100" title={String(value)}>{value}</span>
    </div>
  );
}

const METRIC_DEFINITIONS: Record<string, string> = {
  "Total Return": "The percentage change in portfolio value from the start to the end of the backtest period.",
  "Net Profit": "The absolute profit or loss generated by the strategy (Final Balance - Initial Balance).",
  "Sharpe Ratio": "A measure of risk-adjusted return. Higher is better. >1 is good, >2 is very good.",
  "Sharpe": "A measure of risk-adjusted return. Higher is better. >1 is good, >2 is very good.",
  "Max Drawdown": "The maximum observed loss from a peak to a trough of a portfolio, before a new peak is attained.",
  "Win Rate": "The percentage of trades that resulted in a profit.",
  "Total Trades": "The total number of executed trades during the backtesting period.",
  "Final Balance": "The ending value of the portfolio after the backtest completes.",
  "Profit Factor": "The ratio of gross profit to gross loss. >1 means the strategy is profitable.",
  "CAGR": "Compound Annual Growth Rate. The mean annual growth rate of an investment.",
  "Ann. Mean": "Annualized Mean Return. The expected average return per year.",
  "Ann. Std": "Annualized Standard Deviation. A measure of the volatility or risk of the strategy's returns.",
  "Initial USDT": "The starting capital in USDT.",
  "Final USDT": "The ending capital in USDT.",
  "Buy & Hold": "The return you would have achieved by simply buying the asset and holding it for the entire period.",
  "sharpe": "A measure of risk-adjusted return using leverage. Higher is better.",
  "cstrategy": "Wealth index of the leveraged strategy (e.g. 1.5 means 50% gain).",
  "cagr": "Compound Annual Growth Rate of the leveraged portfolio.",
  "ann mean": "Annualized Mean Return of the leveraged portfolio.",
  "ann std": "Annualized Standard Deviation (risk) of the leveraged portfolio.",
  "final usdt levered": "The final capital balance after applying leverage and simulating trades.",
  "leverage applied": "The leverage multiplier used in this simulation."
};

function MetricTile({ label, value, color }: { label: string; value: string | number; color?: string }) {
    // Normalize label for lookup (lowercase, remove ratio, trim) to handle 'Ann. Mean' vs 'ann_mean' etc.
    const normalizedKey = label.toLowerCase().replace(/_/g, ' ').replace(/\./g, '').replace('ratio', '').trim();
    // Try exact match first, then normalized key
    const description = METRIC_DEFINITIONS[label] || METRIC_DEFINITIONS[normalizedKey];

    return (
        <div className="bg-zinc-900/30 border border-zinc-800 rounded-lg p-3 flex flex-col justify-between min-h-[72px] relative group">
            <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-500 font-medium uppercase tracking-wide truncate">{label}</span>
                {description && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button className="text-zinc-600 hover:text-zinc-400 transition-colors cursor-help">
                        <Info className="w-3 h-3" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[250px] bg-zinc-800 text-zinc-200 border-zinc-700">
                      <p>{description}</p>
                    </TooltipContent>
                  </Tooltip>
                )}
            </div>
            <span className={`text-base font-bold ${color || 'text-zinc-200'} mt-1`}>{value}</span>
        </div>
    )
}
