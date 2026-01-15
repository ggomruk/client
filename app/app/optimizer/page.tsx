'use client';

import { useState, useEffect, useRef } from "react";
import { Sliders, Plus, X, Trophy, Download, TrendingUp, TrendingDown, Activity, Info, History as HistoryIcon } from "lucide-react";
import { Card } from "../_components/ui/card";
import { Button } from "../_components/ui/button";
import { Input } from "../_components/ui/input";
import { Select } from "../_components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../_components/ui/dialog";
import { useAuth } from "@/app/contexts/AuthContext";
import { useServerWebsocket } from "@/app/app/_provider/server.websocket";
import { toast } from "sonner";
import axiosInstance from "../_api/axios";
import { OptimizationHistory } from "./_components/OptimizationHistory";
import { PageNotReady } from "../_components/PageNotReady";

interface ParameterRange {
  name: string;
  min: string;
  max: string;
  step: string;
}

interface StrategyConfig {
  id: string;
  type: string;
  parameters: ParameterRange[];
}

interface OptimizerResult {
  parameters: Record<string, number>;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
  cagr?: number;
  finalUsdt?: number;
  rank?: number;
}

const strategies = [
  { value: "macd", label: "MACD", icon: <Activity className="w-4 h-4" /> },
  { value: "rsi", label: "RSI", icon: <TrendingUp className="w-4 h-4" /> },
  { value: "bollinger", label: "Bollinger Bands", icon: <TrendingDown className="w-4 h-4" /> },
  { value: "sma", label: "SMA Crossover", icon: <Activity className="w-4 h-4" /> },
  { value: "stochastic", label: "Stochastic", icon: <TrendingUp className="w-4 h-4" /> }
];

