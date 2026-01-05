'use client';

import React, { useState, useEffect } from 'react';
import { Play, Loader2, X } from 'lucide-react';
import { useBacktest } from '../../_provider/backtest.context';
import { useWebsocket } from '../../_provider/binance.websocket';
import { usePanel } from '../../_provider/panel.context';
import BacktestResults from './BacktestResults';

const STRATEGIES = [
  { id: 'SMA', name: 'SMA Crossover', description: 'Simple Moving Average crossover strategy' },
  { id: 'RSI', name: 'RSI', description: 'Relative Strength Index strategy' },
  { id: 'MACD', name: 'MACD', description: 'Moving Average Convergence Divergence' },
  { id: 'Bollinger', name: 'Bollinger Bands', description: 'Bollinger Bands breakout strategy' },
];

const STRATEGY_PARAMS_CONFIG: Record<string, Array<{ name: string; label: string; min: number; max: number; default: number; step: number }>> = {
  SMA: [
    { name: 'sma_s', label: 'Short Period', min: 5, max: 100, default: 50, step: 1 },
    { name: 'sma_l', label: 'Long Period', min: 50, max: 300, default: 200, step: 1 },
  ],
  RSI: [
    { name: 'rsi_period', label: 'RSI Period', min: 5, max: 30, default: 14, step: 1 },
    { name: 'oversold', label: 'Oversold', min: 10, max: 40, default: 30, step: 1 },
    { name: 'overbought', label: 'Overbought', min: 60, max: 90, default: 70, step: 1 },
  ],
  MACD: [
    { name: 'fast', label: 'Fast Period', min: 5, max: 20, default: 12, step: 1 },
    { name: 'slow', label: 'Slow Period', min: 20, max: 40, default: 26, step: 1 },
    { name: 'signal', label: 'Signal Period', min: 5, max: 15, default: 9, step: 1 },
  ],
  Bollinger: [
    { name: 'period', label: 'Period', min: 10, max: 50, default: 20, step: 1 },
    { name: 'std', label: 'Std Dev', min: 1, max: 4, default: 2, step: 0.1 },
  ],
};

export default function StrategyBuilder() {
  const { symbol, interval } = useWebsocket();
  const { showIndicators, panelStack, updatePanelStack } = usePanel();
  const {
    selectedStrategy,
    setSelectedStrategy,
    strategyParams,
    setStrategyParams,
    backtestParams,
    setBacktestParams,
    runBacktest,
    isRunning,
    error,
  } = useBacktest();

  // Initialize strategy params when strategy changes
  useEffect(() => {
    const config = STRATEGY_PARAMS_CONFIG[selectedStrategy];
    if (config) {
      const defaultParams: any = {};
      config.forEach(param => {
        defaultParams[param.name] = param.default;
      });
      setStrategyParams(defaultParams);
    }
  }, [selectedStrategy, setStrategyParams]);

  // Update symbol and interval when they change
  useEffect(() => {
    setBacktestParams(prev => ({
      ...prev,
      symbol,
      interval,
    }));
  }, [symbol, interval, setBacktestParams]);

  const handleParamChange = (paramName: string, value: number) => {
    setStrategyParams(prev => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleBacktestParamChange = (field: string, value: any) => {
    setBacktestParams(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const currentConfig = STRATEGY_PARAMS_CONFIG[selectedStrategy] || [];

  return (
    <div className="flex flex-col h-full bg-[#18181b] border-l border-[#3f3f46]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#3f3f46] flex-shrink-0">
        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
          🧪 Strategy Builder
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">Configure and test trading strategies</p>
      </div>

      {/* Content - Scrollable */}
      <div className="px-4 py-4 space-y-4 overflow-y-auto flex-1">
        {/* Strategy Selection */}
        <div>
          <label className="block text-xs font-medium text-text-primary mb-2">
            Select Strategy
          </label>
          <div className="grid grid-cols-2 gap-2">
            {STRATEGIES.map(strategy => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                className={`p-2.5 rounded-lg text-center transition-all ${
                  selectedStrategy === strategy.id
                    ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[#7c3aed]/50'
                    : 'bg-[#27272a] hover:bg-[#3f3f46] border border-[#3f3f46]'
                }`}
              >
                <div className="text-xs font-medium text-text-primary">{strategy.name}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Parameters */}
        {currentConfig.length > 0 && (
          <div>
            <label className="block text-xs font-medium text-text-primary mb-2">
              Parameters
            </label>
            <div className="grid grid-cols-2 gap-3">
              {currentConfig.map(param => (
                <div key={param.name}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-xs text-text-secondary">{param.label}</span>
                    <span className="text-xs font-medium text-text-primary">
                      {strategyParams[param.name] || param.default}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={param.min}
                    max={param.max}
                    step={param.step}
                    value={strategyParams[param.name] || param.default}
                    onChange={(e) => handleParamChange(param.name, parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-[#27272a] rounded-lg appearance-none cursor-pointer accent-[#7c3aed]"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div>
          <label className="block text-xs font-medium text-text-primary mb-2">
            Date Range
          </label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-text-secondary">From</label>
              <input
                type="date"
                value={backtestParams.startDate}
                onChange={(e) => handleBacktestParamChange('startDate', e.target.value)}
                className="w-full mt-1 bg-[#27272a] border border-[#3f3f46] rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary">To</label>
              <input
                type="date"
                value={backtestParams.endDate}
                onChange={(e) => handleBacktestParamChange('endDate', e.target.value)}
                className="w-full mt-1 bg-[#27272a] border border-[#3f3f46] rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
          </div>
        </div>

        {/* Capital & Settings */}
        <div>
          <label className="block text-xs font-medium text-text-primary mb-2">
            Capital & Settings
          </label>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-xs text-text-secondary">Capital (USDT)</label>
              <input
                type="number"
                value={backtestParams.usdt}
                onChange={(e) => handleBacktestParamChange('usdt', parseFloat(e.target.value))}
                className="w-full mt-1 bg-[#27272a] border border-[#3f3f46] rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary">Fee (%)</label>
              <input
                type="number"
                step="0.001"
                value={backtestParams.tc * 100}
                onChange={(e) => handleBacktestParamChange('tc', parseFloat(e.target.value) / 100)}
                className="w-full mt-1 bg-[#27272a] border border-[#3f3f46] rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
            <div>
              <label className="text-xs text-text-secondary">Leverage</label>
              <input
                type="number"
                min="1"
                max="10"
                value={backtestParams.leverage}
                onChange={(e) => handleBacktestParamChange('leverage', parseInt(e.target.value))}
                className="w-full mt-1 bg-[#27272a] border border-[#3f3f46] rounded-lg px-2 py-1.5 text-xs text-text-primary focus:outline-none focus:border-[#7c3aed]"
              />
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2">
            <div className="flex items-start gap-2">
              <X className="w-3 h-3 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-500">{error}</p>
            </div>
          </div>
        )}

        {/* Run Button */}
        <button
          onClick={runBacktest}
          disabled={isRunning}
          className="w-full bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:from-[#6d28d9] hover:to-[#0891b2] disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Running...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4" />
              <span className="text-sm">Run Backtest</span>
            </>
          )}
        </button>
      </div>

      {/* Backtest Results Summary - Separate Section */}
      <BacktestResults />
    </div>
  );
}
