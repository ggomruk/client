'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Activity, 
  Wallet, 
  TrendingUp, 
  RefreshCw, 
  Filter, 
  Search,
  Crown,
  Bell,
  ChevronDown,
  Clock
} from 'lucide-react';
import { Card } from '../_components/ui/card';
import { Button } from '../_components/ui/button';
import { Input } from '../_components/ui/input';
import { Badge } from '../_components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../_components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '../_components/ui/dropdown-menu';
import { 
  TransactionList, 
  ExchangeFlowCard, 
  WalletCard, 
  StatsOverview,
} from './_components';
import type { WhaleTransaction } from './_components/TransactionList';
import type { ExchangeFlowStats } from './_components/ExchangeFlowCard';
import type { WhaleWallet } from './_components/WalletCard';
import type { OnchainStats } from './_components/StatsOverview';
import { onchainService, BlockchainType } from '../_api/onchain.service';
import { useAuth } from '@/app/contexts/AuthContext';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';

// Exchanges we track (matching data server)
const EXCHANGES = ['binance', 'coinbase', 'kraken', 'okx', 'bybit', 'bitfinex', 'kucoin', 'htx', 'gemini', 'gate.io', 'bitstamp', 'crypto.com'];
const BLOCKCHAINS: BlockchainType[] = ['bitcoin', 'ethereum'];

// Polling interval in milliseconds (60 seconds)
const POLL_INTERVAL = 60000;

interface ExchangeFlowData {
  exchange: string;
  stats: ExchangeFlowStats;
}

