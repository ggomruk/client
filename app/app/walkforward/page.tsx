import { useState } from "react";
import { TrendingUp as TrendingUpIcon, AlertCircle, Download } from "lucide-react";
import { Card } from "../_components/ui/card";
import { Input } from "../_components/ui/input";
import { Select } from "../_components/ui/select";
import { Button } from "../_components/ui/button";

interface WindowResult {
  window: number;
  trainingPeriod: string;
  testingPeriod: string;
  trainingReturn: number;
  testingReturn: number;
  difference: number;
}

interface AnalysisResult {
  avgTrainingReturn: number;
  avgTestingReturn: number;
  degradation: number;
  severity: "low" | "medium" | "high";
  windows: WindowResult[];
}

const strategies = [
  { value: "macd", label: "MACD" },
  { value: "rsi", label: "RSI" },
  { value: "bollinger", label: "Bollinger Bands" },
];

const intervals = [
  { value: "15m", label: "15 Minutes" },
  { value: "1h", label: "1 Hour" },
  { value: "4h", label: "4 Hours" },
  { value: "1d", label: "1 Day" }
];

export function WalkForwardPage() {
  const [symbol, setSymbol] = useState("");
  const [interval, setInterval] = useState("");
  const [strategy, setStrategy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [parameters, setParameters] = useState('{\n  "fast_period": 12,\n  "slow_period": 26,\n  "signal_period": 9\n}');
  const [trainingWindow, setTrainingWindow] = useState("30");
  const [testingWindow, setTestingWindow] = useState("7");
  const [stepSize, setStepSize] = useState("7");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);

  const startAnalysis = () => {
    setIsAnalyzing(true);
    
    // Simulate analysis
    setTimeout(() => {
      const mockResult: AnalysisResult = {
        avgTrainingReturn: 12.34,
        avgTestingReturn: 10.12,
        degradation: 18.04,
        severity: "low",
        windows: [
          {
            window: 1,
            trainingPeriod: "Jan 1, 2024 - Jan 30, 2024",
            testingPeriod: "Jan 31, 2024 - Feb 6, 2024",
            trainingReturn: 15.23,
            testingReturn: 12.45,
            difference: 2.78
          },
          {
            window: 2,
            trainingPeriod: "Jan 8, 2024 - Feb 6, 2024",
            testingPeriod: "Feb 7, 2024 - Feb 13, 2024",
            trainingReturn: 13.45,
            testingReturn: 11.23,
            difference: 2.22
          },
          {
            window: 3,
            trainingPeriod: "Jan 15, 2024 - Feb 13, 2024",
            testingPeriod: "Feb 14, 2024 - Feb 20, 2024",
            trainingReturn: 11.89,
            testingReturn: 9.67,
            difference: 2.22
          },
          {
            window: 4,
            trainingPeriod: "Jan 22, 2024 - Feb 20, 2024",
            testingPeriod: "Feb 21, 2024 - Feb 27, 2024",
            trainingReturn: 10.45,
            testingReturn: 8.12,
            difference: 2.33
          }
        ]
      };
      
      setResult(mockResult);
      setIsAnalyzing(false);
    }, 3000);
  };

  const severityColors = {
    low: { bg: "from-green-500/20 to-green-600/20", text: "text-green-400", badge: "bg-green-500 text-white" },
    medium: { bg: "from-yellow-500/20 to-yellow-600/20", text: "text-yellow-400", badge: "bg-yellow-500 text-white" },
    high: { bg: "from-red-500/20 to-red-600/20", text: "text-red-400", badge: "bg-red-500 text-white" }
  };

  return (
    <div className="overflow-y-auto p-8">
      {/* Page Header */}
      <div className="mb-8 animate-fadeIn">
        <h1 className="text-[30px] font-bold gradient-text mb-2 leading-[36px]">
          Walk-Forward Analysis
        </h1>
        <p className="text-base text-[#a1a1aa]">
          Test strategy robustness with rolling window validation
        </p>
      </div>

        {/* Configuration Form */}
        <Card variant="glass" className="p-6 mb-6 animate-slideIn">
          <h3 className="text-xl font-bold text-[#fafafa] mb-6">Configuration</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <Input
              label="Trading Pair"
              value={symbol}
              onChange={setSymbol}
              required
            />
            
            <Select
              label="Time Interval"
              options={intervals}
              value={interval}
              onChange={setInterval}
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
            />
          </div>

          {/* Strategy Parameters */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-[#fafafa] mb-2">
              Strategy Parameters (JSON)
            </label>
            <textarea
              value={parameters}
              onChange={(e) => setParameters(e.target.value)}
              className="w-full bg-[#27272a] border border-[#3f3f46] rounded-lg px-4 py-3 text-[#fafafa] font-mono text-sm focus:outline-none focus:border-[#7c3aed] focus:shadow-[0_0_0_3px_rgba(124,58,237,0.1)] transition-all duration-300 min-h-[120px]"
            />
            <p className="text-xs text-[#a1a1aa] mt-1">Enter strategy parameters as valid JSON</p>
          </div>

          {/* Window Settings */}
          <div className="mb-6">
            <h4 className="text-sm font-semibold text-[#fafafa] mb-4">Window Settings</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Input
                  label="Training Window (Days)"
                  type="number"
                  value={trainingWindow}
                  onChange={setTrainingWindow}
                  helperText="Days used to optimize parameters"
                  required
                />
              </div>
              <div>
                <Input
                  label="Testing Window (Days)"
                  type="number"
                  value={testingWindow}
                  onChange={setTestingWindow}
                  helperText="Days used to test optimized parameters"
                  required
                />
              </div>
              <div>
                <Input
                  label="Step Size (Days)"
                  type="number"
                  value={stepSize}
                  onChange={setStepSize}
                  helperText="Days to move forward between windows"
                  required
                />
              </div>
            </div>
          </div>

          <Button
            variant="primary"
            size="lg"
            fullWidth
            loading={isAnalyzing}
            onClick={startAnalysis}
          >
            {isAnalyzing ? "Running Analysis..." : "Start Walk-Forward Analysis"}
          </Button>
        </Card>

        {/* Polling Status */}
        {isAnalyzing && (
          <Card variant="glass" className="p-6 mb-6 animate-slideIn">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 border-4 border-[#7c3aed]/30 border-t-[#7c3aed] rounded-full animate-spin"></div>
              <div className="flex-1">
                <p className="text-[#fafafa] font-semibold mb-1">Analysis in progress...</p>
                <p className="text-sm text-[#a1a1aa]">Checking for results every 3 seconds. This may take several minutes.</p>
              </div>
            </div>
          </Card>
        )}

        {/* Results Section */}
        {result && (
          <div className="space-y-6 animate-fadeIn">
            {/* Overfitting Assessment Card */}
            <Card variant="glass" className={`p-6 bg-gradient-to-r ${severityColors[result.severity].bg} relative overflow-hidden`}>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#fafafa] flex items-center gap-2">
                  Overfitting Assessment
                  <button className="text-[#a1a1aa] hover:text-[#fafafa]" title="Degradation < 20% = Low, 20-50% = Medium, > 50% = High">
                    <AlertCircle className="w-4 h-4" />
                  </button>
                </h3>
                <span className={`px-4 py-1.5 ${severityColors[result.severity].badge} rounded-full text-sm font-bold uppercase`}>
                  {result.severity} Risk
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass rounded-lg p-4">
                  <p className="text-xs text-[#a1a1aa] mb-1">Avg Training Return</p>
                  <p className="text-2xl font-bold text-[#06b6d4]">+{result.avgTrainingReturn}%</p>
                </div>

                <div className="glass rounded-lg p-4">
                  <p className="text-xs text-[#a1a1aa] mb-1">Avg Testing Return</p>
                  <p className="text-2xl font-bold text-[#fafafa]">+{result.avgTestingReturn}%</p>
                </div>

                <div className="glass rounded-lg p-4">
                  <p className="text-xs text-[#a1a1aa] mb-1">Performance Degradation</p>
                  <p className={`text-2xl font-bold ${severityColors[result.severity].text}`}>
                    {result.degradation}%
                  </p>
                </div>

                <div className="glass rounded-lg p-4">
                  <p className="text-xs text-[#a1a1aa] mb-1">Overfitting Severity</p>
                  <p className={`text-2xl font-bold ${severityColors[result.severity].text} uppercase`}>
                    {result.severity}
                  </p>
                </div>
              </div>
            </Card>

            {/* Windows Table */}
            <Card variant="glass" className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-[#fafafa]">Window Results</h3>
                <Button variant="ghost" size="sm" leftIcon={<Download className="w-4 h-4" />}>
                  Export CSV
                </Button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="sticky top-0 bg-[#18181b] z-10">
                    <tr className="border-b border-[#3f3f46]">
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Window</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Training Period</th>
                      <th className="text-left py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Testing Period</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Training Return</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Testing Return</th>
                      <th className="text-right py-3 px-4 text-xs font-semibold text-[#a1a1aa]">Difference</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.windows.map((window, index) => (
                      <tr
                        key={window.window}
                        className={`border-b border-[#3f3f46] hover:bg-[#27272a]/50 transition-colors
                          ${index % 2 === 0 ? "bg-[#27272a]/20" : ""}`}
                      >
                        <td className="py-3 px-4">
                          <span className="font-bold text-[#fafafa]">#{window.window}</span>
                        </td>
                        <td className="py-3 px-4 text-sm text-[#a1a1aa]">{window.trainingPeriod}</td>
                        <td className="py-3 px-4 text-sm text-[#a1a1aa]">{window.testingPeriod}</td>
                        <td className="py-3 px-4 text-right">
                          <span className="font-semibold text-[#06b6d4]">+{window.trainingReturn}%</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${window.testingReturn > 0 ? "text-green-400" : "text-red-400"}`}>
                            {window.testingReturn > 0 ? "+" : ""}{window.testingReturn}%
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold ${window.difference > 0 ? "text-orange-400" : "text-blue-400"}`}>
                            +{window.difference}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="mt-4 pt-4 border-t border-[#3f3f46] text-center text-sm text-[#a1a1aa]">
                Total Windows: {result.windows.length} | Avg Performance Gap: {result.degradation}%
              </div>
            </Card>

            {/* Chart Placeholder */}
            <Card variant="glass" className="p-12 border-dashed">
              <div className="text-center">
                <div className="w-16 h-16 bg-[#27272a] rounded-full flex items-center justify-center mx-auto mb-4">
                  <TrendingUpIcon className="w-8 h-8 text-[#a1a1aa]" />
                </div>
                <h4 className="text-lg font-bold text-[#fafafa] mb-2">Performance Chart</h4>
                <p className="text-sm text-[#a1a1aa] mb-1">Visual representation of training vs testing performance over time</p>
                <p className="text-xs text-[#a1a1aa]">(Chart visualization coming soon)</p>
              </div>
            </Card>
          </div>
        )}
      </div>
  );
}
