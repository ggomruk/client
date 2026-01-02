import axiosInstance from './axios';
import { GeneralResponse } from '../_types/common';

export interface BacktestHistoryItem {
  id: string;
  name: string;
  strategy: string;
  symbol: string;
  date: string;
  result?: {
    performance: {
      sharpe: number;
      cstrategy: number; // Total Return
      trades: number;
      // Add other fields as needed
    };
    leveragedPerformance?: {
      sharpe: number;
      cstrategy: number;
      // ...
    };
  };
}

export const backtestService = {
  getHistory: async (): Promise<BacktestHistoryItem[]> => {
    const response = await axiosInstance.get<GeneralResponse<BacktestHistoryItem[]>>('/algo/backtest/history');
    return response.data.payload || [];
  },
};
