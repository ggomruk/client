import axiosInstance from './axios';
import { GeneralResponse } from '../_types/common';

export interface BacktestParams {
  symbol: string;
  startDate: string;
  endDate: string;
  interval: string;
  usdt: number;
  leverage: number;
  commission?: number;
  strategyName?: string;
  strategies?: Record<string, any>;
}

export interface BacktestSummary {
  strategyName?: string;
  leverageApplied?: number;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  winRate: number;
  finalBalance: number;
}

export interface BacktestResult {
  status?: string;
  resultId?: string;
  summary?: BacktestSummary; // New format
  performance?: { // Legacy format compatibility and detailed results
    sharpe: number;
    cstrategy: number;
    trades: number;
    initial_usdt?: number;
    final_usdt?: number;
    max_drawdown?: number;
    win_rate?: number;
    "b&h"?: number;
    cagr?: number;
    ann_mean?: number;
    ann_std?: number;
    [key: string]: any;
  };
  levered_performance?: {
    sharpe: number;
    cstrategy: number;
    final_usdt_levered?: number;
    cagr?: number;
    ann_mean?: number;
    ann_std?: number;
    [key: string]: any;
  };
  // Add broad search for other props
  [key: string]: any;
}

export interface BacktestHistoryItem {
  id: string; // The backend uid
  createdAt?: string; // Mongoose timestamps
  backtestParams: BacktestParams;
  result?: BacktestResult;
  // Legacy fields mapping (if flattened by backend controller)
  name: string; 
  strategy: string;
  symbol: string;
  date: string;
}

export const backtestService = {
  getHistory: async (): Promise<BacktestHistoryItem[]> => {
    const response = await axiosInstance.get<GeneralResponse<any[]>>('/backtest/history');
    // Map backend response if necessary to normalize structure
    return response.data.payload?.map(item => ({
       ...item,
       id: item.id || item.uid || 'unknown',
       // Maintain compatibility for components expecting top-level fields
       symbol: item.symbol || item.backtestParams?.symbol || 'Unknown',
       strategy: item.strategy || item.backtestParams?.strategyName || 'Unknown',
       date: item.date || item.createdAt || new Date().toISOString(),
       name: item.name || item.backtestParams?.symbol || 'Unknown'
    })) || [];
  },

  getDetail: async (id: string): Promise<BacktestHistoryItem | null> => {
    try {
      const response = await axiosInstance.get<GeneralResponse<any>>(`/backtest/${id}`);
      const item = response.data.payload;
      if (!item) return null;
      return {
         ...item,
         // Ensure ID is present (backend returns uid in document root)
         id: item.id || item.uid,
         symbol: item.symbol || item.backtestParams?.symbol || 'Unknown',
         strategy: item.strategy || item.backtestParams?.strategyName || 'Unknown',
         date: item.date || item.createdAt || new Date().toISOString(),
         name: item.name || item.backtestParams?.symbol || 'Unknown'
      };
    } catch (e) {
      console.error("Failed to fetch backtest details", e);
      return null;
    }
  }
};
