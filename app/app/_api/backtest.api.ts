/**
 * API Service for backtest operations
 */

import axiosInstance from '../_api/axios';
import { BacktestParams, BacktestResult } from '../_types/backtest';

export const backtestApi = {
  /**
   * Submit a new backtest
   */
  async submitBacktest(params: BacktestParams): Promise<{ backtestId: string; status: string; message: string }> {
    const response = await axiosInstance.post('/algo/backtest', params);
    
    if (response.data.ok) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to submit backtest');
    }
  },

  /**
   * Get backtest results by ID
   */
  async getBacktestResult(backtestId: string): Promise<BacktestResult> {
    const response = await axiosInstance.get(`/algo/backtest/${backtestId}`);
    
    if (response.data.ok) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch backtest result');
    }
  },

  /**
   * Get all backtests for the current user
   */
  async getUserBacktests(): Promise<BacktestResult[]> {
    const response = await axiosInstance.get('/algo/backtests');
    
    if (response.data.ok) {
      return response.data.data;
    } else {
      throw new Error(response.data.error || 'Failed to fetch backtests');
    }
  },

  /**
   * Delete a backtest
   */
  async deleteBacktest(backtestId: string): Promise<void> {
    const response = await axiosInstance.delete(`/algo/backtest/${backtestId}`);
    
    if (!response.data.ok) {
      throw new Error(response.data.error || 'Failed to delete backtest');
    }
  }
};

export default backtestApi;
