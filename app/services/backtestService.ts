import axiosInstance from "../app/_api/axios";
import { BacktestResult, BacktestParams } from "../app/_types/backtest";
import { GeneralResponse } from "../app/_types/common";

interface SubmitBacktestResponse {
  ok: number;
  data?: {
    backtestId: string;
    status: string;
    message: string;
  };
  error?: string;
}

interface GetBacktestResponse {
  ok: number;
  data?: BacktestResult;
  error?: string;
}

interface GetBacktestsResponse {
  ok: number;
  data?: BacktestResult[];
  error?: string;
}

interface DeleteBacktestResponse {
  ok: number;
  message?: string;
  error?: string;
}

class BacktestService {
  /**
   * Submit a new backtest
   */
  async submitBacktest(params: BacktestParams): Promise<SubmitBacktestResponse> {
    try {
      const response = await axiosInstance.post<GeneralResponse<any>>('/backtest/run', params);
      
      if (response.data.isOk) {
        return {
          ok: 1,
          data: response.data.payload,
        };
      } else {
        return {
          ok: 0,
          error: response.data.message || 'Failed to submit backtest',
        };
      }
    } catch (error: any) {
      console.error('Submit backtest error:', error);
      return {
        ok: 0,
        error: error.response?.data?.message || error.message || 'Failed to submit backtest',
      };
    }
  }

  /**
   * Get backtest result by ID
   */
  async getBacktestResult(backtestId: string): Promise<GetBacktestResponse> {
    try {
      const response = await axiosInstance.get<GeneralResponse<BacktestResult>>(`/backtest/${backtestId}`);
      
      if (response.data.isOk) {
        return {
          ok: 1,
          data: response.data.payload,
        };
      } else {
        return {
          ok: 0,
          error: response.data.message || 'Failed to fetch backtest result',
        };
      }
    } catch (error: any) {
      console.error('Get backtest result error:', error);
      return {
        ok: 0,
        error: error.response?.data?.message || error.message || 'Failed to fetch backtest result',
      };
    }
  }

  /**
   * Get all backtests for the current user
   */
  async getUserBacktests(): Promise<GetBacktestsResponse> {
    try {
      const response = await axiosInstance.get<GeneralResponse<BacktestResult[]>>('/backtest/history');
      
      if (response.data.isOk) {
        return {
          ok: 1,
          data: response.data.payload,
        };
      } else {
        return {
          ok: 0,
          error: response.data.message || 'Failed to fetch backtests',
        };
      }
    } catch (error: any) {
      console.error('Get user backtests error:', error);
      return {
        ok: 0,
        error: error.response?.data?.message || error.message || 'Failed to fetch backtests',
      };
    }
  }

  /**
   * Delete a backtest
   */
  async deleteBacktest(backtestId: string): Promise<DeleteBacktestResponse> {
    try {
      const response = await axiosInstance.delete<GeneralResponse<any>>(`/algo/backtest/${backtestId}`);
      
      if (response.data.isOk) {
        return {
          ok: 1,
          message: 'Backtest deleted successfully',
        };
      } else {
        return {
          ok: 0,
          error: response.data.message || 'Failed to delete backtest',
        };
      }
    } catch (error: any) {
      console.error('Delete backtest error:', error);
      return {
        ok: 0,
        error: error.response?.data?.message || error.message || 'Failed to delete backtest',
      };
    }
  }
}

const backtestService = new BacktestService();
export default backtestService;