const intervals = [
  { value: "15m", label: "15 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "4h", label: "4 Hours" },
  { value: "1d", label: "1 Day" }
];

const tradingPairs = [
  { value: "BTC/USDT", label: "BTC/USDT" },
  { value: "ETH/USDT", label: "ETH/USDT" },
  { value: "SOL/USDT", label: "SOL/USDT" },
  { value: "XRP/USDT", label: "XRP/USDT" },
  { value: "DOGE/USDT", label: "DOGE/USDT" }
];

const strategyParameters: Record<string, { value: string; label: string }[]> = {
  macd: [
    { value: "ema_s", label: "Fast Period (EMA S)" },
    { value: "ema_l", label: "Slow Period (EMA L)" },
    { value: "signal_mw", label: "Signal Period" }
  ],
  rsi: [
    { value: "periods", label: "Period" },
    { value: "rsi_upper", label: "Overbought Level" },
    { value: "rsi_lower", label: "Oversold Level" }
  ],
  bollinger: [
    { value: "sma", label: "Period (SMA)" },
    { value: "dev", label: "Standard Deviation" }
  ],
  sma: [
    { value: "sma_s", label: "Fast Period" },
    { value: "sma_m", label: "Medium Period" },
    { value: "sma_l", label: "Slow Period" }
  ],
  stochastic: [
    { value: "periods", label: "K Period" },
    { value: "d_mw", label: "D Period" }
  ]
};

export default function OptimizerPage() {
  // Temporary maintenance mode flag
  const IS_MAINTENANCE_MODE = true;

  // All hooks must be called unconditionally at the top
  const { user, token } = useAuth();
  const { socket } = useServerWebsocket();
  
  const [symbol, setSymbol] = useState("");
  const [timeInterval, setTimeInterval] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  // Initialize with one empty strategy block
  const [strategiesConfig, setStrategiesConfig] = useState<StrategyConfig[]>([
    { id: "init", type: "", parameters: [] }
  ]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<OptimizerResult[] | null>(null);
  const [bestResult, setBestResult] = useState<OptimizerResult | null>(null);
  const [optimizationId, setOptimizationId] = useState<string | null>(null);
  
  // Refs to track state in event handlers without stale closures
  const optimizationIdRef = useRef<string | null>(null);
  const isOptimizingRef = useRef(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Sync refs with state
  useEffect(() => {
    optimizationIdRef.current = optimizationId;
  }, [optimizationId]);

  useEffect(() => {
    isOptimizingRef.current = isOptimizing;
  }, [isOptimizing]);

  // WebSocket listeners
  useEffect(() => {
    if (!socket) return;

    const handleProgress = (data: any) => {
      // Check if this is the optimization we are waiting for
      // 1. ID matches
      // 2. OR we are optimizing but don't have an ID yet (race condition)
      const isMatchingId = optimizationIdRef.current && data.optimizationId === optimizationIdRef.current;
      const isPendingStart = isOptimizingRef.current && !optimizationIdRef.current;

      if (isMatchingId || isPendingStart) {
        // If we caught it in the pending state, we can optionally set the ID now, 
        // but let's just update progress to be safe
        if (isPendingStart) {
            console.log("Received progress for pending optimization:", data.optimizationId);
        }
        setProgress(Math.round(data.progress));
      }
    };

    const handleComplete = (data: any) => {
      const isMatchingId = optimizationIdRef.current && data.optimizationId === optimizationIdRef.current;
      const isPendingStart = isOptimizingRef.current && !optimizationIdRef.current;

      if (isMatchingId || isPendingStart) {
        setIsOptimizing(false);
        setProgress(100);
        
        // Process results
        if (data.topResults && Array.isArray(data.topResults)) {
          const processedResults: OptimizerResult[] = data.topResults.map((item: any, index: number) => {
            // Extract performance metrics safely (support both old and new payload structures)
            const perf = item.performance_metrics || item.result?.performance || {};
            const params = item.combination || item.config?.combination || {};
            
            // Calculate total return percentage
            // New payload uses 'cstrategy' (multiplier), old used 'total_return' (decimal)
            let totalReturn = 0;
            if (perf.cstrategy !== undefined) {
              totalReturn = (perf.cstrategy - 1) * 100;
            } else if (perf.total_return !== undefined) {
              totalReturn = perf.total_return * 100;
            }

            return {
              parameters: params,
              totalReturn: parseFloat(totalReturn.toFixed(2)),
              sharpeRatio: parseFloat((perf.sharpe || perf.sharpe_ratio || 0).toFixed(2)),
              maxDrawdown: parseFloat((perf.max_drawdown || 0).toFixed(2)), // Not currently in new payload
              profitFactor: parseFloat((perf.profit_factor || 0).toFixed(2)), // Not currently in new payload
              cagr: parseFloat((perf.cagr || 0).toFixed(2)),
              finalUsdt: parseFloat((perf.final_usdt_levered || 0).toFixed(2)),
              rank: index + 1
            };
          });
          
          setResults(processedResults);
          if (processedResults.length > 0) {
            setBestResult(processedResults[0]);
            // Scroll to results
            setTimeout(() => {
              resultsRef.current?.scrollIntoView({ behavior: 'smooth' });
            }, 100);
          }
          toast.success("Optimization completed successfully!");
        }
      }
    };

    socket.on('optimization:progress', handleProgress);
    socket.on('optimization:complete', handleComplete);

    return () => {
      socket.off('optimization:progress', handleProgress);
      socket.off('optimization:complete', handleComplete);
    };
  }, [socket]); // Removed optimizationId dependency to avoid re-subscribing

  const addStrategy = () => {
    setStrategiesConfig([
      ...strategiesConfig,
      { id: Math.random().toString(36).substr(2, 9), type: "", parameters: [] }
    ]);
  };

  const removeStrategy = (id: string) => {
    if (strategiesConfig.length > 1) {
      setStrategiesConfig(strategiesConfig.filter(s => s.id !== id));
    }
  };

  const updateStrategyType = (id: string, type: string) => {
    setStrategiesConfig(strategiesConfig.map(s => 
      s.id === id ? { ...s, type, parameters: [] } : s
    ));
  };

  const addParameter = (strategyId: string) => {
    setStrategiesConfig(strategiesConfig.map(s => 
      s.id === strategyId 
        ? { ...s, parameters: [...s.parameters, { name: "", min: "", max: "", step: "1" }] }
        : s
    ));
  };

  const removeParameter = (strategyId: string, index: number) => {
    setStrategiesConfig(strategiesConfig.map(s => 
      s.id === strategyId 
        ? { ...s, parameters: s.parameters.filter((_, i) => i !== index) }
        : s
    ));
  };

  const updateParameter = (strategyId: string, index: number, field: keyof ParameterRange, value: string) => {
    setStrategiesConfig(strategiesConfig.map(s => 
      s.id === strategyId 
        ? {
            ...s,
            parameters: s.parameters.map((p, i) => 
              i === index ? { ...p, [field]: value } : p
            )
          }
        : s
    ));
  };

  const startOptimization = async () => {
    if (!symbol || !timeInterval || !startDate || !endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Validate strategies
    const invalidStrategies = strategiesConfig.filter(s => !s.type || s.parameters.length === 0);
    if (invalidStrategies.length > 0) {
      toast.error("Please configure all strategies with at least one parameter range");
      return;
    }

    setIsOptimizing(true);
    setProgress(0);
    setResults(null);
    setBestResult(null);

    try {
      const payload = {
        symbol,
        interval: timeInterval,
        startDate,
        endDate,
        strategies: strategiesConfig.map(s => ({
          id: s.id,
          type: s.type,
          parameters: s.parameters.map(p => ({
            name: p.name,
            min: parseFloat(p.min),
            max: parseFloat(p.max),
            step: parseFloat(p.step)
          }))
        }))
      };

      const response = await axiosInstance.post(
        `/optimizer/optimize`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data && response.data.optimizationId) {
        setOptimizationId(response.data.optimizationId);
        toast.info("Optimization started...");
      }

    } catch (error) {
      console.error("Optimization failed:", error);
      toast.error("Failed to start optimization");
      setIsOptimizing(false);
    }
  };

  const handleLoadResult = (data: any) => {
    setBestResult(data.best);
    setResults(data.all);
    toast.success("Loaded optimization results");
  };

  // Maintenance mode early return (after all hooks are called)
  if (IS_MAINTENANCE_MODE) {
    return (
      <div className="h-full flex items-center justify-center p-6">
        <PageNotReady 
          title="AI Strategy Optimizer"
          description="We're upgrading our optimization engine to support genetic algorithms and walk-forward analysis. This module will be back shortly with enhanced capabilities."
          features={[
            "Genetic Algorithm Engine",
            "Walk-Forward Analysis", 
            "Multi-Strategy Combination",
            "Performance Heatmaps"
          ]}
          estimatedTime="24 hours"
        />
      </div>
    );
  }

  return (
    <div className="overflow-y-auto p-8">
      {/* Page Header */}
      <div className="mb-8 animate-fadeIn">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-[30px] font-bold gradient-text leading-[36px]">
              Strategy Optimizer
            </h1>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Info className="h-5 w-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#18181b] border-[#27272a] text-[#fafafa]">
                <DialogHeader>
                  <DialogTitle className="text-[#7c3aed] text-xl">The Core Concept: &quot;Grid Search&quot;</DialogTitle>
                  <DialogDescription className="text-[#a1a1aa]">
                    Understanding how the Strategy Optimizer works.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-6 mt-4">
                  <div>
                    <p className="text-sm text-[#a1a1aa] leading-relaxed">
                      Imagine you have a Moving Average strategy. You don&apos;t know if 50/200 is the best combination. Maybe 40/180 is better? Maybe 10/50?
                      <br /><br />
                      Optimization is simply running <strong>hundreds of backtests automatically</strong> with different parameter combinations to find the one that makes the most money (or has the lowest risk).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-bold text-lg text-[#fafafa] mb-3">How It Works (The Flow)</h4>
                    
                    <div className="space-y-4">
                      <div className="bg-[#27272a] p-4 rounded-lg">
                        <h5 className="font-semibold text-[#7c3aed] mb-2">Step A: The Inputs (UI)</h5>
                        <p className="text-sm text-[#a1a1aa] mb-2">Instead of entering a single number, you enter a <strong>Range</strong>:</p>
                        <div className="grid grid-cols-2 gap-4 text-xs font-mono bg-[#18181b] p-3 rounded border border-[#3f3f46]">
                          <div>
                            <div className="text-[#fafafa] font-bold mb-1">Parameter 1 (Fast MA):</div>
                            <div>Start: 10</div>
                            <div>End: 50</div>
                            <div>Step: 10</div>
                            <div className="text-green-400 mt-1">Values: [10, 20, 30, 40, 50]</div>
                          </div>
                          <div>
                            <div className="text-[#fafafa] font-bold mb-1">Parameter 2 (Slow MA):</div>
                            <div>Start: 100</div>
                            <div>End: 200</div>
                            <div>Step: 50</div>
                            <div className="text-green-400 mt-1">Values: [100, 150, 200]</div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#27272a] p-4 rounded-lg">
                        <h5 className="font-semibold text-[#7c3aed] mb-2">Step B: The Combinations</h5>
                        <p className="text-sm text-[#a1a1aa] mb-2">The system calculates every possible combination (Cartesian Product):</p>
                        <ul className="text-xs font-mono text-[#a1a1aa] list-disc pl-4 space-y-1">
                          <li>Fast 10, Slow 100</li>
                          <li>Fast 10, Slow 150</li>
                          <li>Fast 10, Slow 200</li>
                          <li>Fast 20, Slow 100</li>
                          <li className="italic">...and so on</li>
                        </ul>
                        <div className="mt-2 text-xs font-bold text-[#fafafa]">Total Backtests = 5 x 3 = 15 backtests</div>
                      </div>

                      <div className="bg-[#27272a] p-4 rounded-lg">
                        <h5 className="font-semibold text-[#7c3aed] mb-2">Step C: The Ranking</h5>
                        <p className="text-sm text-[#a1a1aa] mb-2">The system ranks all results to find the best performing parameters:</p>
                        <div className="space-y-1 text-xs font-mono">
                          <div className="flex justify-between text-green-400">
                            <span>Rank #1: Fast 20 / Slow 150</span>
                            <span>Profit: +120%</span>
                          </div>
                          <div className="flex justify-between text-green-500/80">
                            <span>Rank #2: Fast 30 / Slow 150</span>
                            <span>Profit: +110%</span>
                          </div>
                          <div className="flex justify-between text-red-400/80">
                            <span>Rank #15: Fast 50 / Slow 100</span>
                            <span>Profit: -5%</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary">
                <HistoryIcon className="h-5 w-5" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto bg-[#18181b] border-[#27272a] text-[#fafafa]">
              <DialogHeader>
                <DialogTitle className="text-[#7c3aed] text-xl">Optimization History</DialogTitle>
              </DialogHeader>
              <OptimizationHistory onLoadResult={handleLoadResult} />
            </DialogContent>
          </Dialog>
        </div>
        <p className="text-base text-[#a1a1aa]">
          Fine-tune your strategy parameters for maximum performance
        </p>
      </div>

        {/* Configuration Form */}
        <Card variant="glass" className="p-6 mb-6 animate-slideIn">
          <h3 className="text-xl font-bold text-[#fafafa] mb-6">Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Select
              label="Trading Pair"
              options={tradingPairs}
              value={symbol}
              onChange={setSymbol}
            />
            
            <Select
              label="Time Interval"
              options={intervals}
              value={timeInterval}
              onChange={setTimeInterval}
            />
            
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={setStartDate}
              required
            />
            
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={setEndDate}
              required
            />
          </div>

          {/* Strategies Configuration */}
          <div className="space-y-8 mb-6">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[#fafafa]">Strategies</h3>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={addStrategy}
                disabled={strategiesConfig.length >= strategies.length}
              >
                Add Strategy
              </Button>
            </div>

            {strategiesConfig.map((config, strategyIndex) => {
              // Filter out strategies that are already selected in other blocks
              const otherSelectedTypes = strategiesConfig
                .filter(s => s.id !== config.id)
                .map(s => s.type)
                .filter(Boolean);
                
              const availableStrategies = strategies.filter(s => !otherSelectedTypes.includes(s.value));

              return (
              <div key={config.id} className="p-4 border border-[#3f3f46] rounded-lg bg-[#27272a]/30 animate-slideIn">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1 mr-4">
                    <Select
                      label={`Strategy #${strategyIndex + 1}`}
                      options={availableStrategies}
                      value={config.type}
                      onChange={(value) => updateStrategyType(config.id, value)}
                    />
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-red-400 hover:bg-red-900/20 mt-1"
                    onClick={() => removeStrategy(config.id)}
                    disabled={strategiesConfig.length === 1}
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>

                {/* Parameter Ranges for this Strategy */}
                <div className="mb-2">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-[#fafafa]">Parameter Ranges</h4>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => addParameter(config.id)}
                      disabled={!config.type || (strategyParameters[config.type] && config.parameters.length >= strategyParameters[config.type].length)}
                    >
                      Add Parameter
                    </Button>
                  </div>

                  {!config.type ? (
                    <div className="flex flex-col items-center justify-center p-6 border border-dashed border-[#3f3f46] rounded-lg bg-[#27272a]/20">
                      <Sliders className="w-6 h-6 text-[#a1a1aa] mb-2 opacity-50" />
                      <p className="text-xs text-[#a1a1aa]">Select a strategy type above</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {config.parameters.map((param, paramIndex) => (
                        <div 
                          key={paramIndex} 
                          className="glass rounded-lg p-4 animate-slideIn relative"
                          style={{ zIndex: config.parameters.length - paramIndex }}
                        >
                          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                            <Select
                              label="Parameter"
                              options={strategyParameters[config.type] || []}
                              value={param.name}
                              onChange={(value) => updateParameter(config.id, paramIndex, "name", value)}
                            />
                            <Input
                              label="Start"
                              type="number"
                              value={param.min}
                              onChange={(value) => updateParameter(config.id, paramIndex, "min", value)}
                            />
                            <Input
                              label="End"
                              type="number"
                              value={param.max}
                              onChange={(value) => updateParameter(config.id, paramIndex, "max", value)}
                            />
                            <div className="flex gap-2">
                              <Input
                                label="Step"
                                type="number"
                                value={param.step}
                                onChange={(value) => updateParameter(config.id, paramIndex, "step", value)}
                              />
                              <button
                                onClick={() => removeParameter(config.id, paramIndex)}
                                className="px-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors mt-1"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {config.parameters.length === 0 && (
                        <div className="text-center p-4 text-sm text-[#a1a1aa] italic">
                          No parameters added. Click &quot;Add Parameter&quot; to start.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isOptimizing}
            onClick={startOptimization}
          >
            {isOptimizing ? "Optimizing..." : "Start Optimization"}
          </Button>
        </Card>

        {/* Progress Indicator */}
        {isOptimizing && (
          <Card variant="glass" className="p-6 mb-6 animate-slideIn">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <p className="text-[#fafafa] font-semibold mb-2">
                  Testing parameter combinations... {progress}% completed
                </p>
                <div className="h-2 bg-[#27272a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#7c3aed] to-[#06b6d4] transition-all duration-300 animate-shimmer"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
              </div>
            </div>
            <p className="text-xs text-[#a1a1aa]">~{Math.ceil((100 - progress) * 0.05)} seconds remaining</p>
          </Card>
        )}

        {/* Results Section */}
        {results && bestResult && (
          <div ref={resultsRef} className="space-y-6 animate-fadeIn">
            {/* Best Configuration Card */}
            <Card variant="glass" className="p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7c3aed]/20 to-[#06b6d4]/20 rounded-full blur-3xl"></div>
              
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-6">
                  <Trophy className="w-8 h-8 text-yellow-400 animate-float" />
                  <h3 className="text-2xl font-bold text-[#fafafa]">Optimal Parameters Found</h3>
                </div>

                <div className="flex flex-wrap gap-2 mb-6">
                  {Object.entries(bestResult.parameters).map(([key, value]) => (
                    <span key={key} className="px-3 py-1.5 bg-gradient-to-r from-[#7c3aed]/20 to-[#06b6d4]/20 border border-[#7c3aed]/30 rounded-lg text-sm text-[#fafafa]">
                      {key}: <span className="font-bold">{value}</span>
                    </span>
                  ))}
                </div>

                {/* Performance Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="glass rounded-lg p-4 hover:bg-[#27272a]/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-[#a1a1aa]">Total Return</p>
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-400">+{bestResult.totalReturn}%</p>
                  </div>

                  <div className="glass rounded-lg p-4 hover:bg-[#27272a]/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-[#a1a1aa]">Sharpe Ratio</p>
                      <Activity className="w-4 h-4 text-[#06b6d4]" />
                    </div>
                    <p className="text-2xl font-bold text-[#fafafa]">{bestResult.sharpeRatio}</p>
                  </div>

                  <div className="glass rounded-lg p-4 hover:bg-[#27272a]/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-[#a1a1aa]">CAGR</p>
                      <TrendingDown className="w-4 h-4 text-green-400" />
                    </div>
                    <p className="text-2xl font-bold text-green-400">{bestResult.cagr ? bestResult.cagr.toLocaleString() : '0'}%</p>
                  </div>

                  <div className="glass rounded-lg p-4 hover:bg-[#27272a]/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-[#a1a1aa]">Final USDT</p>
                      <Activity className="w-4 h-4 text-[#7c3aed]" />
                    </div>
                    <p className="text-2xl font-bold text-[#fafafa]">${bestResult.finalUsdt?.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </Card>

            {/* Results Table */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[#fafafa]">All Test Results</h3>
                <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                  Export CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#3f3f46]">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Rank</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Parameters</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Total Return</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Sharpe</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-[#a1a1aa]">CAGR</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Final USDT</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((result, index) => (
                      <tr
                        key={index}
                        className={`border-b border-[#3f3f46] hover:bg-[#27272a]/30 transition-colors
                          ${index === 0 ? "bg-gradient-to-r from-[#7c3aed]/10 to-[#06b6d4]/10" : ""}`}
                      >
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold
                            ${index === 0 ? "bg-yellow-500 text-white" : ""}
                            ${index === 1 ? "bg-gray-400 text-white" : ""}
                            ${index === 2 ? "bg-orange-500 text-white" : ""}
                            ${index > 2 ? "bg-[#27272a] text-[#a1a1aa]" : ""}`}
                          >
                            #{index + 1}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(result.parameters).map(([key, value]) => (
                              <span key={key} className="text-xs text-[#a1a1aa]">
                                {key}:{value}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${result.totalReturn > 0 ? "text-green-400" : "text-red-400"}`}>
                            {result.totalReturn > 0 ? "+" : ""}{result.totalReturn}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right text-[#fafafa] font-semibold">{result.sharpeRatio}</td>
                        <td className="py-3 px-4 text-right text-green-400 font-semibold">{result.cagr ? result.cagr.toLocaleString() : '0'}%</td>
                        <td className="py-3 px-4 text-right text-[#fafafa] font-semibold">${result.finalUsdt?.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
  );
}
