'use client';

import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { TrendingUp, TrendingDown, Activity, Clock, AlertCircle, Loader2 } from 'lucide-react';
import { BacktestHistoryItem } from '../../_api/backtest.service';

interface HistoryCardProps {
  item: BacktestHistoryItem;
  onClick?: () => void;
}

export default function HistoryCard({ item, onClick }: HistoryCardProps) {
  const hasResult = !!item.result;
  
  // Normalize metric access
  let returnPct = 0;
  const summary = item.result?.summary;
  const perf = item.result?.performance;

  if (summary?.totalReturn !== undefined) {
     returnPct = summary.totalReturn;
  } else if (perf?.cstrategy !== undefined) {
     // cstrategy is Wealth Index (e.g. 0.9528). Return = (0.9528 - 1) * 100
     returnPct = (perf.cstrategy - 1) * 100;
  }

  // Infer status
  let status: 'Completed' | 'Processing' | 'Error' = 'Completed';
  if (!hasResult) {
    // Naive inference: if old (> 1 hour) and no result, assume error. Else Processing.
    const age = new Date().getTime() - new Date(item.date).getTime();
    if (age > 3600 * 1000) {
      status = 'Error'; // or 'Processing' if your backtests take forever
    } else {
      status = 'Processing';
    }
  }

  // Formatting
  const timeAgo = formatDistanceToNow(new Date(item.date), { addSuffix: true });
  const isPositive = returnPct >= 0;

  return (
    <div 
      onClick={onClick}
      className="bg-zinc-900/70 border border-zinc-700/50 rounded-xl p-4 flex flex-col gap-3 w-full cursor-pointer hover:scale-[1.02] hover:shadow-xl hover:border-violet-500/50 transition-all duration-200"
    >
      {/* Header */}
      <div className="flex items-center justify-between h-7">
        <h3 className="text-zinc-50 font-bold text-lg tracking-tight">
          {item.symbol || 'Unknown'}
        </h3>
        
        {/* Status Badge */}
        {status === 'Completed' && (
          <div className="bg-[#00c950] rounded-full px-2 py-1 flex items-center">
            <span className="text-white text-xs font-semibold leading-none">Completed</span>
          </div>
        )}
        {status === 'Processing' && (
          <div className="bg-[#2b7fff] rounded-full px-2 py-1 flex items-center">
            <span className="text-white text-xs font-semibold leading-none">Processing</span>
          </div>
        )}
        {status === 'Error' && (
          <div className="bg-[#fb2c36] rounded-full px-2 py-1 flex items-center">
            <span className="text-white text-xs font-semibold leading-none">Error</span>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex items-center gap-2 h-8">
        {status === 'Completed' ? (
          <>
            {isPositive ? (
              <TrendingUp className="w-5 h-5 text-[#05df72]" />
            ) : (
              <TrendingDown className="w-5 h-5 text-[#ff6467]" />
            )}
            <span className={`font-bold text-2xl tracking-wide ${isPositive ? 'text-[#05df72]' : 'text-[#ff6467]'}`}>
              {returnPct > 0 ? '+' : ''}{returnPct.toFixed(2)} %
            </span>
          </>
        ) : status === 'Processing' ? (
           <div className="flex items-center gap-2 text-blue-400 w-full">
             {/* Progress Bar Placeholder */}
             <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                <div className="bg-blue-500 h-2 w-1/3 animate-pulse rounded-full" />
             </div>
             <span className="text-xs font-semibold">Running</span>
           </div>
        ) : (
          <div className="flex items-center gap-2 text-[#ff6467]">
             <AlertCircle className="w-5 h-5" />
             <span className="text-sm font-normal">Failed to complete</span>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between h-4 mt-auto">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-mono text-zinc-500 bg-zinc-800/50 px-1.5 py-0.5 rounded" title={item.id}>
             #{item.id.slice(-4)}
           </span>
           <div className="flex items-center gap-1 text-zinc-400">
               <span className="text-xs">{timeAgo}</span>
           </div>
        </div>
        <div className="flex items-center gap-1 text-zinc-400">
           <Activity className="w-3 h-3" />
           <span className="text-xs font-medium truncate max-w-[100px]">{item.strategy || item.name}</span>
        </div>
      </div>
    </div>
  );
}