export default function OnchainPage() {
  const { user } = useAuth();
  const isPremium = user?.subscription === 'premium';
  
  // Data states
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  const [stats, setStats] = useState<OnchainStats>({
    totalTransactions: 0,
    totalVolumeUsd: 0,
    netExchangeFlow: 0,
    activeWallets: 0,
  });
  const [transactions, setTransactions] = useState<WhaleTransaction[]>([]);
  const [exchangeFlows, setExchangeFlows] = useState<ExchangeFlowData[]>([]);
  const [wallets, setWallets] = useState<WhaleWallet[]>([]);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExchanges, setSelectedExchanges] = useState<string[]>(EXCHANGES);
  const [selectedBlockchain, setSelectedBlockchain] = useState<BlockchainType | 'all'>('all');
  const [activeTab, setActiveTab] = useState('transactions');
  
  // Polling
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Fetch all on-chain data from API
   */
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      // Fetch all data in parallel
      const [statsResponse, transactionsResponse, walletsResponse] = await Promise.all([
        onchainService.getStats(24),
        onchainService.getLatestTransactions(50),
        onchainService.getKnownWallets(),
      ]);

      // Transform stats from API response
      const txStats = statsResponse.transactions || [];
      const flowStats = statsResponse.exchangeFlows || [];
      
      const totalTransactions = txStats.reduce((sum, t) => sum + t.count, 0);
      const totalVolumeUsd = txStats.reduce((sum, t) => sum + t.totalUsd, 0);
      const netExchangeFlow = flowStats.reduce((sum, f) => sum + f.netFlowUsd, 0);
      
      setStats({
        totalTransactions,
        totalVolumeUsd,
        netExchangeFlow,
        activeWallets: walletsResponse?.length || 0,
      });

      setTransactions(transactionsResponse || []);
      setWallets(walletsResponse || []);

      // Transform exchange flow stats for cards
      const flowData: ExchangeFlowData[] = flowStats.map(f => ({
        exchange: f._id,
        stats: {
          totalInflowUsd: f.totalInflowUsd,
          totalOutflowUsd: f.totalOutflowUsd,
          totalNetFlowUsd: f.netFlowUsd,
          inflowCount: 0,
          outflowCount: 0,
        },
      }));
      setExchangeFlows(flowData);

      setLastUpdated(new Date());
      
      if (isRefresh) {
        toast.success('Data refreshed');
      }
    } catch (error) {
      console.error('Failed to fetch on-chain data:', error);
      toast.error('Failed to load on-chain data', {
        description: 'Please check your connection and try again',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  /**
   * Initial load and polling setup
   */
  useEffect(() => {
    fetchData();

    // Set up polling
    pollIntervalRef.current = setInterval(() => {
      fetchData(true);
    }, POLL_INTERVAL);

    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [fetchData]);

  /**
   * Manual refresh handler
   */
  const handleRefresh = () => {
    fetchData(true);
  };

  /**
   * Watch wallet handler
   */
  const handleWatchWallet = async (address: string, blockchain: BlockchainType) => {
    if (!isPremium) {
      toast.error('Premium feature', {
        description: 'Upgrade to premium to track custom wallets',
      });
      return;
    }
    
    try {
      await onchainService.addToWatchlist(address, blockchain);
      toast.success('Wallet added to watchlist');
    } catch (error) {
      toast.error('Failed to add wallet', {
        description: 'You may have reached your watchlist limit',
      });
    }
  };

  /**
   * Toggle exchange filter
   */
  const toggleExchange = (exchange: string) => {
    setSelectedExchanges(prev => 
      prev.includes(exchange) 
        ? prev.filter(e => e !== exchange)
        : [...prev, exchange]
    );
  };

  /**
   * Filter transactions based on search and filters
   */
  const filteredTransactions = transactions.filter(tx => {
    // Search filter
    const matchesSearch = searchQuery === '' || 
      tx.fromLabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toLabel?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.fromAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.toAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tx.txHash.toLowerCase().includes(searchQuery.toLowerCase());
    
    // Blockchain filter
    const matchesBlockchain = selectedBlockchain === 'all' || tx.blockchain === selectedBlockchain;
    
    return matchesSearch && matchesBlockchain;
  });

  /**
   * Filter exchange flows
   */
  const filteredFlows = exchangeFlows.filter(flow => 
    selectedExchanges.includes(flow.exchange.toLowerCase())
  );

  /**
   * Filter wallets by blockchain
   */
  const filteredWallets = wallets.filter(wallet =>
    selectedBlockchain === 'all' || wallet.blockchain === selectedBlockchain
  );

  return (
    <div className="p-8 relative">
      {/* Floating Particles Background */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div 
          className="absolute top-1/4 -left-20 w-96 h-96 bg-[#7c3aed] rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          style={{ animation: 'float-blob 8s ease-in-out infinite' }}
        />
        <div 
          className="absolute top-1/3 -right-20 w-96 h-96 bg-[#06b6d4] rounded-full mix-blend-multiply filter blur-3xl opacity-10"
          style={{ animation: 'float-blob 8s ease-in-out infinite', animationDelay: '2s' }}
        />
      </div>

      <div className="relative z-10">
      {/* Header */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-[30px] font-bold gradient-text leading-[36px] flex items-center gap-3">
              🐋 Whale Tracker
              {!isPremium && (
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium Feature
                </Badge>
              )}
            </h1>
            <p className="text-base text-[#a1a1aa] mt-2">
              Track whale movements and exchange flows
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Last updated indicator */}
            {lastUpdated && (
              <div className="flex items-center gap-2 text-sm text-[#6e7681]">
                <Clock className="w-4 h-4" />
                Updated {formatDistanceToNow(lastUpdated, { addSuffix: true })}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!isPremium}
            >
              <Bell className="w-4 h-4" />
              Alerts
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="mb-8">
        <StatsOverview stats={stats} loading={loading} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6e7681]" />
          <Input
            placeholder="Search transactions, wallets..."
            value={searchQuery}
            onChange={(value) => setSearchQuery(value)}
            className="pl-10"
          />
        </div>

        {/* Exchange Filter */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="w-4 h-4" />
              Exchanges
              <Badge variant="secondary" className="ml-1">
                {selectedExchanges.length}
              </Badge>
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48 max-h-64 overflow-y-auto">
            {EXCHANGES.map(exchange => (
              <DropdownMenuCheckboxItem
                key={exchange}
                checked={selectedExchanges.includes(exchange)}
                onCheckedChange={() => toggleExchange(exchange)}
              >
                {exchange.charAt(0).toUpperCase() + exchange.slice(1)}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Blockchain Filter */}
        <div className="flex items-center gap-2">
          <Button
            variant={selectedBlockchain === 'all' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedBlockchain('all')}
          >
            All
          </Button>
          <Button
            variant={selectedBlockchain === 'bitcoin' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedBlockchain('bitcoin')}
            className="gap-1"
          >
            <span className="text-orange-500">₿</span> BTC
          </Button>
          <Button
            variant={selectedBlockchain === 'ethereum' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setSelectedBlockchain('ethereum')}
            className="gap-1"
          >
            <span className="text-purple-500">Ξ</span> ETH
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="transactions" className="gap-2">
            <Activity className="w-4 h-4" />
            Transactions
          </TabsTrigger>
          <TabsTrigger value="flows" className="gap-2">
            <TrendingUp className="w-4 h-4" />
            Exchange Flows
          </TabsTrigger>
          <TabsTrigger value="wallets" className="gap-2">
            <Wallet className="w-4 h-4" />
            Wallets
          </TabsTrigger>
        </TabsList>

        {/* Transactions Tab */}
        <TabsContent value="transactions">
          <Card variant="default" className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">
                Recent Whale Transactions
              </h3>
              <Badge variant="outline">
                {filteredTransactions.length} transactions
              </Badge>
            </div>
            <TransactionList 
              transactions={filteredTransactions} 
              loading={loading} 
            />
          </Card>
        </TabsContent>

        {/* Exchange Flows Tab */}
        <TabsContent value="flows">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlows.map((flow) => (
              <ExchangeFlowCard
                key={flow.exchange}
                exchange={flow.exchange.charAt(0).toUpperCase() + flow.exchange.slice(1)}
                stats={flow.stats}
                loading={loading}
              />
            ))}
            {filteredFlows.length === 0 && !loading && (
              <Card variant="default" className="col-span-full p-8 text-center">
                <p className="text-[#a1a1aa]">No exchange flow data available</p>
                <p className="text-sm text-[#6e7681] mt-2">
                  Data will appear as whale transactions are detected
                </p>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Wallets Tab */}
        <TabsContent value="wallets">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredWallets.map(wallet => (
              <WalletCard
                key={wallet._id}
                wallet={wallet}
                onWatch={(address) => handleWatchWallet(address, wallet.blockchain)}
                isWatched={false}
              />
            ))}
            {filteredWallets.length === 0 && !loading && (
              <Card variant="default" className="col-span-full p-8 text-center">
                <p className="text-[#a1a1aa]">No tracked wallets found</p>
                <p className="text-sm text-[#6e7681] mt-2">
                  Known exchange and whale wallets will appear here
                </p>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Premium CTA */}
      {!isPremium && (
        <Card 
          variant="gradient" 
          className="mt-8 p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Crown className="w-5 h-5 text-yellow-500" />
                Upgrade to Premium
              </h3>
              <p className="text-[#a1a1aa] mt-1">
                Get 90-day history, custom watchlists, Telegram alerts, and more
              </p>
            </div>
            <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
              Upgrade Now
            </Button>
          </div>
        </Card>
      )}
      </div>
    </div>
  );
}