import { useState } from "react";
import { Sliders, Plus, X, Trophy, Download, TrendingUp, TrendingDown, Activity } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select } from "./ui/select";

interface ParameterRange {
  name: string;
  min: string;
  max: string;
  step: string;
}

interface OptimizerResult {
  parameters: Record<string, number>;
  totalReturn: number;
  sharpeRatio: number;
  maxDrawdown: number;
  profitFactor: number;
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

export function OptimizerPage() {
  const [symbol, setSymbol] = useState("");
  const [timeInterval, setTimeInterval] = useState("");
  const [strategy, setStrategy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [parameters, setParameters] = useState<ParameterRange[]>([
    { name: "fast_period", min: "8", max: "15", step: "1" },
    { name: "slow_period", min: "20", max: "30", step: "2" },
    { name: "signal_period", min: "7", max: "12", step: "1" }
  ]);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<OptimizerResult[] | null>(null);
  const [bestResult, setBestResult] = useState<OptimizerResult | null>(null);

  const addParameter = () => {
    setParameters([...parameters, { name: "", min: "", max: "", step: "1" }]);
  };

  const removeParameter = (index: number) => {
    setParameters(parameters.filter((_, i) => i !== index));
  };

  const updateParameter = (index: number, field: keyof ParameterRange, value: string) => {
    const updated = [...parameters];
    updated[index][field] = value;
    setParameters(updated);
  };

  const startOptimization = () => {
    setIsOptimizing(true);
    setProgress(0);
    
    // Simulate optimization progress
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += 5;
      setProgress(currentProgress);
      
      if (currentProgress >= 100) {
        clearInterval(interval);
        setIsOptimizing(false);
        
        // Generate mock results
        const mockResults: OptimizerResult[] = [
          {
            parameters: { fast_period: 12, slow_period: 26, signal_period: 9 },
            totalReturn: 24.86,
            sharpeRatio: 1.84,
            maxDrawdown: -8.4,
            profitFactor: 2.34,
            rank: 1
          },
          {
            parameters: { fast_period: 10, slow_period: 24, signal_period: 8 },
            totalReturn: 22.45,
            sharpeRatio: 1.72,
            maxDrawdown: -9.2,
            profitFactor: 2.18,
            rank: 2
          },
          {
            parameters: { fast_period: 14, slow_period: 28, signal_period: 10 },
            totalReturn: 19.67,
            sharpeRatio: 1.65,
            maxDrawdown: -7.8,
            profitFactor: 2.05,
            rank: 3
          }
        ];
        
        setResults(mockResults);
        setBestResult(mockResults[0]);
      }
    }, 100);
  };

  return (
    <div className="flex-1 bg-[#09090b] overflow-y-auto">
      <div className="max-w-7xl mx-auto p-8">
        {/* Page Header */}
        <div className="mb-8 animate-fadeIn">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7c3aed] to-[#06b6d4] rounded-xl flex items-center justify-center animate-float shadow-lg">
              <Sliders className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold gradient-text">Strategy Optimizer</h1>
              <p className="text-[#a1a1aa] text-sm mt-1">Fine-tune your strategy parameters for maximum performance</p>
            </div>
          </div>
        </div>

        {/* Configuration Form */}
        <Card variant="glass" className="p-6 mb-6 animate-slideIn">
          <h3 className="text-xl font-bold text-[#fafafa] mb-6">Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Trading Pair"
              placeholder="e.g., BTCUSDT"
              value={symbol}
              onChange={setSymbol}
              required
            />
            
            <Select
              label="Time Interval"
              options={intervals}
              value={timeInterval}
              onChange={setTimeInterval}
              placeholder="Select interval"
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

          <div className="mb-6">
            <Select
              label="Strategy"
              options={strategies}
              value={strategy}
              onChange={setStrategy}
              placeholder="Select a strategy"
            />
          </div>

          {/* Parameter Ranges */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-semibold text-[#fafafa]">Parameter Ranges</h4>
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<Plus className="w-4 h-4" />}
                onClick={addParameter}
              >
                Add Parameter
              </Button>
            </div>

            <div className="space-y-3">
              {parameters.map((param, index) => (
                <div key={index} className="glass rounded-lg p-4 animate-slideIn">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <Input
                      placeholder="Parameter name"
                      value={param.name}
                      onChange={(value) => updateParameter(index, "name", value)}
                    />
                    <Input
                      placeholder="Min"
                      type="number"
                      value={param.min}
                      onChange={(value) => updateParameter(index, "min", value)}
                    />
                    <Input
                      placeholder="Max"
                      type="number"
                      value={param.max}
                      onChange={(value) => updateParameter(index, "max", value)}
                    />
                    <div className="flex gap-2">
                      <Input
                        placeholder="Step"
                        type="number"
                        value={param.step}
                        onChange={(value) => updateParameter(index, "step", value)}
                      />
                      <button
                        onClick={() => removeParameter(index)}
                        className="px-3 text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
          <div className="space-y-6 animate-fadeIn">
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
                      <p className="text-xs text-[#a1a1aa]">Max Drawdown</p>
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    </div>
                    <p className="text-2xl font-bold text-red-400">{bestResult.maxDrawdown}%</p>
                  </div>

                  <div className="glass rounded-lg p-4 hover:bg-[#27272a]/50 transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs text-[#a1a1aa]">Profit Factor</p>
                      <Activity className="w-4 h-4 text-[#7c3aed]" />
                    </div>
                    <p className="text-2xl font-bold text-[#fafafa]">{bestResult.profitFactor}</p>
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
                      <th className="text-right py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Drawdown</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Profit Factor</th>
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
                        <td className="py-3 px-4 text-right text-red-400 font-semibold">{result.maxDrawdown}%</td>
                        <td className="py-3 px-4 text-right text-[#fafafa] font-semibold">{result.profitFactor}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
