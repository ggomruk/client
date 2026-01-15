'use client';

import { Wallet, ExternalLink, TrendingUp, Activity } from 'lucide-react';
import { Card } from '../../_components/ui/card';
import { Badge } from '../../_components/ui/badge';
import { Button } from '../../_components/ui/button';

export type BlockchainType = 'bitcoin' | 'ethereum';
export type WalletType = 'exchange' | 'whale' | 'institution' | 'smart_money' | 'unknown';

export interface WhaleWallet {
  _id: string;
  address: string;
  blockchain: BlockchainType;
  label?: string;
  walletType: WalletType;
  exchangeName?: string;
  balance?: number;
  balanceUsd?: number;
  lastActiveAt?: string;
  transactionCount?: number;
  isKnownAddress?: boolean;
  isVerified?: boolean;
}

interface WalletCardProps {
  wallet: WhaleWallet;
  onWatch?: (address: string) => void;
  isWatched?: boolean;
}

const formatAddress = (address: string) => {
  return `${address.slice(0, 8)}...${address.slice(-6)}`;
};

const formatBalance = (balance: number, blockchain: string) => {
  const symbol = blockchain === 'btc' ? 'BTC' : 'ETH';
  if (balance >= 1000) {
    return `${(balance / 1000).toFixed(2)}K ${symbol}`;
  }
  return `${balance.toFixed(4)} ${symbol}`;
};

const formatUsd = (amount: number) => {
  if (amount >= 1e9) return `$${(amount / 1e9).toFixed(2)}B`;
  if (amount >= 1e6) return `$${(amount / 1e6).toFixed(2)}M`;
  if (amount >= 1e3) return `$${(amount / 1e3).toFixed(2)}K`;
  return `$${amount.toFixed(2)}`;
};

const getWalletTypeConfig = (type: string) => {
  switch (type) {
    case 'exchange':
      return { color: 'text-yellow-500', bgColor: 'bg-yellow-500/10', label: 'Exchange' };
    case 'whale':
      return { color: 'text-blue-500', bgColor: 'bg-blue-500/10', label: 'Whale' };
    case 'institution':
      return { color: 'text-purple-500', bgColor: 'bg-purple-500/10', label: 'Institution' };
    case 'smart_money':
      return { color: 'text-green-500', bgColor: 'bg-green-500/10', label: 'Smart Money' };
    default:
      return { color: 'text-gray-500', bgColor: 'bg-gray-500/10', label: 'Unknown' };
  }
};

const getBlockchainExplorer = (blockchain: BlockchainType, address: string) => {
  if (blockchain === 'bitcoin') {
    return `https://blockchair.com/bitcoin/address/${address}`;
  }
  return `https://etherscan.io/address/${address}`;
};

const formatBlockchainLabel = (blockchain: BlockchainType) => {
  return blockchain === 'bitcoin' ? 'BTC' : 'ETH';
};

export function WalletCard({ wallet, onWatch, isWatched }: WalletCardProps) {
  const typeConfig = getWalletTypeConfig(wallet.walletType);

  return (
    <Card 
      variant="default" 
      className="p-4 hover:border-[#4f4f56] transition-colors"
    >
      <div className="flex items-start justify-between mb-3">
        {/* Wallet icon and label */}
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-full ${typeConfig.bgColor} flex items-center justify-center`}>
            <Wallet className={`w-5 h-5 ${typeConfig.color}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-white font-medium">{wallet.label || 'Unknown Wallet'}</span>
              {wallet.isVerified && (
                <Badge variant="outline" className="text-xs text-green-400 border-green-400/50">
                  Verified
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-[#8b949e]">
              <span>{formatAddress(wallet.address)}</span>
              <button 
                onClick={() => window.open(getBlockchainExplorer(wallet.blockchain, wallet.address), '_blank')}
                className="hover:text-white transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>

        {/* Watch button */}
        {onWatch && (
          <Button
            variant={isWatched ? "primary" : "outline"}
            size="sm"
            onClick={() => onWatch(wallet.address)}
            className={isWatched ? "bg-purple-500 hover:bg-purple-600" : ""}
          >
            {isWatched ? 'Watching' : 'Watch'}
          </Button>
        )}
      </div>

      {/* Tags */}
      <div className="flex flex-wrap gap-2 mb-3">
        <Badge variant="outline" className="text-xs uppercase">
          {formatBlockchainLabel(wallet.blockchain)}
        </Badge>
        <Badge className={`${typeConfig.bgColor} ${typeConfig.color} text-xs`}>
          {typeConfig.label}
        </Badge>
        {wallet.exchangeName && (
          <Badge variant="secondary" className="text-xs">
            {wallet.exchangeName}
          </Badge>
        )}
      </div>

      {/* Balance info */}
      {wallet.balance !== undefined && (
        <div className="grid grid-cols-2 gap-4 pt-3 border-t border-[#30363d]">
          <div>
            <div className="flex items-center gap-1 text-xs text-[#8b949e] mb-1">
              <TrendingUp className="w-3 h-3" />
              Balance
            </div>
            <div className="text-white font-medium">
              {formatBalance(wallet.balance, wallet.blockchain)}
            </div>
            {wallet.balanceUsd && (
              <div className="text-sm text-[#8b949e]">
                {formatUsd(wallet.balanceUsd)}
              </div>
            )}
          </div>
          {wallet.transactionCount !== undefined && (
            <div>
              <div className="flex items-center gap-1 text-xs text-[#8b949e] mb-1">
                <Activity className="w-3 h-3" />
                Transactions
              </div>
              <div className="text-white font-medium">
                {wallet.transactionCount.toLocaleString()}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
