'use client';

import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, ExternalLink } from 'lucide-react';
import { Card } from '../../_components/ui/card';
import { Badge } from '../../_components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

export type BlockchainType = 'bitcoin' | 'ethereum';
export type TransactionDirection = 'to_exchange' | 'from_exchange' | 'unknown';

export interface WhaleTransaction {
  _id: string;
  txHash: string;
  blockchain: BlockchainType;
  fromAddress: string;
  fromLabel?: string;
  toAddress: string;
  toLabel?: string;
  amount: number;
  symbol: string;
  amountUsd: number;
  timestamp: string;
  direction?: TransactionDirection;
  exchangeName?: string;
}

interface TransactionListProps {
  transactions: WhaleTransaction[];
  loading?: boolean;
}

const formatAddress = (address: string) => {
  if (!address || address === 'unknown') return 'Unknown';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

const formatAmount = (amount: number, symbol: string) => {
  if (amount >= 1000) {
    return `${(amount / 1000).toFixed(2)}K ${symbol}`;
  }
  return `${amount.toFixed(4)} ${symbol}`;
};

const formatUsd = (amount: number) => {
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
};

const getDirectionIcon = (direction?: TransactionDirection) => {
  switch (direction) {
    case 'to_exchange':
      return <ArrowUpRight className="w-4 h-4 text-red-400" />;
    case 'from_exchange':
      return <ArrowDownLeft className="w-4 h-4 text-green-400" />;
    default:
      return <ArrowLeftRight className="w-4 h-4 text-gray-400" />;
  }
};

const getDirectionBadge = (direction?: TransactionDirection) => {
  switch (direction) {
    case 'to_exchange':
      return <Badge variant="destructive" className="text-xs">Deposit</Badge>;
    case 'from_exchange':
      return <Badge className="bg-green-500/20 text-green-400 text-xs">Withdrawal</Badge>;
    default:
      return <Badge variant="secondary" className="text-xs">Unknown</Badge>;
  }
};

const getBlockchainExplorer = (blockchain: BlockchainType, txHash: string) => {
  if (blockchain === 'bitcoin') {
    return `https://blockchair.com/bitcoin/transaction/${txHash}`;
  }
  return `https://etherscan.io/tx/${txHash}`;
};

const formatBlockchainLabel = (blockchain: BlockchainType) => {
  return blockchain === 'bitcoin' ? 'BTC' : 'ETH';
};

export function TransactionList({ transactions, loading }: TransactionListProps) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <Card key={i} variant="default" className="p-4 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#21262d]" />
                <div className="space-y-2">
                  <div className="h-4 w-32 bg-[#21262d] rounded" />
                  <div className="h-3 w-24 bg-[#21262d] rounded" />
                </div>
              </div>
              <div className="text-right space-y-2">
                <div className="h-4 w-20 bg-[#21262d] rounded ml-auto" />
                <div className="h-3 w-16 bg-[#21262d] rounded ml-auto" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card variant="default" className="p-8 text-center">
        <p className="text-[#a1a1aa]">No whale transactions found</p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {transactions.map((tx) => (
        <Card 
          key={tx._id} 
          variant="default" 
          className="p-4 hover:bg-[#21262d] transition-colors cursor-pointer group"
          onClick={() => window.open(getBlockchainExplorer(tx.blockchain, tx.txHash), '_blank')}
        >
          <div className="flex items-center justify-between">
            {/* Left side - Direction and addresses */}
            <div className="flex items-center gap-3">
              {/* Direction icon */}
              <div className={`
                w-10 h-10 rounded-full flex items-center justify-center
                ${tx.direction === 'to_exchange' ? 'bg-red-500/10' : ''}
                ${tx.direction === 'from_exchange' ? 'bg-green-500/10' : ''}
                ${!tx.direction || tx.direction === 'unknown' ? 'bg-gray-500/10' : ''}
              `}>
                {getDirectionIcon(tx.direction)}
              </div>

              {/* Transaction details */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-medium">
                    {tx.fromLabel || formatAddress(tx.fromAddress)}
                  </span>
                  <span className="text-[#6e7681]">→</span>
                  <span className="text-white font-medium">
                    {tx.toLabel || formatAddress(tx.toAddress)}
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#6e7681] opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Badge variant="outline" className="text-xs uppercase">
                    {formatBlockchainLabel(tx.blockchain)}
                  </Badge>
                  {tx.exchangeName && (
                    <span className="text-[#8b949e]">{tx.exchangeName}</span>
                  )}
                  {getDirectionBadge(tx.direction)}
                </div>
              </div>
            </div>

            {/* Right side - Amount and time */}
            <div className="text-right">
              <div className="text-white font-semibold">
                {formatUsd(tx.amountUsd)}
              </div>
              <div className="text-sm text-[#8b949e]">
                {formatAmount(tx.amount, tx.symbol)}
              </div>
              <div className="text-xs text-[#6e7681]">
                {formatDistanceToNow(new Date(tx.timestamp), { addSuffix: true })}
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
