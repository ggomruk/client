import axiosInstance from './axios';

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
    const response = await axiosInstance.get('/algo/backtest/history');
    return response.data.data;
  },
};
