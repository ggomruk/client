'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Play, Loader2, X, MousePointerClick, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
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

  const [currentStep, setCurrentStep] = useState(1);
  const steps = [
    { id: 1, title: "Strategy" },
    { id: 2, title: "Parameters" },
    { id: 3, title: "Simulation" }
  ];

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
      {/* Header & Stepper */}
      <div className="px-4 py-4 border-b border-[#3f3f46] flex-shrink-0 bg-[#18181b] z-20">
        <h3 className="text-base font-semibold text-text-primary flex items-center gap-2 mb-4">
          🧪 Strategy Builder
        </h3>
        
        {/* Progress Steps */}
        <div className="relative flex items-center justify-between px-2">
           <div className="absolute top-1/2 left-0 w-full h-0.5 bg-[#27272a] -z-0" />
           {steps.map((step) => {
             const isActive = step.id === currentStep;
             const isCompleted = step.id < currentStep;
             
             return (
               <div key={step.id} className="relative z-10 flex flex-col items-center gap-1.5 bg-[#18181b] px-2">
                 <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 transition-all duration-300 ${
                   isActive 
                    ? 'border-[#7c3aed] text-[#7c3aed] bg-[#7c3aed]/10' 
                    : isCompleted
                      ? 'border-[#059669] bg-[#059669] text-white border-[#059669]'
                      : 'border-[#3f3f46] text-[#71717a] bg-[#27272a]'
                 }`}>
                   {isCompleted ? <CheckCircle2 size={12} /> : step.id}
                 </div>
                 <span className={`text-[10px] font-medium transition-colors ${
                   isActive ? 'text-[#7c3aed]' : isCompleted ? 'text-[#059669]' : 'text-[#71717a]'
                 }`}>
                   {step.title}
                 </span>
               </div>
             );
           })}
        </div>
      </div>

      {/* Content Body - Step Based */}
      <div className="bg-[#18181b] flex-1 overflow-y-auto px-4 py-4 min-h-0">
        
        {/* Step 1: Strategy Selection */}
        {currentStep === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
            <div>
                <label className="block text-sm font-medium text-text-primary mb-3">
                  Choose your Algorithm
                </label>
                <div className="grid grid-cols-1 gap-2.5">
                  {strategyList.map((strategy: Strategy) => (
                    <button
                      key={strategy.symbol}
                      onClick={() => setSelectedStrategy(strategy.symbol)}
                      className={`relative p-3 rounded-xl text-left transition-all border group ${
                        selectedStrategy === strategy.symbol
                          ? 'bg-[#7c3aed]/10 border-[#7c3aed] shadow-[0_0_15px_rgba(124,58,237,0.1)]'
                          : 'bg-[#27272a] border-[#3f3f46] hover:border-[#71717a]'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-semibold ${
                              selectedStrategy === strategy.symbol ? 'text-[#7c3aed]' : 'text-text-primary group-hover:text-white'
                          }`}>
                              {strategy.symbol}
                          </span>
                          {selectedStrategy === strategy.symbol && <CheckCircle2 size={14} className="text-[#7c3aed]" />}
                      </div>
                    </button>
                  ))}
                </div>
            </div>
            
            {currentStrategy?.requirements && (
                <div className="p-3 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                    <p className="text-[10px] font-semibold text-blue-400 mb-1.5 uppercase tracking-wider flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-400"></span>
                        Strategy Logic
                    </p>
                    <p className="text-xs text-blue-200/90 leading-relaxed">
                        {currentStrategy.requirements}
                    </p>
                </div>
            )}
          </div>
        )}

        {/* Step 2: Parameters */}
        {currentStep === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
             <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-text-primary">
                    Fine-tune {selectedStrategy}
                </h4>
                <span className="text-[10px] px-2 py-1 bg-[#27272a] rounded text-text-secondary">
                    {currentConfig.length} Parameters
                </span>
             </div>

             <div className="space-y-5">
              {currentConfig.map(param => (
                <div key={param.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-text-secondary font-medium">{param.name}</span>
                    <span className="text-xs font-bold text-[#7c3aed] bg-[#7c3aed]/10 px-2 py-0.5 rounded">
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
                    <p className="text-[10px] text-text-secondary leading-tight opacity-70">
                      {param.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Live Validation Feedback */}
            {validationError && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 animate-pulse">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-yellow-500 font-medium">{validationError}</p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 3: Simulation Settings */}
        {currentStep === 3 && (
          <div className="space-y-5 animate-in slide-in-from-right-4 duration-300">
            {/* Strategy Name */}
            <div>
              <label className="block text-xs font-medium text-text-primary mb-1.5">
                Saved Name
              </label>
              <input
                type="text"
                placeholder="e.g. Aggressive MACD Scalp"
                value={backtestParams.strategyName || ''}
                onChange={(e) => handleBacktestParamChange('strategyName', e.target.value)}
                className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-3 py-2 text-sm text-text-primary placeholder-[#52525b] focus:outline-none focus:border-[#7c3aed] transition-colors"
              />
            </div>

            <div className="h-px bg-[#3f3f46]" />

            {/* Date Range */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-medium text-text-primary">
                  Time Period
                </label>
                <button
                  onClick={toggleSelectionMode}
                  className={`text-[10px] px-2 py-1 rounded-md flex items-center gap-1.5 transition-all border ${
                    isSelectingDate 
                      ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 animate-pulse' 
                      : 'bg-[#27272a] border-[#3f3f46] text-text-secondary hover:text-white hover:border-[#71717a]'
                  }`}
                >
                  <MousePointerClick size={12} />
                  {isSelectingDate ? 'Selecting...' : 'Select on Chart'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                   <label className="text-[10px] text-text-secondary uppercase tracking-tight">Start</label>
                   <input
                    type="date"
                    value={backtestParams.startDate}
                    onChange={(e) => handleBacktestParamChange('startDate', e.target.value)}
                    className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-2 py-2 text-xs text-text-primary focus:outline-none focus:border-[#7c3aed]"
                   />
                </div>
                <div className="space-y-1">
                   <label className="text-[10px] text-text-secondary uppercase tracking-tight">End</label>
                   <input
                    type="date"
                    value={backtestParams.endDate}
                    onChange={(e) => handleBacktestParamChange('endDate', e.target.value)}
                    className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-2 py-2 text-xs text-text-primary focus:outline-none focus:border-[#7c3aed]"
                   />
                </div>
              </div>
            </div>

            {/* Financials */}
            <div>
              <label className="block text-xs font-medium text-text-primary mb-2">
                Capital & Risk
              </label>
              <div className="bg-[#27272a]/50 border border-[#3f3f46] rounded-xl p-3 space-y-3">
                 <div className="flex items-center justify-between">
                    <label className="text-xs text-text-secondary">Initial Capital</label>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] text-[#71717a]">USDT</span>
                         <input
                            type="number"
                            value={backtestParams.usdt}
                            onChange={(e) => handleBacktestParamChange('usdt', parseFloat(e.target.value))}
                            className="w-20 bg-[#18181b] border border-[#3f3f46] rounded px-1.5 py-1 text-xs text-right text-text-primary focus:outline-none focus:border-[#7c3aed]"
                          />
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <label className="text-xs text-text-secondary">Trading Fee</label>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] text-[#71717a]">%</span>
                         <input
                            type="number"
                            step="0.01"
                            value={backtestParams.tc * 100}
                            onChange={(e) => handleBacktestParamChange('tc', parseFloat(e.target.value) / 100)}
                            className="w-20 bg-[#18181b] border border-[#3f3f46] rounded px-1.5 py-1 text-xs text-right text-text-primary focus:outline-none focus:border-[#7c3aed]"
                          />
                    </div>
                 </div>
                 <div className="flex items-center justify-between">
                    <label className="text-xs text-text-secondary">Leverage</label>
                    <div className="flex items-center gap-2">
                         <span className="text-[10px] text-[#71717a]">x</span>
                         <input
                            type="number"
                            min="1"
                            max="50"
                            value={backtestParams.leverage}
                            onChange={(e) => handleBacktestParamChange('leverage', parseInt(e.target.value))}
                            className="w-20 bg-[#18181b] border border-[#3f3f46] rounded px-1.5 py-1 text-xs text-right text-text-primary focus:outline-none focus:border-[#7c3aed]"
                          />
                    </div>
                 </div>
              </div>
            </div>

            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-2.5 flex items-start gap-2">
                <X className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-red-500">{error}</p>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Footer Navigation */}
      <div className="p-4 border-t border-[#3f3f46] bg-[#18181b] flex-shrink-0 flex gap-3">
         {currentStep > 1 && (
            <button 
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="px-4 py-2 rounded-lg bg-[#27272a] hover:bg-[#3f3f46] text-text-secondary hover:text-white text-xs font-medium transition-colors flex items-center gap-1"
            >
                <ChevronLeft size={14} /> Back
            </button>
         )}
         
         {currentStep < 3 ? (
             <button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={currentStep === 2 && !!validationError}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:opacity-90 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Next Step <ChevronRight size={14} />
            </button>
         ) : (
            <button
                onClick={runBacktest}
                disabled={isRunning || !!validationError}
                className="flex-1 py-2 rounded-lg bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] hover:opacity-90 text-white text-xs font-semibold shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isRunning ? (
                    <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing...</span>
                    </>
                ) : (
                    <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>Run Simulation</span>
                    </>
                )}
            </button>
         )}
      </div>

      {/* Backtest Results - Sticky at bottom only if result exists
          )}
        </button>
      </div>

      {/* Backtest Results Summary - Separate Section */}
      <BacktestResults />
    </div>
  );
}
