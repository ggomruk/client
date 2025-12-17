'use client';

import { useState } from 'react';
import { optimizerService, CompareStrategiesDTO } from '../_api/optimizer.service';
import { Card, Button } from '@/src/components';
import styles from './StrategyComparison.module.css';

interface BacktestOption {
  id: string;
  name: string;
  strategy: string;
  symbol: string;
  date: string;
}

export default function StrategyComparison() {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedMetrics, setSelectedMetrics] = useState<string[]>([
    'total_return',
    'sharpe_ratio',
    'max_drawdown',
  ]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Mock backtest history - in production, fetch from API
  const [backtestHistory] = useState<BacktestOption[]>([
    { id: 'bt_001', name: 'MACD Strategy', strategy: 'MACD', symbol: 'BTCUSDT', date: '2024-01-15' },
    { id: 'bt_002', name: 'RSI Strategy', strategy: 'RSI', symbol: 'BTCUSDT', date: '2024-01-16' },
    { id: 'bt_003', name: 'Bollinger Bands', strategy: 'BOLLINGER', symbol: 'BTCUSDT', date: '2024-01-17' },
    { id: 'bt_004', name: 'SMA Crossover', strategy: 'SMA', symbol: 'ETHUSDT', date: '2024-01-18' },
    { id: 'bt_005', name: 'Stochastic', strategy: 'STOCHASTIC', symbol: 'BTCUSDT', date: '2024-01-19' },
  ]);

  const availableMetrics = [
    'total_return',
    'sharpe_ratio',
    'max_drawdown',
    'profit_factor',
    'win_rate',
    'total_trades',
    'avg_trade_duration',
  ];

  const handleBacktestToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleMetricToggle = (metric: string) => {
    setSelectedMetrics((prev) =>
      prev.includes(metric) ? prev.filter((x) => x !== metric) : [...prev, metric]
    );
  };

  const handleCompare = async () => {
    if (selectedIds.length < 2) {
      alert('Please select at least 2 backtests to compare');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const dto: CompareStrategiesDTO = {
        backtestIds: selectedIds,
        metrics: selectedMetrics,
      };

      const data = await optimizerService.compareStrategies(dto);
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to compare strategies');
    } finally {
      setLoading(false);
    }
  };

  const formatMetricName = (metric: string) => {
    return metric
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getRankClass = (rank: number) => {
    if (rank === 1) return styles.rank1;
    if (rank === 2) return styles.rank2;
    if (rank === 3) return styles.rank3;
    return styles.rankOther;
  };

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.iconWrapper}>
          <svg className={styles.icon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M9 12h6m-6 4h6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div>
          <h2 className={styles.title}>Strategy Comparison</h2>
          <p className={styles.subtitle}>Compare multiple strategies side-by-side across key metrics</p>
        </div>
      </div>

      <div className={styles.mainGrid}>
        {/* Backtest Selection */}
        <Card variant="glass">
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Select Backtests</h3>
            <span className={styles.badge}>{selectedIds.length} Selected</span>
          </div>
          <div className={styles.backtestList}>
            {backtestHistory.map((bt) => (
              <label
                key={bt.id}
                className={`${styles.backtestOption} ${selectedIds.includes(bt.id) ? styles.backtestSelected : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(bt.id)}
                  onChange={() => handleBacktestToggle(bt.id)}
                  className={styles.checkbox}
                />
                <div className={styles.backtestInfo}>
                  <p className={styles.backtestName}>{bt.name}</p>
                  <p className={styles.backtestMeta}>
                    {bt.strategy} • {bt.symbol} • {bt.date}
                  </p>
                </div>
                {selectedIds.includes(bt.id) && (
                  <div className={styles.checkIcon}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </Card>

        {/* Metrics Selection */}
        <Card variant="glass">
          <div className={styles.sectionHeader}>
            <h3 className={styles.sectionTitle}>Select Metrics</h3>
            <span className={styles.badge}>{selectedMetrics.length} Selected</span>
          </div>
          <div className={styles.metricsList}>
            {availableMetrics.map((metric) => (
              <label
                key={metric}
                className={`${styles.metricOption} ${selectedMetrics.includes(metric) ? styles.metricSelected : ''}`}
              >
                <input
                  type="checkbox"
                  checked={selectedMetrics.includes(metric)}
                  onChange={() => handleMetricToggle(metric)}
                  className={styles.checkbox}
                />
                <span className={styles.metricName}>{formatMetricName(metric)}</span>
                {selectedMetrics.includes(metric) && (
                  <div className={styles.checkIcon}>
                    <svg viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </label>
            ))}
          </div>
        </Card>
      </div>

      <Button
        onClick={handleCompare}
        variant="primary"
        fullWidth
        loading={loading}
        disabled={loading || selectedIds.length < 2}
      >
        {loading ? 'Comparing...' : `Compare ${selectedIds.length} Strategies`}
      </Button>

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

      {/* Results */}
      {result && (
        <div className={styles.results}>
          {/* Best Overall */}
          {result.bestOverall && (
            <Card variant="gradient" className={styles.bestCard}>
              <div className={styles.trophyIcon}>🏆</div>
              <div>
                <p className={styles.bestLabel}>Best Overall Strategy</p>
                <p className={styles.bestName}>
                  {backtestHistory.find((bt) => bt.id === result.bestOverall)?.name || result.bestOverall}
                </p>
                <p className={styles.bestSubtext}>Ranked #1 most often across all metrics</p>
              </div>
            </Card>
          )}

          {/* Comparison Table */}
          <Card variant="default">
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Strategy</th>
                    {selectedMetrics.map((metric) => (
                      <th key={metric}>{formatMetricName(metric)}</th>
                    ))}
                    <th>Avg Rank</th>
                  </tr>
                </thead>
                <tbody>
                  {result.comparison.map((item: any) => {
                    const backtest = backtestHistory.find((bt) => bt.id === item.backtestId);
                    const isBest = item.backtestId === result.bestOverall;
                    return (
                      <tr
                        key={item.backtestId}
                        className={`${styles.tableRow} ${isBest ? styles.bestRow : ''}`}
                      >
                        <td>
                          <div className={styles.strategyCell}>
                            <p className={styles.strategyName}>{backtest?.name || item.backtestId}</p>
                            <p className={styles.strategyType}>{backtest?.strategy}</p>
                          </div>
                        </td>
                        {selectedMetrics.map((metric) => {
                          const metricData = item.metrics[metric];
                          return (
                            <td key={metric}>
                              <div className={styles.metricCell}>
                                <span className={styles.metricValue}>
                                  {typeof metricData?.value === 'number'
                                    ? metricData.value.toFixed(4)
                                    : metricData?.value || 'N/A'}
                                </span>
                                {metricData?.rank && (
                                  <span className={`${styles.rankBadge} ${getRankClass(metricData.rank)}`}>
                                    #{metricData.rank}
                                  </span>
                                )}
                              </div>
                            </td>
                          );
                        })}
                        <td>
                          <span className={styles.avgRank}>{item.averageRank.toFixed(2)}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Metric Rankings */}
          <div className={styles.rankingsGrid}>
            {Object.entries(result.rankings).map(([metric, rankings]: [string, any]) => (
              <Card key={metric} variant="glass">
                <h4 className={styles.rankingTitle}>{formatMetricName(metric)}</h4>
                <ol className={styles.rankingList}>
                  {rankings.slice(0, 3).map((item: any, idx: number) => {
                    const backtest = backtestHistory.find((bt) => bt.id === item.backtestId);
                    return (
                      <li key={item.backtestId} className={styles.rankingItem}>
                        <span className={`${styles.rankNumber} ${getRankClass(idx + 1)}`}>
                          {idx + 1}
                        </span>
                        <div className={styles.rankingInfo}>
                          <p className={styles.rankingName}>{backtest?.name}</p>
                          <p className={styles.rankingValue}>
                            {typeof item.value === 'number' ? item.value.toFixed(4) : item.value}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
