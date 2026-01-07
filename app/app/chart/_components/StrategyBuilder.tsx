'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Play, Loader2, X, MousePointerClick } from 'lucide-react';
import { useBacktest } from '../../_provider/backtest.context';
import { useWebsocket } from '../../_provider/binance.websocket';
import { usePanel } from '../../_provider/panel.context';
import BacktestResults from './BacktestResults';
import { strategyList } from '../../_constants/strategy';
import { Strategy, StrategyParam } from '../../_types/startegy';

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
    isSelectingDate,
    toggleSelectionMode,
  } = useBacktest();

  const validationError = useMemo(() => {
    if (!selectedStrategy) return null;
    
    const params = strategyParams;

    switch (selectedStrategy) {
      case 'SMA':
        if (params.sma_s && params.sma_l && params.sma_s >= params.sma_l) {
          return 'Short Period must be less than Long Period';
        }
        break;
      case 'MACD':
        if (params.fast && params.slow && params.fast >= params.slow) {
          return 'Fast Period must be less than Slow Period';
        }
        break;
      case 'RSI':
        if (params.oversold && params.overbought && params.oversold >= params.overbought) {
          return 'Oversold level must be less than Overbought level';
        }
        break;
    }
    return null;
  }, [selectedStrategy, strategyParams]);

  // Initialize strategy params when strategy changes
  useEffect(() => {
    const strategy: Strategy | undefined = strategyList.find(s => s.symbol === selectedStrategy);
    if (strategy) {
      const defaultParams: any = {};
      strategy.params.forEach((param: StrategyParam) => {
        if (param.default !== undefined) {
            defaultParams[param.name] = param.default;
        }
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

  const currentStrategy = strategyList.find(s => s.symbol === selectedStrategy);
  const currentConfig = currentStrategy?.params || [];

  return (
    <div className="flex flex-col h-full bg-[#18181b]">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#3f3f46] flex-shrink-0">
        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2">
          🧪 Strategy Builder
        </h3>
        <p className="text-xs text-text-secondary mt-0.5">Configure and test trading strategies</p>
      </div>

      {/* Content - Scrollable */}
      <div className="px-4 py-4 space-y-4 overflow-y-auto flex-1 min-h-0">
        {/* Strategy Name */}
        <div>
          <label className="block text-xs font-medium text-text-primary mb-2">
            Strategy Name (Optional)
          </label>
          <input
            type="text"
            placeholder="Auto-generated if empty"
            value={backtestParams.strategyName || ''}
            onChange={(e) => handleBacktestParamChange('strategyName', e.target.value)}
            className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-text-primary placeholder-[#71717a] focus:outline-none focus:border-[#7c3aed]"
          />
          <p className="text-[10px] text-text-secondary mt-1">
            Give your strategy a memorable name for easy comparison
          </p>
        </div>

        {/* Strategy Selection */}
        <div>
          <label className="block text-xs font-medium text-text-primary mb-2">
            Select Strategy
          </label>
          <div className="grid grid-cols-2 gap-2">
            {strategyList.map((strategy: Strategy) => (
              <button
                key={strategy.symbol}
                onClick={() => setSelectedStrategy(strategy.symbol)}
                className={`p-2.5 rounded-lg text-center transition-all ${
                  selectedStrategy === strategy.symbol
                    ? 'bg-gradient-to-r from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[#7c3aed]/50'
                    : 'bg-[#27272a] hover:bg-[#3f3f46] border border-[#3f3f46]'
                }`}
              >
                <div className="text-xs font-medium text-text-primary">{strategy.symbol}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Strategy Requirements */}
        {currentStrategy?.requirements && (
            <div className="p-2.5 bg-blue-500/5 border border-blue-500/20 rounded-lg">
                <p className="text-[10px] font-semibold text-blue-400 mb-1 uppercase tracking-wider">Requirements</p>
                <p className="text-[11px] text-blue-200/80 leading-relaxed">
                    {currentStrategy.requirements}
                </p>
            </div>
        )}

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
                    <span className="text-xs text-text-secondary">{param.name}</span>
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
                  {param.explanation && (
                    <p className="text-[10px] text-text-secondary mt-1 leading-tight">
                      {param.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Date Range */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-xs font-medium text-text-primary">
              Date Range
            </label>
            <button
              onClick={toggleSelectionMode}
              className={`text-[10px] px-2 py-0.5 rounded flex items-center gap-1.5 transition-all border ${
                isSelectingDate 
                  ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 animate-pulse' 
                  : 'bg-[#27272a] border-[#3f3f46] text-text-secondary hover:text-white hover:border-[#71717a]'
              }`}
              title="Click two points on the chart to select range"
            >
              <MousePointerClick size={12} />
              {isSelectingDate ? 'Select 2 points...' : 'Select on Chart'}
            </button>
          </div>
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

        {/* Validation Error */}
        {validationError && (
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-2">
            <div className="flex items-start gap-2">
              <X className="w-3 h-3 text-yellow-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-yellow-500">{validationError}</p>
            </div>
          </div>
        )}

        {/* Run Button */}
        <button
          onClick={runBacktest}
          disabled={isRunning || !!validationError}
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
