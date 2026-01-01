'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosInstance from '../_api/axios';
import { useServerWebsocket } from './server.websocket';

export interface StrategyParams {
  [key: string]: any;
}

export interface BacktestParams {
  symbol: string;
  interval: string;
  startDate: string;
  endDate: string;
  usdt: number;
  tc: number;
  leverage: number;
  strategyParams: {
    strategies: {
      [strategyName: string]: StrategyParams;
    };
  };
}

export interface BacktestResult {
  backtestId: string;
  strategyName: string;
  leverageApplied: number;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  winRate: number;
  finalBalance: number;
  performance: any;
  leveredPerformance: any;
}

export interface TradeMarker {
  time: number;
  position: 'belowBar' | 'aboveBar';
  color: string;
  shape: 'arrowUp' | 'arrowDown';
  text: string;
  size: number;
}

interface BacktestContextType {
  isBacktestMode: boolean;
  setIsBacktestMode: (value: boolean) => void;
  
  selectedStrategy: string;
  setSelectedStrategy: (strategy: string) => void;
  
  strategyParams: StrategyParams;
  setStrategyParams: React.Dispatch<React.SetStateAction<StrategyParams>>;
  
  backtestParams: BacktestParams;
  setBacktestParams: React.Dispatch<React.SetStateAction<BacktestParams>>;
  
  isRunning: boolean;
  result: BacktestResult | null;
  error: string | null;
  
  tradeMarkers: TradeMarker[];
  setTradeMarkers: (markers: TradeMarker[]) => void;
  
  runBacktest: () => Promise<void>;
  clearResults: () => void;
}

const BacktestContext = createContext<BacktestContextType | undefined>(undefined);

