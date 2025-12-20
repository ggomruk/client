'use client';

import React, { useRef, useEffect, useState } from 'react'
import { createChart, ColorType, LineStyle, CrosshairMode, IChartApi, ISeriesApi, CandlestickData, LineData } from "lightweight-charts";
import { useWebsocket } from '../_provider/binance.websocket';

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
    const { klineData, loadMoreData, isLoadingMore, symbol } = useWebsocket();

    const chartContainerRef = useRef<HTMLDivElement|null>(null);
    const chartRef = useRef<IChartApi|null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick">|null>(null);
    const indicatorRefs = useRef<Map<string, ISeriesApi<"Line">>>(new Map());
    const resizeObserverRef = useRef<ResizeObserver|null>(null);
    const isLoadingMoreRef = useRef<boolean>(false);
    const isInitialLoadRef = useRef<boolean>(true);
    const previousDataLengthRef = useRef<number>(0);
    const previousSymbolRef = useRef<string>(symbol);
    
    const [showSettings, setShowSettings] = useState(false);
    const [indicators, setIndicators] = useState<IndicatorsState>({
        ema1: { enabled: true, period: 12, color: '#F59E0B' },
        ema2: { enabled: true, period: 26, color: '#8B5CF6' },
        sma1: { enabled: false, period: 50, color: '#10B981' },
        sma2: { enabled: false, period: 200, color: '#EF4444' },
    });

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

    // Setup lazy loading for historical data
    useEffect(() => {
        if (!chartRef.current) return;

        const chart = chartRef.current;
        
        const handleVisibleLogicalRangeChange = async (logicalRange: any) => {
            if (!logicalRange || isLoadingMoreRef.current || isLoadingMore) return;

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
            }
            
            // Set candlestick data
            const formattedData = klineData.map((item: any) => ({
                time: item.time,
                open: item.open,
                high: item.high,
                low: item.low,
                close: item.close,
            })) as CandlestickData[];
            
            // Only use setData + fitContent on initial load or symbol change
            // Otherwise, preserve the user's scroll position
            if (isInitialLoadRef.current) {
                candleSeriesRef.current.setData(formattedData);
                isInitialLoadRef.current = false;
                
                // Only auto-fit on initial load or symbol change
                if (chartRef.current) {
                    chartRef.current.timeScale().fitContent();
                }
            } else {
                // For updates (new candles or lazy-loaded data), use setData but preserve position
                // We still need setData for lazy-loaded data to prepend old candles
                candleSeriesRef.current.setData(formattedData);
                // Note: We DON'T call fitContent() to preserve scroll
            }
            
            previousDataLengthRef.current = klineData.length;
            
            // Calculate and set indicator data
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
                            series.setData(data);
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
                <div className="flex items-center gap-2">
                    <h3 className="text-sm font-semibold text-text-primary">Chart</h3>
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-md" style={{background: 'var(--primary-200)'}}>
                        <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse"></div>
                        <span className="text-xs text-muted">Live</span>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {/* Indicators Button */}
                    <button
                        onClick={() => setShowSettings(!showSettings)}
                        className={`px-2.5 py-1 text-xs font-medium rounded transition-all ${
                            showSettings
                                ? 'bg-primary-400 text-white'
                                : 'bg-primary-200 text-muted hover:text-white hover:bg-primary-300'
                        }`}
                    >
                        Indicators
                    </button>
                </div>
            </div>

            {/* Settings Panel */}
            {showSettings && (
                <div className="p-4 border-b" style={{borderColor: 'var(--primary-300)', background: 'var(--primary-200)'}}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(indicators).map(([key, config]) => (
                            <div key={key} className="card space-y-3">
                                <div className="flex items-center justify-between">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={config.enabled}
                                            onChange={(e) => updateIndicator(key as keyof IndicatorsState, 'enabled', e.target.checked)}
                                            className="w-4 h-4 rounded"
                                        />
                                        <span className="text-sm font-medium text-white">
                                            {getIndicatorLabel(key)}({config.period})
                                        </span>
                                    </label>
                                    <input
                                        type="color"
                                        value={config.color}
                                        onChange={(e) => updateIndicator(key as keyof IndicatorsState, 'color', e.target.value)}
                                        className="w-8 h-8 rounded cursor-pointer border"
                                        style={{borderColor: 'var(--primary-300)'}}
                                        disabled={!config.enabled}
                                    />
                                </div>
                                
                                <div className="flex items-center gap-2">
                                    <label className="text-xs text-muted min-w-[60px]">Period:</label>
                                    <input
                                        type="range"
                                        min="5"
                                        max="200"
                                        step="1"
                                        value={config.period}
                                        onChange={(e) => updateIndicator(key as keyof IndicatorsState, 'period', parseInt(e.target.value))}
                                        disabled={!config.enabled}
                                        className="flex-1 h-2 rounded-lg appearance-none cursor-pointer"
                                        style={{background: 'var(--primary-300)'}}
                                    />
                                    <input
                                        type="number"
                                        min="5"
                                        max="200"
                                        value={config.period}
                                        onChange={(e) => updateIndicator(key as keyof IndicatorsState, 'period', parseInt(e.target.value))}
                                        disabled={!config.enabled}
                                        className="w-16 px-2 py-1 text-xs rounded"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Chart - Full remaining height */}
            <div className="flex-1 w-full relative">
                <div ref={chartContainerRef} className="w-full h-full" />
                
                {/* Loading Indicator */}
                {isLoadingMore && (
                    <div className="absolute top-4 left-4 px-3 py-1.5 rounded-lg flex items-center gap-2 shadow-lg" style={{background: 'var(--primary-200)'}}>
                        <div className="w-3 h-3 border-2 border-primary-400 border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-xs text-muted">Loading more data...</span>
                    </div>
                )}
            </div>
            
            {/* Compact Legend */}
            <div className="px-3 py-1.5 border-t flex items-center gap-3 flex-wrap text-xs" style={{borderColor: 'var(--primary-300)'}}>
                {Object.entries(indicators).map(([key, config]) => 
                    config.enabled && (
                        <div key={key} className="flex items-center gap-1.5">
                            <div className="w-2 h-0.5 rounded" style={{ backgroundColor: config.color }}></div>
                            <span className="text-muted">
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
