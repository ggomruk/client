'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import axiosInstance from '../_api/axios';
import { useServerWebsocket } from './server.websocket';
import { strategyList } from '../_constants/strategy';

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
  initialBalance: number;
  startTime: string;
  endTime: string;
  profitFactor: number;
  averageTrade: number;
  trades: any[];
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
  // Get default strategy (first in list)
  const defaultStrategy = strategyList[0];
  const defaultParams: StrategyParams = {};
  defaultStrategy.params.forEach(p => {
      if (p.default !== undefined) defaultParams[p.name] = p.default;
  });

  const [selectedStrategy, setSelectedStrategy] = useState(defaultStrategy.symbol);
  const [strategyParams, setStrategyParams] = useState<StrategyParams>(defaultParams);
  
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
        [defaultStrategy.symbol]: defaultParams,
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
        const responseData = response.data;
        
        if (!responseData.isOk || !responseData.payload) {
            console.error("Invalid backtest result format", responseData);
            return;
        }

        // Check if payload has result property (from getBacktestResult returning full doc)
        // OR if payload IS the result (from getBacktestResult returning just result)
        let fullResult = responseData.payload.result || responseData.payload;
        
        // If fullResult is still missing or empty, log error
        if (!fullResult || Object.keys(fullResult).length === 0) {
             console.error("Backtest result is empty", responseData);
             return;
        }

        // Handle case where result is nested in 'result' property of the payload (if payload is the document)
        if (fullResult.result) {
            fullResult = fullResult.result;
        }
        
        const params = responseData.payload.params || {};

        // Transform result to match BacktestResult interface
        const transformedResult: BacktestResult = {
            backtestId: data.backtestId,
            strategyName: fullResult.strategy_name || 'Unknown',
            leverageApplied: fullResult.leverage_applied || 1,
            totalReturn: fullResult.levered_performance?.total_return_pct || 0,
            sharpeRatio: fullResult.performance?.sharpe_ratio || 0,
            maxDrawdown: fullResult.performance?.max_drawdown || 0,
            totalTrades: typeof fullResult.performance?.trades === 'number' ? fullResult.performance.trades : (fullResult.performance?.trades?.length || 0),
            winRate: fullResult.performance?.win_rate || 0,
            finalBalance: fullResult.levered_performance?.final_balance || 0,
            initialBalance: fullResult.performance?.initial_usdt || params.usdt || 0,
            startTime: params.startDate || new Date().toISOString(),
            endTime: params.endDate || new Date().toISOString(),
            profitFactor: fullResult.performance?.profit_factor || 0,
            averageTrade: fullResult.performance?.avg_trade || 0,
            trades: Array.isArray(fullResult.performance?.trades) ? fullResult.performance.trades : [],
            performance: fullResult.performance || {},
            leveredPerformance: fullResult.levered_performance || {}
        };

        setResult(transformedResult);
        
        // Generate trade markers
        if (transformedResult.trades.length > 0) {
            const markers: TradeMarker[] = [];
            transformedResult.trades.forEach((trade: any) => {
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