export const BacktestProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isBacktestMode, setIsBacktestMode] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState('SMA');
  const [strategyParams, setStrategyParams] = useState<StrategyParams>({
    sma_s: 50,
    sma_l: 200,
  });
  
  const [backtestParams, setBacktestParams] = useState<BacktestParams>({
    symbol: 'BTCUSDT',
    interval: '1d',
    startDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days ago
    endDate: new Date().toISOString().split('T')[0], // today
    usdt: 10000,
    tc: 0.001,
    leverage: 1,
    strategyParams: {
      strategies: {
        SMA: {
          sma_s: 50,
          sma_l: 200,
        },
      },
    },
  });
  
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tradeMarkers, setTradeMarkers] = useState<TradeMarker[]>([]);
  
  const { socket } = useServerWebsocket();

  // Helper to generate trade markers from backtest result
  const generateTradeMarkers = (fullResult: any): TradeMarker[] => {
    if (!fullResult.performance || !fullResult.performance.trades) return [];
    
    return fullResult.performance.trades.map((trade: any) => {
      const isBuy = trade.side === 'buy'; // Assuming 'side' exists in trade object
      // If trade object structure is different, adjust accordingly.
      // Usually trades have entry_time, exit_time, entry_price, exit_price, etc.
      // Or maybe it's a list of orders.
      
      // Let's assume trades list contains executed trades with entry and exit
      // We might want to mark both entry and exit
      
      // For now, let's try to map based on common trade structure
      // If structure is unknown, we might need to inspect the Python code more closely.
      // Python engine.py: self.trades.append({...})
      
      return {
        time: new Date(trade.entry_time).getTime() / 1000,
        position: trade.direction === 'long' ? 'belowBar' : 'aboveBar',
        color: trade.direction === 'long' ? '#10B981' : '#EF4444',
        shape: trade.direction === 'long' ? 'arrowUp' : 'arrowDown',
        text: trade.direction === 'long' ? 'B' : 'S',
        size: 1,
      };
    });
  };

  useEffect(() => {
    if (!socket) return;

    const handleComplete = async (data: any) => {
      console.log('Backtest complete:', data);
      if (data.status === 'error') {
        setError(data.error || 'Backtest failed');
        setIsRunning(false);
        return;
      }

      try {
        // Fetch full result
        const response = await axiosInstance.get(`/backtest/${data.backtestId}`);
        const fullResult = response.data;
        
        // Transform result to match BacktestResult interface
        const transformedResult: BacktestResult = {
            backtestId: data.backtestId,
            strategyName: fullResult.strategy_name,
            leverageApplied: fullResult.leverage_applied,
            totalReturn: fullResult.levered_performance.total_return_pct,
            sharpeRatio: fullResult.performance.sharpe_ratio,
            maxDrawdown: fullResult.performance.max_drawdown,
            totalTrades: fullResult.performance.total_trades,
            winRate: fullResult.performance.win_rate,
            finalBalance: fullResult.levered_performance.final_balance,
            performance: fullResult.performance,
            leveredPerformance: fullResult.levered_performance
        };

        setResult(transformedResult);
        
        // Generate trade markers
        // We need to check the structure of trades in fullResult.performance
        // Assuming fullResult.performance.trades is an array of trades
        if (fullResult.performance.trades) {
            const markers: TradeMarker[] = [];
            fullResult.performance.trades.forEach((trade: any) => {
                // Entry marker
                markers.push({
                    time: new Date(trade.entry_time).getTime() / 1000,
                    position: trade.direction === 'long' ? 'belowBar' : 'aboveBar',
                    color: trade.direction === 'long' ? '#10B981' : '#EF4444',
                    shape: trade.direction === 'long' ? 'arrowUp' : 'arrowDown',
                    text: trade.direction === 'long' ? 'L' : 'S',
                    size: 1,
                });
                
                // Exit marker
                markers.push({
                    time: new Date(trade.exit_time).getTime() / 1000,
                    position: trade.direction === 'long' ? 'aboveBar' : 'belowBar',
                    color: trade.pnl > 0 ? '#10B981' : '#EF4444', // Green if profit, Red if loss
                    shape: 'arrowDown', // Always arrow down for exit? Or maybe X?
                    text: trade.pnl > 0 ? 'TP' : 'SL',
                    size: 1,
                });
            });
            setTradeMarkers(markers);
        }
        
      } catch (err) {
        console.error('Failed to fetch backtest result:', err);
        setError('Failed to fetch backtest result');
      } finally {
        setIsRunning(false);
      }
    };

    socket.on('backtest:complete', handleComplete);
    socket.on('backtest:error', (data) => {
        setError(data.error);
        setIsRunning(false);
    });

    return () => {
      socket.off('backtest:complete', handleComplete);
      socket.off('backtest:error');
    };
  }, [socket]);

  const runBacktest = useCallback(async () => {
    setIsRunning(true);
    setError(null);
    setResult(null);
    setTradeMarkers([]);

    try {
      // Update strategy params in backtest params
      const updatedParams = {
        ...backtestParams,
        strategyParams: {
          strategies: {
            [selectedStrategy]: strategyParams,
          },
        },
      };

      await axiosInstance.post<BacktestResult>(
        '/backtest/run',
        updatedParams
      );

      // Don't set result here, wait for WebSocket
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Backtest failed';
      setError(errorMessage);
      console.error('Backtest error:', err);
      setIsRunning(false); // Only stop if request failed
    }
  }, [backtestParams, selectedStrategy, strategyParams]);

  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
    setTradeMarkers([]);
  }, []);

  const value: BacktestContextType = {
    isBacktestMode,
    setIsBacktestMode,
    selectedStrategy,
    setSelectedStrategy,
    strategyParams,
    setStrategyParams,
    backtestParams,
    setBacktestParams,
    isRunning,
    result,
    error,
    tradeMarkers,
    setTradeMarkers,
    runBacktest,
    clearResults,
  };

  return (
    <BacktestContext.Provider value={value}>
      {children}
    </BacktestContext.Provider>
  );
};

export const useBacktest = (): BacktestContextType => {
  const context = useContext(BacktestContext);
  if (!context) {
    throw new Error('useBacktest must be used within a BacktestProvider');
  }
  return context;
};
