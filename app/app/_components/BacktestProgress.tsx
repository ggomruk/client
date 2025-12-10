'use client';

import React from 'react';
import { BacktestResult } from '../_types/backtest.js';

interface BacktestProgressProps {
  backtest: BacktestResult;
}

const BacktestProgress: React.FC<BacktestProgressProps> = ({ backtest }) => {
  const getStatusColor = () => {
    switch (backtest.status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'processing':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = () => {
    switch (backtest.status) {
      case 'pending':
        return 'Queued';
      case 'processing':
        return `Processing... ${backtest.progress || 0}%`;
      case 'completed':
        return 'Completed';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="p-4 bg-gray-900 border border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${getStatusColor()} ${backtest.status === 'processing' ? 'animate-pulse' : ''}`}></div>
          <span className="text-sm font-medium text-gray-300">
            {getStatusText()}
          </span>
        </div>
        <span className="text-xs text-gray-500">
          ID: {backtest.backtestId.slice(0, 8)}...
        </span>
      </div>

      {/* Progress Bar */}
      {(backtest.status === 'processing' || backtest.status === 'pending') && (
        <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
          <div
            className="bg-indigo-500 h-full transition-all duration-300 ease-out"
            style={{ width: `${backtest.progress || 0}%` }}
          />
        </div>
      )}

      {/* Error Message */}
      {backtest.status === 'error' && backtest.error && (
        <div className="mt-2 text-sm text-red-400">
          {backtest.error}
        </div>
      )}

      {/* Backtest Parameters Summary */}
      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-500">
        <div>
          <span className="text-gray-400">Symbol:</span> {backtest.params.symbol}
        </div>
        <div>
          <span className="text-gray-400">Leverage:</span> {backtest.params.leverage}x
        </div>
        <div>
          <span className="text-gray-400">Capital:</span> ${backtest.params.usdt}
        </div>
        <div>
          <span className="text-gray-400">Strategies:</span> {Object.keys(backtest.params.strategies).length}
        </div>
      </div>
    </div>
  );
};

export default BacktestProgress;
