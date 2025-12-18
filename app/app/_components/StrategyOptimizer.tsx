'use client';

import { useState } from 'react';
import { optimizerService, OptimizeStrategyDTO, ParameterRange, OptimizationResult } from '../_api/optimizer.service';
import styles from './StrategyOptimizer.module.css';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select } from './ui/select';

export default function StrategyOptimizer() {
  const [formData, setFormData] = useState<OptimizeStrategyDTO>({
    symbol: 'BTCUSDT',
    interval: '1h',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    strategies: ['RSI'],
    paramRanges: [],
    metric: 'sharpe',
    leverage: 1,
    commission: 0.001,
    usdt: 10000,
  });

  const [paramRanges, setParamRanges] = useState<ParameterRange[]>([
    { name: 'rsiPeriod', min: 10, max: 20, step: 5 },
  ]);

  const [optimizationId, setOptimizationId] = useState<string | null>(null);
  const [result, setResult] = useState<OptimizationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { optimizationId: id } = await optimizerService.optimizeStrategy({
        ...formData,
        paramRanges,
      });
      
      setOptimizationId(id);
      pollStatus(id);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to start optimization');
      setLoading(false);
    }
  };

  const pollStatus = async (id: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await optimizerService.getOptimizationStatus(id);
        setResult(status);

        if (status.status === 'completed' || status.status === 'failed') {
          clearInterval(interval);
          setLoading(false);
        }
      } catch (err) {
        clearInterval(interval);
        setError('Failed to fetch optimization status');
        setLoading(false);
      }
    }, 3000);
  };

  const addParamRange = () => {
    setParamRanges([...paramRanges, { name: '', min: 1, max: 10, step: 1 }]);
  };

  const updateParamRange = (index: number, field: keyof ParameterRange, value: any) => {
    const updated = [...paramRanges];
    updated[index][field] = value as never;
    setParamRanges(updated);
  };

  const removeParamRange = (index: number) => {
    setParamRanges(paramRanges.filter((_, i) => i !== index));
  };

  const progress = result 
    ? Math.round((result.completedCombinations / result.totalCombinations) * 100) 
    : 0;

  return (
    <div className={styles.container}>
      {/* Header Section */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.iconWrapper}>
            <svg className={styles.icon} width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M9 3L5 7L9 11" stroke="url(#gradient1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 13L19 17L15 21" stroke="url(#gradient2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M5 7H15C17.7614 7 20 9.23858 20 12C20 12.3438 19.9716 12.6813 19.9164 13.0107" stroke="url(#gradient3)" strokeWidth="2" strokeLinecap="round"/>
              <defs>
                <linearGradient id="gradient1" x1="5" y1="3" x2="9" y2="11" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c3aed"/>
                  <stop offset="1" stopColor="#a78bfa"/>
                </linearGradient>
                <linearGradient id="gradient2" x1="15" y1="13" x2="19" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06b6d4"/>
                  <stop offset="1" stopColor="#22d3ee"/>
                </linearGradient>
                <linearGradient id="gradient3" x1="5" y1="7" x2="20" y2="13" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#7c3aed"/>
                  <stop offset="1" stopColor="#06b6d4"/>
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div>
            <h1 className={styles.title}>Strategy Optimizer</h1>
            <p className={styles.subtitle}>Discover optimal parameters through advanced grid search analysis</p>
          </div>
        </div>
        
        {result?.status === 'completed' && (
          <div className={styles.badge}>
            <span className={styles.badgeDot}></span>
            Completed
          </div>
        )}
      </div>

      {error && (
        <div className={styles.alert}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" strokeWidth="2"/>
            <path d="M10 6V10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            <path d="M10 14H10.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          <p>{error}</p>
          <button onClick={() => setError(null)} className={styles.alertClose}>×</button>
        </div>
      )}

      <form onSubmit={handleSubmit} className={styles.form}>
        <Card variant="glass" className={styles.formCard}>
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Configuration</h3>
            <div className={styles.sectionDivider}></div>
          </div>

          <div className={styles.grid}>
            <Input
              label="Symbol"
              type="text"
              value={formData.symbol}
              onChange={(value) => setFormData({ ...formData, symbol: value })}
              required
              placeholder="BTCUSDT"
            />

            <Select
              label="Interval"
              value={formData.interval}
              onChange={(value) => setFormData({ ...formData, interval: value })}
              options={[
                { value: '1m', label: '1 minute' },
                { value: '5m', label: '5 minutes' },
                { value: '15m', label: '15 minutes' },
                { value: '1h', label: '1 hour' },
                { value: '4h', label: '4 hours' },
                { value: '1d', label: '1 day' },
              ]}
            />

            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(value) => setFormData({ ...formData, startDate: value })}
              required
            />

            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(value) => setFormData({ ...formData, endDate: value })}
              required
            />

            <Select
              label="Optimization Metric"
              value={formData.metric}
              onChange={(value) => setFormData({ ...formData, metric: value as any })}
              options={[
                { value: 'sharpe', label: '📊 Sharpe Ratio' },
                { value: 'return', label: '💰 Total Return' },
                { value: 'profit_factor', label: '📈 Profit Factor' },
                { value: 'win_rate', label: '🎯 Win Rate' },
              ]}
            />
          </div>

          <div className={styles.divider}></div>

          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Parameter Ranges</h3>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addParamRange}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3.33334V12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                <path d="M3.33334 8H12.6667" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              Add Parameter
            </Button>
          </div>

          <div className={styles.paramList}>
            {paramRanges.map((range, index) => (
              <div key={index} className={styles.paramItem}>
                <div className={styles.paramGrid}>
                  <Input
                    type="text"
                    placeholder="Parameter name"
                    value={range.name}
                    onChange={(value) => updateParamRange(index, 'name', value)}
                  />
                  <Input
                    type="number"
                    placeholder="Min"
                    value={range.min.toString()}
                    onChange={(value) => updateParamRange(index, 'min', Number(value))}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={range.max.toString()}
                    onChange={(value) => updateParamRange(index, 'max', Number(value))}
                  />
                  <Input
                    type="number"
                    placeholder="Step"
                    value={range.step.toString()}
                    onChange={(value) => updateParamRange(index, 'step', Number(value))}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeParamRange(index)}
                  className={styles.removeBtn}
                >
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path d="M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    <path d="M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            ))}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            fullWidth
            loading={loading}
          >
            {loading ? 'Optimizing...' : 'Start Optimization'}
          </Button>
        </Card>
      </form>

      {/* Progress Section */}
      {loading && result && (
        <Card variant="bordered" className={styles.progressCard}>
          <div className={styles.progressHeader}>
            <div>
              <h4 className={styles.progressTitle}>Optimization Progress</h4>
              <p className={styles.progressSubtitle}>
                {result.completedCombinations} of {result.totalCombinations} combinations completed
              </p>
            </div>
            <div className={styles.progressBadge}>{progress}%</div>
          </div>
          
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progress}%` }}
            >
              <div className={styles.progressGlow}></div>
            </div>
          </div>
        </Card>
      )}

      {/* Results Section */}
      {result?.status === 'completed' && result.bestParams && (
        <Card variant="gradient" glow className={styles.resultsCard}>
          <div className={styles.resultsHeader}>
            <div className={styles.trophy}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
                <path d="M6 9C6 10.5913 6.63214 12.1174 7.75736 13.2426C8.88258 14.3679 10.4087 15 12 15C13.5913 15 15.1174 14.3679 16.2426 13.2426C17.3679 12.1174 18 10.5913 18 9" stroke="url(#trophyGradient)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M12 15V19M12 19H15M12 19H9" stroke="url(#trophyGradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M6 9H4C3.46957 9 2.96086 8.78929 2.58579 8.41421C2.21071 8.03914 2 7.53043 2 7V6C2 5.46957 2.21071 4.96086 2.58579 4.58579C2.96086 4.21071 3.46957 4 4 4H6" stroke="url(#trophyGradient)" strokeWidth="2" strokeLinecap="round"/>
                <path d="M18 9H20C20.5304 9 21.0391 8.78929 21.4142 8.41421C21.7893 8.03914 22 7.53043 22 7V6C22 5.46957 21.7893 4.96086 21.4142 4.58579C21.0391 4.21071 20.5304 4 20 4H18" stroke="url(#trophyGradient)" strokeWidth="2" strokeLinecap="round"/>
                <defs>
                  <linearGradient id="trophyGradient" x1="2" y1="4" x2="22" y2="19" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#f59e0b"/>
                    <stop offset="1" stopColor="#fbbf24"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div>
              <h3 className={styles.resultsTitle}>Optimization Complete!</h3>
              <p className={styles.resultsSubtitle}>Best performing parameters found</p>
            </div>
          </div>

          <div className={styles.resultsContent}>
            <div className={styles.resultLabel}>Optimal Parameters</div>
            <div className={styles.resultValue}>
              <pre>{JSON.stringify(result.bestParams, null, 2)}</pre>
            </div>
          </div>

          {result.bestMetricValue && (
            <div className={styles.metricCard}>
              <div className={styles.metricLabel}>Best {formData.metric}</div>
              <div className={styles.metricValue}>
                {result.bestMetricValue.toFixed(4)}
              </div>
            </div>
          )}
        </Card>
      )}
    </div>
  );
}
