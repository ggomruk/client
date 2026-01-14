// API service for optimizer features
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

export interface ParameterRange {
  name: string;
  min: number;
  max: number;
  step: number;
}

export interface StrategyConfig {
  id: string;
  type: string;
  parameters: ParameterRange[];
}

export interface OptimizeStrategyDTO {
  symbol: string;
  interval: string;
  startDate: string;
  endDate: string;
  strategies: StrategyConfig[];
  metric?: 'sharpe' | 'return' | 'profit_factor' | 'win_rate';
  leverage?: number;
  commission?: number;
  usdt?: number;
}

export interface OptimizationResult {
  optimizationId: string;
  status: 'running' | 'completed' | 'failed';
  totalCombinations: number;
  completedCombinations: number;
  bestParams?: any;
  bestMetricValue?: number;
  allResults?: Array<{
    backtestId: string;
    params: any;
    metricValue: number;
  }>;
}

export interface CompareStrategiesDTO {
  backtestIds: string[];
  metrics?: string[];
}

export interface WalkForwardDTO {
  symbol: string;
  interval: string;
  startDate: string;
  endDate: string;
  strategy: string;
  trainingWindow: number;
  testingWindow: number;
  stepSize: number;
  strategyParams?: Record<string, any>;
  leverage?: number;
  commission?: number;
  usdt?: number;
}

class OptimizerService {
  private getAuthHeader() {
    const token = localStorage.getItem('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
  }

  async optimizeStrategy(dto: OptimizeStrategyDTO): Promise<{ optimizationId: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/optimizer/optimize`,
      dto,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getOptimizationStatus(optimizationId: string): Promise<OptimizationResult> {
    const response = await axios.get(
      `${API_BASE_URL}/optimizer/optimize/${optimizationId}`,
      this.getAuthHeader()
    );
    return response.data;
  }

  async compareStrategies(dto: CompareStrategiesDTO): Promise<any> {
    const response = await axios.post(
      `${API_BASE_URL}/optimizer/compare`,
      dto,
      this.getAuthHeader()
    );
    return response.data;
  }

  async walkForwardAnalysis(dto: WalkForwardDTO): Promise<{ analysisId: string }> {
    const response = await axios.post(
      `${API_BASE_URL}/optimizer/walk-forward`,
      dto,
      this.getAuthHeader()
    );
    return response.data;
  }

  async getWalkForwardResults(analysisId: string): Promise<any> {
    const response = await axios.get(
      `${API_BASE_URL}/optimizer/walk-forward/${analysisId}`,
      this.getAuthHeader()
    );
    return response.data;
  }
}

export const optimizerService = new OptimizerService();
