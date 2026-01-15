'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { RefreshCw, LayoutGrid, Search, SortAsc, SortDesc } from 'lucide-react';
import { backtestService, BacktestHistoryItem } from '../_api/backtest.service';
import HistoryCard from './_components/HistoryCard';
import { Input } from '../_components/ui/input';
import { Button } from '../_components/ui/button';
import { Select } from '../_components/ui/select';
import BacktestDetailsSheet from './_components/BacktestDetailsSheet';

type FilterType = 'All' | 'Done' | 'Running' | 'Error';
type SortType = 'Newest' | 'Oldest' | 'ReturnHigh' | 'ReturnLow';

export default function HistoryPage() {
  const [items, setItems] = useState<BacktestHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // UI State
  const [filter, setFilter] = useState<FilterType>('All');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState<SortType>('Newest');
  const [selectedBacktest, setSelectedBacktest] = useState<BacktestHistoryItem | null>(null);

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const data = await backtestService.getHistory();
      // Sort by date descending
      data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setItems(data);
    } catch (error) {
      console.error('Failed to fetch backtest history', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getStatus = (item: BacktestHistoryItem): 'Done' | 'Running' | 'Error' => {
    if (item.result) return 'Done';
    const age = new Date().getTime() - new Date(item.date).getTime();
    if (age > 3600 * 1000) return 'Error';
    return 'Running';
  };

  const processedItems = useMemo(() => {
    return items
      .filter((item) => {
        // Filter by Status
        if (filter !== 'All' && getStatus(item) !== filter) return false;
        
        // Filter by Search
        if (search) {
          const s = search.toLowerCase();
          const matchesSymbol = item.symbol?.toLowerCase().includes(s);
          const matchesStrategy = (item.strategy || item.name)?.toLowerCase().includes(s);
          const matchesId = item.id?.toLowerCase().includes(s);
          if (!matchesSymbol && !matchesStrategy && !matchesId) return false;
        }
        return true;
      })
      .sort((a, b) => {
        switch (sort) {
          case 'Newest':
            return new Date(b.date!).getTime() - new Date(a.date!).getTime();
          case 'Oldest':
             return new Date(a.date!).getTime() - new Date(b.date!).getTime();
          case 'ReturnHigh':
            return (b.result?.performance?.cstrategy || -999) - (a.result?.performance?.cstrategy || -999);
          case 'ReturnLow':
            return (a.result?.performance?.cstrategy || 999) - (b.result?.performance?.cstrategy || 999);
          default:
            return 0;
        }
      });
  }, [items, filter, search, sort]);

  // Count helper
  const countByStatus = (status: FilterType) => {
    if (status === 'All') return items.length;
    return items.filter(i => getStatus(i) === status).length;
  };

  return (
    <div className="w-full h-full min-h-screen bg-[#09090b] text-zinc-100 p-6 space-y-6 py-8 px-12 lg:px-16 xl:px-20 relative">
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
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-6 border-b border-zinc-800 pb-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center shadow-lg shrink-0">
             <LayoutGrid className="text-white w-6 h-6" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">
              Backtest History
            </h1>
            <p className="text-zinc-400 text-sm mt-1 max-w-md">
              Review performance metrics, logs, and configurations for all your past simulation runs.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto">
           {/* Global Controls */}
           <div className="flex items-center gap-2 w-full sm:w-auto">
             <div className="relative w-full sm:w-64">
               <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
               <Input 
                 placeholder="Search symbol, strategy..." 
                 className="pl-9 bg-zinc-900 border-zinc-700 focus:border-violet-500"
                 value={search}
                 onChange={(value) => setSearch(typeof value === 'string' ? value : '')}
               />
             </div>
             
             <div className="w-[180px]">
               <Select 
                  value={sort} 
                  onChange={(v) => setSort(v as SortType)} 
                  placeholder="Sort by"
                  options={[
                    { value: "Newest", label: "Newest First" },
                    { value: "Oldest", label: "Oldest First" },
                    { value: "ReturnHigh", label: "Highest Return" },
                    { value: "ReturnLow", label: "Lowest Return" },
                  ]}
                  className="bg-zinc-900 border-zinc-700"
               />
             </div>
           </div>
           
           <Button 
            variant="outline"
            onClick={fetchHistory}
            disabled={loading}
            className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white min-w-[100px]"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters (Tabs style) */}
      <div className="flex items-center gap-1 p-1 bg-zinc-900/50 rounded-lg border border-zinc-800/50 w-fit">
        {['All', 'Done', 'Running', 'Error'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as FilterType)}
            className={`
              px-4 py-1.5 rounded-md text-sm font-medium transition-all flex items-center gap-2
              ${filter === f 
                ? 'bg-zinc-800 text-white shadow-sm' 
                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'}
            `}
          >
            {f}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${filter === f ? 'bg-zinc-700 text-zinc-200' : 'bg-zinc-800 text-zinc-600'}`}>
              {countByStatus(f as FilterType)}
            </span>
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
        {loading && items.length === 0 ? (
          // Skeletons
          Array.from({ length: 10 }).map((_, i) => (
             <div key={i} className="h-[140px] bg-zinc-900/50 rounded-xl animate-pulse border border-zinc-800" />
          ))
        ) : processedItems.length > 0 ? (
          processedItems.map((item) => (
            <HistoryCard 
              key={item.id} 
              item={item} 
              onClick={() => setSelectedBacktest(item)}
            />
          ))
        ) : (
          <div className="col-span-full h-64 flex flex-col items-center justify-center text-zinc-500 gap-2 p-8 border border-dashed border-zinc-800 rounded-xl bg-zinc-900/20">
             <LayoutGrid className="w-10 h-10 opacity-20" />
             <p>No backtests found matching your filters.</p>
             {(search || filter !== 'All') && (
                <Button onClick={() => { setSearch(''); setFilter('All'); }} className="text-violet-400">
                  Clear Filters
                </Button>
             )}
          </div>
        )}
      </div>

      <BacktestDetailsSheet 
        isOpen={!!selectedBacktest} 
        onClose={() => setSelectedBacktest(null)} 
        backtest={selectedBacktest} 
      />
      </div>
    </div>
  );
}
