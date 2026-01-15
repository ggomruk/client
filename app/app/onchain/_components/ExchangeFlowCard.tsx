'use client';

import { TrendingUp, TrendingDown, Minus, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../_components/ui/card';
import { Badge } from '../../_components/ui/badge';

export type BlockchainType = 'bitcoin' | 'ethereum';

export interface ExchangeFlow {
  _id: string;
  exchange: string;
  blockchain: BlockchainType;
  symbol: string;
  timestamp: string;
  inflowAmount: number;
  inflowUsd: number;
  inflowCount: number;
  outflowAmount: number;
  outflowUsd: number;
  outflowCount: number;
  netFlowAmount: number;
  netFlowUsd: number;
}

export interface ExchangeFlowStats {
  totalInflowUsd: number;
  totalOutflowUsd: number;
  totalNetFlowUsd: number;
  inflowCount: number;
  outflowCount: number;
}

interface ExchangeFlowCardProps {
  exchange: string;
  stats: ExchangeFlowStats;
  hourlyData?: ExchangeFlow[];
  loading?: boolean;
}

const formatUsd = (amount: number) => {
  const absAmount = Math.abs(amount);
  if (absAmount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
  if (absAmount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (absAmount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
};

const getNetFlowIndicator = (netFlow: number) => {
  if (netFlow > 0) {
    return {
      icon: <TrendingUp className="w-5 h-5 text-red-400" />,
      label: 'Net Inflow',
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      interpretation: 'Selling pressure',
    };
  } else if (netFlow < 0) {
    return {
      icon: <TrendingDown className="w-5 h-5 text-green-400" />,
      label: 'Net Outflow',
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      interpretation: 'Accumulation',
    };
  }
  return {
    icon: <Minus className="w-5 h-5 text-gray-400" />,
    label: 'Neutral',
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    interpretation: 'Balanced',
  };
};

// Exchange icons/colors
const exchangeConfig: Record<string, { color: string; bgColor: string }> = {
  Binance: { color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
  Coinbase: { color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
  Kraken: { color: 'text-purple-500', bgColor: 'bg-purple-500/10' },
  OKX: { color: 'text-white', bgColor: 'bg-gray-500/10' },
  Bybit: { color: 'text-orange-500', bgColor: 'bg-orange-500/10' },
  Bitfinex: { color: 'text-green-500', bgColor: 'bg-green-500/10' },
  KuCoin: { color: 'text-teal-500', bgColor: 'bg-teal-500/10' },
  HTX: { color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
  Gemini: { color: 'text-cyan-500', bgColor: 'bg-cyan-500/10' },
  'Gate.io': { color: 'text-blue-300', bgColor: 'bg-blue-300/10' },
  Bitstamp: { color: 'text-green-400', bgColor: 'bg-green-400/10' },
  'Crypto.com': { color: 'text-blue-600', bgColor: 'bg-blue-600/10' },
};

export function ExchangeFlowCard({ exchange, stats, hourlyData = [], loading }: ExchangeFlowCardProps) {
  const config = exchangeConfig[exchange] || { color: 'text-gray-400', bgColor: 'bg-gray-500/10' };

  // Use pre-aggregated stats from API
  const totalNetFlow = stats.totalNetFlowUsd;
  const totalInflow = stats.totalInflowUsd;
  const totalOutflow = stats.totalOutflowUsd;

  // Calculate per-blockchain breakdown from hourly data if available
  const btcFlows = hourlyData.filter(f => f.blockchain === 'bitcoin');
  const ethFlows = hourlyData.filter(f => f.blockchain === 'ethereum');

  const btcInflow = btcFlows.reduce((sum, f) => sum + f.inflowUsd, 0);
  const btcOutflow = btcFlows.reduce((sum, f) => sum + f.outflowUsd, 0);
  const ethInflow = ethFlows.reduce((sum, f) => sum + f.inflowUsd, 0);
  const ethOutflow = ethFlows.reduce((sum, f) => sum + f.outflowUsd, 0);

  const netFlowIndicator = getNetFlowIndicator(totalNetFlow);

  if (loading) {
    return (
      <Card variant="default" className="animate-pulse">
        <CardHeader>
          <div className="h-6 w-32 bg-[#21262d] rounded" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-12 bg-[#21262d] rounded" />
            <div className="h-8 bg-[#21262d] rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="default" className="hover:border-[#4f4f56] transition-colors">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${config.bgColor} flex items-center justify-center`}>
              <span className={`text-lg font-bold ${config.color}`}>
                {exchange.charAt(0)}
              </span>
            </div>
            <CardTitle className="text-lg">{exchange}</CardTitle>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${netFlowIndicator.bgColor}`}>
            {netFlowIndicator.icon}
            <span className={`text-sm font-medium ${netFlowIndicator.color}`}>
              {netFlowIndicator.interpretation}
            </span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Net Flow Summary */}
        <div className={`p-4 rounded-lg ${netFlowIndicator.bgColor} mb-4`}>
          <div className="text-sm text-[#8b949e] mb-1">24h Net Flow</div>
          <div className={`text-2xl font-bold ${netFlowIndicator.color}`}>
            {totalNetFlow >= 0 ? '+' : ''}{formatUsd(totalNetFlow)}
          </div>
        </div>

        {/* BTC and ETH breakdown */}
        <div className="grid grid-cols-2 gap-4">
          {/* BTC */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-orange-500 border-orange-500/50">BTC</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="w-3 h-3 text-red-400" />
              <span className="text-[#8b949e]">In:</span>
              <span className="text-white">{formatUsd(btcInflow)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowDownLeft className="w-3 h-3 text-green-400" />
              <span className="text-[#8b949e]">Out:</span>
              <span className="text-white">{formatUsd(btcOutflow)}</span>
            </div>
          </div>

          {/* ETH */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-purple-500 border-purple-500/50">ETH</Badge>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowUpRight className="w-3 h-3 text-red-400" />
              <span className="text-[#8b949e]">In:</span>
              <span className="text-white">{formatUsd(ethInflow)}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <ArrowDownLeft className="w-3 h-3 text-green-400" />
              <span className="text-[#8b949e]">Out:</span>
              <span className="text-white">{formatUsd(ethOutflow)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
