'use client';

import { TrendingUp, TrendingDown, Activity, Wallet, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../_components/ui/card';

export interface OnchainStats {
  totalTransactions: number;
  totalVolumeUsd: number;
  netExchangeFlow: number;
  activeWallets: number;
  largestTransaction?: {
    amountUsd: number;
    blockchain: string;
    direction: string;
  };
  last24hChange?: {
    transactions: number;
    volume: number;
  };
}

interface StatsOverviewProps {
  stats: OnchainStats;
  loading?: boolean;
}

const formatUsd = (amount: number) => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
  if (absAmount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (absAmount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
};

export function StatsOverview({ stats, loading }: StatsOverviewProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} variant="default" className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 w-24 bg-[#21262d] rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-32 bg-[#21262d] rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const netFlowPositive = stats.netExchangeFlow >= 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Transactions */}
      <Card variant="default" className="hover:border-[#4f4f56] transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-[#8b949e]">
              Whale Transactions
            </CardTitle>
            <Activity className="w-4 h-4 text-purple-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {stats.totalTransactions.toLocaleString()}
          </div>
          {stats.last24hChange && (
            <div className={`text-sm flex items-center gap-1 ${stats.last24hChange.transactions >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.last24hChange.transactions >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stats.last24hChange.transactions >= 0 ? '+' : ''}{stats.last24hChange.transactions}% vs yesterday
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Volume */}
      <Card variant="default" className="hover:border-[#4f4f56] transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-[#8b949e]">
              24h Volume
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {formatUsd(stats.totalVolumeUsd)}
          </div>
          {stats.last24hChange && (
            <div className={`text-sm flex items-center gap-1 ${stats.last24hChange.volume >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.last24hChange.volume >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              {stats.last24hChange.volume >= 0 ? '+' : ''}{stats.last24hChange.volume}% vs yesterday
            </div>
          )}
        </CardContent>
      </Card>

      {/* Net Exchange Flow */}
      <Card variant="default" className="hover:border-[#4f4f56] transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-[#8b949e]">
              Net Exchange Flow
            </CardTitle>
            {netFlowPositive ? (
              <ArrowUpRight className="w-4 h-4 text-red-400" />
            ) : (
              <ArrowDownLeft className="w-4 h-4 text-green-400" />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netFlowPositive ? 'text-red-400' : 'text-green-400'}`}>
            {netFlowPositive ? '+' : ''}{formatUsd(stats.netExchangeFlow)}
          </div>
          <div className="text-sm text-[#8b949e]">
            {netFlowPositive ? 'Sell pressure (deposits)' : 'Accumulation (withdrawals)'}
          </div>
        </CardContent>
      </Card>

      {/* Active Wallets */}
      <Card variant="default" className="hover:border-[#4f4f56] transition-colors">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-[#8b949e]">
              Tracked Wallets
            </CardTitle>
            <Wallet className="w-4 h-4 text-yellow-400" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-white">
            {stats.activeWallets.toLocaleString()}
          </div>
          <div className="text-sm text-[#8b949e]">
            Exchange & whale wallets
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
