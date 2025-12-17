'use client';

import { useState } from 'react';
import { optimizerService, WalkForwardDTO } from '../_api/optimizer.service';
import { Card, Button, Input, Select } from '@/src/components';
import styles from './WalkForwardAnalysis.module.css';

export default function WalkForwardAnalysis() {
  const [formData, setFormData] = useState({
    symbol: 'BTCUSDT',
    interval: '1h',
    startDate: '2024-01-01',
    endDate: '2024-03-31',
    strategy: 'MACD',
    trainingWindow: 30,
    testingWindow: 7,
    stepSize: 7,
  });

  const [strategyParams, setStrategyParams] = useState(
    JSON.stringify({ fast_period: 12, slow_period: 26, signal_period: 9 }, null, 2)
  );

  const [analysisId, setAnalysisId] = useState('');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const params = JSON.parse(strategyParams);

      const dto: WalkForwardDTO = {
        symbol: formData.symbol,
        interval: formData.interval,
        startDate: formData.startDate,
        endDate: formData.endDate,
        strategy: formData.strategy,
        strategyParams: params,
        trainingWindow: formData.trainingWindow,
        testingWindow: formData.testingWindow,
        stepSize: formData.stepSize,
      };

      const data = await optimizerService.walkForwardAnalysis(dto);
      setAnalysisId(data.analysisId);
      setPolling(true);

      // Poll for results
      const interval = setInterval(async () => {
        try {
          const results = await optimizerService.getWalkForwardResults(data.analysisId);
          if (results.status === 'completed') {
            setResult(results);
            setPolling(false);
            clearInterval(interval);
          }
        } catch (err) {
          console.error('Polling error:', err);
        }
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to start analysis');
    } finally {
      setLoading(false);
    }
  };

  const calculateOverfittingScore = () => {
    if (!result?.windows) return null;

    const avgTraining = result.windows.reduce((sum: number, w: any) => sum + w.trainingPerformance, 0) / result.windows.length;
    const avgTesting = result.windows.reduce((sum: number, w: any) => sum + w.testingPerformance, 0) / result.windows.length;

    const degradation = ((avgTraining - avgTesting) / Math.abs(avgTraining)) * 100;

    return {
      avgTraining: avgTraining.toFixed(4),
      avgTesting: avgTesting.toFixed(4),
      degradation: degradation.toFixed(2),
      severity: degradation < 20 ? 'Low' : degradation < 50 ? 'Medium' : 'High',
    };
  };

  const overfitting = result ? calculateOverfittingScore() : null;

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 17l-3-3-4 4-3-3-3 3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h2 className={styles.title}>Walk-Forward Analysis</h2>
          <p className={styles.subtitle}>Test strategy robustness with rolling window validation</p>
        </div>
      </div>

      {/* Configuration Form */}
      <Card variant="glass">
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGrid}>
            <Input
              label="Symbol"
              value={formData.symbol}
              onChange={(e) => setFormData({ ...formData, symbol: e.target.value })}
              required
            />
            <Select
              label="Interval"
              value={formData.interval}
              onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
              options={[
                { value: '15m', label: '15 Minutes' },
                { value: '1h', label: '1 Hour' },
                { value: '4h', label: '4 Hours' },
                { value: '1d', label: '1 Day' },
              ]}
            />
          </div>

          <div className={styles.formGrid}>
            <Input
              label="Start Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="End Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className={styles.formGrid}>
            <Select
              label="Strategy"
              value={formData.strategy}
              onChange={(e) => setFormData({ ...formData, strategy: e.target.value })}
              options={[
                { value: 'MACD', label: 'MACD' },
                { value: 'RSI', label: 'RSI' },
                { value: 'BOLLINGER', label: 'Bollinger Bands' },
                { value: 'SMA', label: 'SMA Crossover' },
                { value: 'STOCHASTIC', label: 'Stochastic' },
              ]}
            />
            <div>
              <label className={styles.label}>Strategy Parameters (JSON)</label>
              <textarea
                value={strategyParams}
                onChange={(e) => setStrategyParams(e.target.value)}
                className={styles.textarea}
                rows={3}
              />
            </div>
          </div>

          <div className={styles.formGrid3}>
            <Input
              label="Training Window (Days)"
              type="number"
              value={formData.trainingWindow.toString()}
              onChange={(e) => setFormData({ ...formData, trainingWindow: Number(e.target.value) })}
              required
            />
            <Input
              label="Testing Window (Days)"
              type="number"
              value={formData.testingWindow.toString()}
              onChange={(e) => setFormData({ ...formData, testingWindow: Number(e.target.value) })}
              required
            />
            <Input
              label="Step Size (Days)"
              type="number"
              value={formData.stepSize.toString()}
              onChange={(e) => setFormData({ ...formData, stepSize: Number(e.target.value) })}
              required
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            loading={loading || polling}
            disabled={loading || polling}
          >
            {loading ? 'Starting...' : polling ? 'Running Analysis...' : 'Start Walk-Forward Analysis'}
          </Button>
        </form>
      </Card>

      {/* Error Message */}
      {error && (
        <Card variant="default" className={styles.errorCard}>
          <div className={styles.errorIcon}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v4m0 4h.01" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p className={styles.errorText}>{error}</p>
        </Card>
      )}

      {/* Polling Status */}
      {polling && (
        <Card variant="glass" className={styles.pollingCard}>
          <div className={styles.spinner}></div>
          <div>
            <p className={styles.pollingText}>Analysis in progress...</p>
            <p className={styles.pollingSubtext}>Checking for results every 3 seconds</p>
          </div>
        </Card>
      )}

      {/* Results */}
      {result && (
        <div className={styles.results}>
          <h3 className={styles.resultsTitle}>Analysis Results</h3>

          {/* Overfitting Assessment */}
          {overfitting && (
            <Card
              variant="gradient"
              className={`${styles.overfittingCard} ${styles[`severity${overfitting.severity}`]}`}
            >
              <h4 className={styles.overfittingTitle}>Overfitting Assessment</h4>
              <div className={styles.metricsGrid}>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Avg Training Return</p>
                  <p className={styles.metricValue}>{overfitting.avgTraining}%</p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Avg Testing Return</p>
                  <p className={styles.metricValue}>{overfitting.avgTesting}%</p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Performance Degradation</p>
                  <p className={styles.metricValue}>{overfitting.degradation}%</p>
                </div>
                <div className={styles.metricCard}>
                  <p className={styles.metricLabel}>Overfitting Severity</p>
                  <p className={`${styles.metricValue} ${styles.severityBadge} ${styles[`severity${overfitting.severity}`]}`}>
                    {overfitting.severity}
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Windows Table */}
          <Card variant="default">
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Window</th>
                    <th>Training Period</th>
                    <th>Testing Period</th>
                    <th>Training Return</th>
                    <th>Testing Return</th>
                    <th>Difference</th>
                  </tr>
                </thead>
                <tbody>
                  {result.windows.map((window: any, index: number) => {
                    const diff = window.trainingPerformance - window.testingPerformance;
                    return (
                      <tr key={index} className={styles.tableRow}>
                        <td className={styles.windowNumber}>#{index + 1}</td>
                        <td className={styles.dateRange}>
                          {new Date(window.trainingStart).toLocaleDateString()} -{' '}
                          {new Date(window.trainingEnd).toLocaleDateString()}
                        </td>
                        <td className={styles.dateRange}>
                          {new Date(window.testingStart).toLocaleDateString()} -{' '}
                          {new Date(window.testingEnd).toLocaleDateString()}
                        </td>
                        <td>
                          <span className={styles.trainingReturn}>{window.trainingPerformance.toFixed(4)}%</span>
                        </td>
                        <td>
                          <span className={window.testingPerformance >= 0 ? styles.positiveReturn : styles.negativeReturn}>
                            {window.testingPerformance.toFixed(4)}%
                          </span>
                        </td>
                        <td>
                          <span className={diff >= 0 ? styles.positiveDiff : styles.negativeDiff}>
                            {diff >= 0 ? '+' : ''}{diff.toFixed(4)}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Chart Placeholder */}
          <Card variant="glass" className={styles.chartPlaceholder}>
            <svg className={styles.chartIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 3v18h18" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M7 16l3-3 4 1 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div>
              <p className={styles.chartTitle}>Performance Chart</p>
              <p className={styles.chartSubtitle}>
                Visual representation of training vs testing performance over time
              </p>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
