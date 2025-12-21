'use client';

import React, { useRef, useEffect, useState } from 'react'
import { createChart, ColorType, LineStyle, CrosshairMode, IChartApi, ISeriesApi, CandlestickData, LineData, UTCTimestamp } from "lightweight-charts";
import { useWebsocket } from '../_provider/binance.websocket';
import { usePanel } from '../_provider/panel.context';

interface IndicatorConfig {
    enabled: boolean;
    period: number;
    color: string;
}

interface IndicatorsState {
    ema1: IndicatorConfig;
    ema2: IndicatorConfig;
    sma1: IndicatorConfig;
    sma2: IndicatorConfig;
}

const FinancialChart = () => {
    const { klineData, loadMoreData, isLoadingMore, symbol, interval, setInterval } = useWebsocket();
    const { showIndicators, setShowIndicators, isBacktestMode, panelStack, updatePanelStack } = usePanel();

    const chartContainerRef = useRef<HTMLDivElement|null>(null);
    const chartRef = useRef<IChartApi|null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick">|null>(null);
    const indicatorRefs = useRef<Map<string, ISeriesApi<"Line">>>(new Map());

    // Track last rendered time to prevent lightweight-charts "Cannot update oldest data" errors.
    const lastCandleTimeRef = useRef<number | null>(null);
    const lastIndicatorTimeRef = useRef<Map<string, number | null>>(new Map());

    const toUtcTimestamp = (t: unknown): UTCTimestamp => {
        // lightweight-charts expects seconds since epoch (number) for UTCTimestamp.
        // We defensively handle accidental object/Date inputs.
        if (typeof t === 'number' && Number.isFinite(t)) return t as UTCTimestamp;
        if (typeof t === 'string') {
            const parsed = Number(t);
            if (Number.isFinite(parsed)) return parsed as UTCTimestamp;
        }
        if (t instanceof Date) return Math.floor(t.getTime() / 1000) as UTCTimestamp;
        // Attempt to unwrap { time: ... } or similar shapes.
        if (t && typeof t === 'object' && 'time' in (t as any)) {
            return toUtcTimestamp((t as any).time);
        }
        // As a last resort, use "now" to avoid crashing the chart.
        return Math.floor(Date.now() / 1000) as UTCTimestamp;
    };
    const resizeObserverRef = useRef<ResizeObserver|null>(null);
    const isLoadingMoreRef = useRef<boolean>(false);
    const isInitialLoadRef = useRef<boolean>(true);
    const previousDataLengthRef = useRef<number>(0);
    const previousSymbolRef = useRef<string>(symbol);
    const lastUpdateTimeRef = useRef<number>(0);

    // TradingView-like behavior: follow latest only when user is at the right edge.
    const shouldFollowLatestRef = useRef<boolean>(true);
    const lastLogicalRangeRef = useRef<any>(null);

    const [isFollowingLatest, setIsFollowingLatest] = useState(true);
    
    const [indicators, setIndicators] = useState<IndicatorsState>({
        ema1: { enabled: true, period: 12, color: '#F59E0B' },
        ema2: { enabled: true, period: 26, color: '#8B5CF6' },
        sma1: { enabled: false, period: 50, color: '#10B981' },
        sma2: { enabled: false, period: 200, color: '#EF4444' },
    });

    // Calculate vertical offset based on panel stack for Indicators
    const getIndicatorsTopOffset = () => {
        const indicatorsIndex = panelStack.indexOf('indicators');
        const backtestIndex = panelStack.indexOf('backtest');
        
        // If backtest is visible and should be above indicators
        if (isBacktestMode && backtestIndex < indicatorsIndex) {
            return 'top-[380px]';
        }
        return 'top-4'; // 64px from chart top (same as backtest solo position)
    };

    const getIndicatorsZIndex = () => {
        return panelStack.indexOf('indicators') === panelStack.length - 1 ? 11 : 10;
    };

    // Calculate EMA
    const calculateEMA = (data: any[], period: number): LineData[] => {
        if (data.length === 0 || period <= 0) return [];
        
        const k = 2 / (period + 1);
        const emaData: LineData[] = [];
        let ema = data[0].close;
        
        data.forEach((item: any, index: number) => {
            if (index === 0) {
                ema = item.close;
            } else {
                ema = item.close * k + ema * (1 - k);
            }
            emaData.push({
                time: item.time,
                value: ema
            });
        });
        
        return emaData;
    };

    // Calculate SMA
    const calculateSMA = (data: any[], period: number): LineData[] => {
        if (data.length === 0 || period <= 0) return [];
        
        const smaData: LineData[] = [];
        
        for (let i = 0; i < data.length; i++) {
            if (i < period - 1) {
                continue; // Not enough data yet
            }
            
            let sum = 0;
            for (let j = 0; j < period; j++) {
                sum += data[i - j].close;
            }
            const sma = sum / period;
            
            smaData.push({
                time: data[i].time,
                value: sma
            });
        }
        
        return smaData;
    };

    // Initialize chart
    useEffect(() => {
        if (!chartContainerRef.current || chartRef.current) return;

        const container = chartContainerRef.current;

        const chart = createChart(container, {
            width: container.clientWidth,
            height: container.clientHeight,
            layout: {
                background: { type: ColorType.Solid, color: 'transparent' },
                textColor: '#D1D5DB',
            },
            grid: {
                vertLines: { 
                    color: '#374151',
                    style: LineStyle.Solid,
                },
                horzLines: { 
                    color: '#374151',
                    style: LineStyle.Solid,
                },
            },
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 1,
                    color: '#6366F1',
                    style: LineStyle.Dashed,
                    labelBackgroundColor: '#6366F1',
                },
                horzLine: {
                    width: 1,
                    color: '#6366F1',
                    style: LineStyle.Dashed,
                    labelBackgroundColor: '#6366F1',
                },
            },
            rightPriceScale: {
                borderColor: '#374151',
                scaleMargins: {
                    top: 0.1,
                    bottom: 0.2,
                },
            },
            timeScale: {
                borderColor: '#374151',
                timeVisible: true,
                secondsVisible: false,
                lockVisibleTimeRangeOnResize: true,
                rightOffset: 12,
            },
        });

        const candlestickSeries = chart.addCandlestickSeries({
            upColor: '#10B981',
            downColor: '#EF4444',
            borderVisible: false,
            wickUpColor: '#10B981',
            wickDownColor: '#EF4444',
        });

        chartRef.current = chart;
        candleSeriesRef.current = candlestickSeries;

        // Setup ResizeObserver
        resizeObserverRef.current = new ResizeObserver(entries => {
            if (!entries.length || !chartRef.current) return;
            
            const { width, height } = entries[0].contentRect;
            chartRef.current.applyOptions({ 
                width: Math.max(width, 300),
                height: Math.max(height, 200)
            });
        });

        resizeObserverRef.current.observe(container);

        return () => {
            if (resizeObserverRef.current && container) {
                resizeObserverRef.current.unobserve(container);
                resizeObserverRef.current.disconnect();
            }
            if (chartRef.current) {
                chartRef.current.remove();
                chartRef.current = null;
            }
        };
    }, []);

    // Setup lazy loading for historical data + track follow-latest state
    useEffect(() => {
        if (!chartRef.current) return;

        const chart = chartRef.current;
        
        const handleVisibleLogicalRangeChange = async (logicalRange: any) => {
            if (!logicalRange || isLoadingMoreRef.current || isLoadingMore) return;

            // Track whether the user is at the right edge.
            // Heuristic: if the visible range ends at (or beyond) the latest bar index, consider it "following".
            try {
                const barsInfo = candleSeriesRef.current?.barsInLogicalRange(logicalRange);
                if (barsInfo?.barsAfter != null) {
                    const nowFollowing = barsInfo.barsAfter <= 2;
                    shouldFollowLatestRef.current = nowFollowing;
                    setIsFollowingLatest(nowFollowing);
                }
            } catch {
                // ignore
            }

            lastLogicalRangeRef.current = logicalRange;

            // Check if user scrolled close to the left edge (first 10% of visible range)
            const barsInfo = candleSeriesRef.current?.barsInLogicalRange(logicalRange);
            if (barsInfo && logicalRange.from < 100) {
                isLoadingMoreRef.current = true;
                const success = await loadMoreData();
                isLoadingMoreRef.current = false;
                
                if (success) {
                    console.log('Loaded more historical data');
                }
            }
        };

        // Subscribe to visible range changes
        chart.timeScale().subscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);

        return () => {
            chart.timeScale().unsubscribeVisibleLogicalRangeChange(handleVisibleLogicalRangeChange);
        };
    }, [loadMoreData, isLoadingMore]);

    // Update indicators when config changes
    useEffect(() => {
        if (!chartRef.current) return;

        const chart = chartRef.current; // Capture reference to avoid race conditions

        // Remove all existing indicator series
        indicatorRefs.current.forEach((series) => {
            try {
                chart.removeSeries(series);
            } catch (error) {
                // Series might already be removed
                console.debug('Error removing series:', error);
            }
        });
        indicatorRefs.current.clear();

        // Add enabled indicators
        Object.entries(indicators).forEach(([key, config]) => {
            if (config.enabled) {
                try {
                    const series = chart.addLineSeries({
                        color: config.color,
                        lineWidth: 2,
                        priceLineVisible: false,
                        lastValueVisible: false,
                    });
                    indicatorRefs.current.set(key, series);
                } catch (error) {
                    console.error('Error adding indicator series:', error);
                }
            }
        });
    }, [indicators]);

    // Update chart data
    useEffect(() => {
        if (!candleSeriesRef.current || klineData.length === 0) return;
        
        try {
            // Detect symbol change
            const symbolChanged = previousSymbolRef.current !== symbol;
            if (symbolChanged) {
                isInitialLoadRef.current = true;
                previousSymbolRef.current = symbol;
                lastUpdateTimeRef.current = 0;
            }
            
            const currentDataLength = klineData.length;
            const lastCandle = klineData[klineData.length - 1];
            
            // Determine what kind of update this is
            const isInitialLoad = isInitialLoadRef.current;
            const dataLengthChanged = currentDataLength !== previousDataLengthRef.current;
            const isHistoricalDataLoad = dataLengthChanged && currentDataLength > previousDataLengthRef.current + 1;
            const isNewCandle = lastCandle.time !== lastUpdateTimeRef.current;
            
            // Format all data
            const formattedData = klineData.map((item: any) => ({
                time: toUtcTimestamp(item.time),
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
            })) as CandlestickData[];
            
            // Decide between setData() and update()
            if (isInitialLoad || symbolChanged || isHistoricalDataLoad) {
                // Use setData for: initial load, symbol change, or historical data prepend
                candleSeriesRef.current.setData(formattedData);

                // Reset last-time tracking because setData() can contain older points.
                lastCandleTimeRef.current = formattedData.length
                    ? (formattedData[formattedData.length - 1].time as unknown as number)
                    : null;
                
                if (isInitialLoad) {
                    isInitialLoadRef.current = false;
                    // Only auto-fit on initial load
                    if (chartRef.current) {
                        chartRef.current.timeScale().fitContent();
                    }
                }
                // For historical data load, don't call fitContent - preserve scroll
            } else {
                // Use update() for real-time updates (same candle or new candle)
                const lastFormattedCandle = formattedData[formattedData.length - 1];
                if (lastFormattedCandle) {
                    const nextTime = lastFormattedCandle.time as unknown as number;
                    const prevTime = lastCandleTimeRef.current;

                    if (prevTime == null || nextTime >= prevTime) {
                        candleSeriesRef.current.update(lastFormattedCandle);
                        lastCandleTimeRef.current = nextTime;
                    } else {
                        // If we ever get out-of-order data (or a time type mismatch), update() will throw.
                        // Fall back to setData() to resync the series.
                        candleSeriesRef.current.setData(formattedData);
                        lastCandleTimeRef.current = formattedData.length
                            ? (formattedData[formattedData.length - 1].time as unknown as number)
                            : null;
                    }
                }

                // Only auto-follow the latest candle if the user is currently at the right edge.
                if (chartRef.current && shouldFollowLatestRef.current) {
                    chartRef.current.timeScale().scrollToRealTime();
                }
            }
            
            // Update tracking refs
            previousDataLengthRef.current = currentDataLength;
            lastUpdateTimeRef.current = lastCandle.time;
            
            // Calculate and update indicator data
            Object.entries(indicators).forEach(([key, config]) => {
                if (config.enabled) {
                    const series = indicatorRefs.current.get(key);
                    if (series) {
                        let data: LineData[] = [];
                        
                        if (key.startsWith('ema')) {
                            data = calculateEMA(klineData, config.period);
                        } else if (key.startsWith('sma')) {
                            data = calculateSMA(klineData, config.period);
                        }
                        
                        if (data.length > 0) {
                            // Use same logic as candles: setData for full updates, update for incremental
                            if (isInitialLoad || symbolChanged || isHistoricalDataLoad) {
                                const normalized = data.map((p) => ({ ...p, time: toUtcTimestamp(p.time) }));
                                series.setData(normalized);
                                lastIndicatorTimeRef.current.set(key, normalized.length ? (normalized[normalized.length - 1].time as unknown as number) : null);
                            } else {
                                // For real-time updates, just update the last point
                                const lastPoint = data[data.length - 1];
                                if (lastPoint) {
                                    const normalizedPoint = { ...lastPoint, time: toUtcTimestamp(lastPoint.time) };
                                    const nextTime = normalizedPoint.time as unknown as number;
                                    const prevTime = lastIndicatorTimeRef.current.get(key) ?? null;

                                    if (prevTime == null || nextTime >= prevTime) {
                                        series.update(normalizedPoint);
                                        lastIndicatorTimeRef.current.set(key, nextTime);
                                    } else {
                                        const normalized = data.map((p) => ({ ...p, time: toUtcTimestamp(p.time) }));
                                        series.setData(normalized);
                                        lastIndicatorTimeRef.current.set(key, normalized.length ? (normalized[normalized.length - 1].time as unknown as number) : null);
                                    }
                                }
                            }
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error updating chart:', error);
        }
    }, [klineData, indicators, symbol]);

    const updateIndicator = (key: keyof IndicatorsState, field: keyof IndicatorConfig, value: any) => {
        setIndicators(prev => ({
            ...prev,
            [key]: {
                ...prev[key],
                [field]: value
            }
        }));
    };

    const getIndicatorLabel = (key: string): string => {
        const labels: Record<string, string> = {
            ema1: 'EMA',
            ema2: 'EMA',
            sma1: 'SMA',
            sma2: 'SMA',
        };
        return labels[key] || key;
    };

    return (
        <div className="flex flex-col h-full bg-primary-100">
            {/* Compact Header */}
            <div className="px-3 py-2 border-b flex items-center justify-between" style={{borderColor: 'var(--primary-300)'}}>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-text-primary">Chart</h3>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{background: 'var(--primary-200)'}}>
                            <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                            <span className="text-xs text-text-secondary">Live</span>
                        </div>
                    </div>
                    
                    {/* Timeframe Selector */}
                    <div className="flex items-center gap-1 px-1 py-0.5 rounded-md" style={{background: 'var(--primary-200)'}}>
                        {['1m', '5m', '15m', '1h', '4h', '1d'].map((tf) => (
                            <button
                                key={tf}
                                onClick={() => setInterval(tf)}
                                className={`px-2 py-0.5 text-xs font-medium rounded transition-all ${
                                    interval === tf
                                        ? 'bg-primary-400 text-white'
                                        : 'text-text-secondary hover:text-white hover:bg-primary-300'
                                }`}
                            >
                                {tf.toUpperCase()}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Live button: jump back to real-time and re-enable follow */}
                    {!isFollowingLatest && (
                        <button
                            onClick={() => {
                                if (!chartRef.current) return;
                                shouldFollowLatestRef.current = true;
                                setIsFollowingLatest(true);
                                chartRef.current.timeScale().scrollToRealTime();
                            }}
                            className="px-2.5 py-1 text-xs font-medium rounded transition-all bg-primary-400 text-white"
                            title="Jump to latest"
                        >
                            Live
                        </button>
                    )}
                    {/* Indicators Button */}
                    <button
                        onClick={() => {
                            const newShowState = !showIndicators;
                            setShowIndicators(newShowState);
                            updatePanelStack('indicators', newShowState);
                        }}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                            showIndicators
                                ? 'bg-primary-400 text-white'
                                : 'bg-primary-200 text-text-secondary hover:text-white hover:bg-primary-300'
                        }`}
                    >
                        Indicators
                    </button>
                </div>
            </div>



            {/* Chart - Full remaining height */}
            <div className="flex-1 w-full relative">
                <div ref={chartContainerRef} className="w-full h-full" style={{ pointerEvents: 'auto' }} />
                
                {/* Floating Indicators Panel */}
                {showIndicators && (
                    <div 
                        className={`absolute ${getIndicatorsTopOffset()} left-6 bg-[#18181b] border border-[#3f3f46] rounded-xl shadow-2xl p-6`}
                        style={{ 
                            width: '512px', 
                            zIndex: getIndicatorsZIndex(),
                            maxHeight: 'calc(100vh - 400px)',
                            overflowY: 'auto'
                        }}
                    >
                        <div className="grid grid-cols-2 gap-6">
                            {Object.entries(indicators).map(([key, config]) => (
                                <div key={key} className="flex flex-col gap-3">
                                    {/* Checkbox and Label */}
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.enabled}
                                            onChange={(e) => updateIndicator(key as keyof IndicatorsState, 'enabled', e.target.checked)}
                                            className="w-4 h-4 rounded bg-[#27272a] border-none cursor-pointer accent-primary-400"
                                        />
                                        <span className="text-sm font-semibold text-text-primary">
                                            {getIndicatorLabel(key)}({config.period})
                                        </span>
                                    </label>
                                    
                                    {/* Period Slider */}
                                    <div className="flex flex-col gap-5">
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-text-secondary">Period</span>
                                            <span className="text-xs font-semibold text-text-primary">{config.period}</span>
                                        </div>
                                        
                                        {/* Custom Range Slider with Color */}
                                        <div className="relative h-1.5 bg-[#27272a] rounded-full overflow-hidden">
                                            <div 
                                                className="absolute h-full rounded-full transition-all"
                                                style={{
                                                    width: `${((config.period - 5) / (200 - 5)) * 100}%`,
                                                    backgroundColor: config.enabled ? config.color : '#27272a'
                                                }}
                                            />
                                            <input
                                                type="range"
                                                min="5"
                                                max="200"
                                                step="1"
                                                value={config.period}
                                                onChange={(e) => updateIndicator(key as keyof IndicatorsState, 'period', parseInt(e.target.value))}
                                                disabled={!config.enabled}
                                                className="absolute inset-0 w-full opacity-0 cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
                
                {/* Loading Indicator */}
                {isLoadingMore && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg" style={{background: 'var(--primary-200)'}}>
                        <div className="w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-text-secondary">Loading more data...</span>
                    </div>
                )}
            </div>
            
            {/* Compact Legend */}
            <div className="px-3 py-1.5 border-t flex items-center gap-3 flex-wrap text-xs" style={{borderColor: 'var(--primary-300)'}}>
                {Object.entries(indicators).map(([key, config]) => 
                    config.enabled && (
                        <div key={key} className="flex items-center gap-1.5">
                            <div className="w-2 h-0.5 rounded" style={{ backgroundColor: config.color }}></div>
                            <span className="text-text-secondary">
                                {getIndicatorLabel(key)}({config.period})
                            </span>
                        </div>
                    )
                )}
            </div>
        </div>
    );
};

export default FinancialChart;
