'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import axiosInstance from '../_api/axios';

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

      const response = await axiosInstance.post<BacktestResult>(
        '/backtest/run',
        updatedParams
      );

      setResult(response.data);
      
      // TODO: Extract trade markers from performance data
      // For now, this is a placeholder - you'll need to parse the actual trade data
      // from the backtest results to generate markers
      
    } catch (err: any) {
      const errorMessage = err.response?.data?.message || err.message || 'Backtest failed';
      setError(errorMessage);
      console.error('Backtest error:', err);
    } finally {
      setIsRunning(false);
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
