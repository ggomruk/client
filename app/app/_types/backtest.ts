/**
 * TypeScript interfaces for backtest-related data structures
 */

export interface BacktestParams {
  symbol: string;
  startDate: string;
  endDate: string;
  usdt: number;
  interval: string;
  tc: number;
  leverage: number;
  strategy?: string; // Optional strategy name for display
  strategies: Record<string, any>;
}

export interface BacktestResult {
  backtestId: string;
  userId: string;
  status: 'pending' | 'processing' | 'completed' | 'error';
  progress?: number;
  params: BacktestParams;
  result?: {
    totalReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    // Add more metrics as needed
  };
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface BacktestProgress {
  backtestId: string;
  userId: string;
  progress: number;
  status: string;
  message?: string;
}

export interface BacktestComplete {
  backtestId: string;
  userId: string;
  result: any;
  status: 'completed';
}

export interface BacktestError {
  backtestId: string;
  userId: string;
  error: string;
  status: 'error';
}
