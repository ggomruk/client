'use client';

import React, { useMemo, useRef, useEffect, useState } from 'react'
import { createChart, ColorType, LineStyle, CrosshairMode, IChartApi, ISeriesApi, CandlestickData, LineData, UTCTimestamp, HistogramData, MouseEventParams } from "lightweight-charts";
import { useWebsocket } from '../../_provider/binance.websocket';
import { usePanel } from '../../_provider/panel.context';
import { useBacktest } from '../../_provider/backtest.context';

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
    const { showIndicators, setShowIndicators, panelStack, updatePanelStack } = usePanel();
    const { 
        tradeMarkers, 
        isSelectingDate, 
        selectionStart, 
        selectionEnd, 
        toggleSelectionMode, 
        setSelectionRange, 
        setBacktestParams 
    } = useBacktest();

    const chartContainerRef = useRef<HTMLDivElement|null>(null);
    const chartRef = useRef<IChartApi|null>(null);
    const candleSeriesRef = useRef<ISeriesApi<"Candlestick">|null>(null);
    const volumeSeriesRef = useRef<ISeriesApi<"Histogram">|null>(null);
    const selectionSeriesRef = useRef<ISeriesApi<"Histogram">|null>(null);
    const indicatorRefs = useRef<Map<string, ISeriesApi<"Line">>>(new Map());

    const klineDataRef = useRef<any[]>([]);
    useEffect(() => {
        klineDataRef.current = klineData;
    }, [klineData]);

    const lastCandleTimeRef = useRef<number | null>(null);
    const lastIndicatorTimeRef = useRef<Map<string, number | null>>(new Map());

    const previousIntervalRef = useRef<string>(interval);
    
    const [indicators, setIndicators] = useState<IndicatorsState>({
        ema1: { enabled: true, period: 12, color: '#F59E0B' },
        ema2: { enabled: true, period: 26, color: '#8B5CF6' },
        sma1: { enabled: false, period: 50, color: '#10B981' },
        sma2: { enabled: false, period: 200, color: '#EF4444' },
    });

    const previousIndicatorsRef = useRef<IndicatorsState>(indicators);

    const getIntervalSeconds = (tf: string): number => {
        const unit = tf.slice(-1);
        const value = parseInt(tf.slice(0, -1));
        switch (unit) {
            case 'm': return value * 60;
            case 'h': return value * 60 * 60;
            case 'd': return value * 24 * 60 * 60;
            case 'w': return value * 7 * 24 * 60 * 60;
            case 'M': return value * 30 * 24 * 60 * 60;
            default: return 60;
        }
    };

    const normalizeToBarStartSeconds = (tSeconds: number, tf: string): number => {
        const s = getIntervalSeconds(tf);
        if (!Number.isFinite(tSeconds) || tSeconds <= 0 || !Number.isFinite(s) || s <= 0) return tSeconds;
        return Math.floor(tSeconds / s) * s;
    };

    const toUtcTimestamp = (t: unknown): UTCTimestamp => {
        if (typeof t === 'number' && Number.isFinite(t)) {
            // If a ms timestamp slips in, normalize it.
            const maybeMs = t > 4_000_000_000 ? Math.floor(t / 1000) : t;
            return maybeMs as UTCTimestamp;
        }
        if (typeof t === 'string') {
            const parsed = Number(t);
            if (Number.isFinite(parsed)) return toUtcTimestamp(parsed);
        }
        if (t instanceof Date) return Math.floor(t.getTime() / 1000) as UTCTimestamp;
        if (t && typeof t === 'object' && 'time' in (t as any)) {
            return toUtcTimestamp((t as any).time);
        }
        return 0 as UTCTimestamp; // Return a safe fallback or handle it upstream
    };

    const volumeByTimeRef = useRef<Map<number, number>>(new Map());

    const normalizeCandles = (raw: any[]): CandlestickData[] => {
        const byTime = new Map<number, CandlestickData>();
        const vol = new Map<number, number>();

        for (const item of raw) {
            const t = toUtcTimestamp(item.time) as unknown as number;
            if (!Number.isFinite(t) || t <= 0) continue;

            byTime.set(t, {
                time: t as unknown as UTCTimestamp,
                open: Number(item.open),
                high: Number(item.high),
                low: Number(item.low),
                close: Number(item.close),
            });

            const v = (item as any).volume ?? (item as any).qty ?? (item as any).q ?? undefined;
            if (v != null && Number.isFinite(Number(v))) vol.set(t, Number(v));
        }

        volumeByTimeRef.current = vol;

        const sorted = Array.from(byTime.entries())
            .sort((a, b) => a[0] - b[0])
            .map(([, v]) => v);

        // Debug log only if actual duplicates were removed
        if (sorted.length < raw.length) {
            console.log(`[normalizeCandles] Deduped ${raw.length} → ${sorted.length} (removed ${raw.length - sorted.length} duplicates)`);
        }

        return sorted;
    };
    const resizeObserverRef = useRef<ResizeObserver|null>(null);
    const isLoadingMoreRef = useRef<boolean>(false);
    const isInitialLoadRef = useRef<boolean>(true);
    const previousDataLengthRef = useRef<number>(0);
    const previousSymbolRef = useRef<string>(symbol);
    const lastUpdateTimeRef = useRef<number>(0);

    // TradingView-like behavior: follow latest only when user is at the right edge.
    const shouldFollowLatestRef = useRef<boolean>(true);
    const userForcedFollowRef = useRef<boolean>(true);
    const lastLogicalRangeRef = useRef<any>(null);

    const [isFollowingLatest, setIsFollowingLatest] = useState(true);

    // OHLCV display (crosshair hover)
    const [hoverOhlcv, setHoverOhlcv] = useState<{
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume?: number;
    } | null>(null);

    const [lastOhlcv, setLastOhlcv] = useState<{
        time: number;
        open: number;
        high: number;
        low: number;
        close: number;
        volume?: number;
    } | null>(null);
    
    // Cursor position for tooltip
    const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);
    
    // volumeByTimeRef is maintained by normalizeCandles() so it always matches the candle timeline.

    // Calculate vertical offset based on panel stack for Indicators
    const getIndicatorsTopOffset = () => {
        return 'top-4'; // 64px from chart top
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
                autoScale: true, // TradingView-like auto mode: auto-fit price range
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

        const volumeSeries = chart.addHistogramSeries({
            color: '#26a69a',
            priceFormat: {
                type: 'volume',
            },
            priceScaleId: 'volume', 
        });

        chart.priceScale('volume').applyOptions({
            scaleMargins: {
                top: 0.8, // Place it at the bottom
                bottom: 0,
            },
        });

        // Selection Overlay Series
        const selectionSeries = chart.addHistogramSeries({
            color: 'rgba(99, 102, 241, 0.4)', // Indigo-500 with opacity
            priceScaleId: 'selection_overlay',
            priceFormat: { type: 'custom', formatter: () => '' },
        });
        
        chart.priceScale('selection_overlay').applyOptions({
            scaleMargins: { top: 0, bottom: 0 },
            visible: false,
        });

        chartRef.current = chart;
        candleSeriesRef.current = candlestickSeries;
        volumeSeriesRef.current = volumeSeries;
        selectionSeriesRef.current = selectionSeries;

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
                    const atRightEdge = barsInfo.barsAfter <= 2;

                    if (userForcedFollowRef.current) {
                        // If user clicked Live, follow until they pan away.
                        if (!atRightEdge) {
                            userForcedFollowRef.current = false;
                            shouldFollowLatestRef.current = false;
                            setIsFollowingLatest(false);
                        } else {
                            shouldFollowLatestRef.current = true;
                            setIsFollowingLatest(true);
                        }
                    } else {
                        // Default behavior: only follow when actually at the right edge.
                        shouldFollowLatestRef.current = atRightEdge;
                        setIsFollowingLatest(atRightEdge);
                    }
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

    // Crosshair OHLCV tooltip
    useEffect(() => {
        if (!chartRef.current || !candleSeriesRef.current) return;

        const chart = chartRef.current;
        const candleSeries = candleSeriesRef.current;

        const handleCrosshairMove = (param: any) => {
            if (!param || param.time == null) {
                setHoverOhlcv(null);
                setCursorPosition(null);
                return;
            }

            const t = toUtcTimestamp(param.time) as unknown as number;
            const seriesData = param.seriesData?.get?.(candleSeries);
            if (!seriesData) {
                setHoverOhlcv(null);
                setCursorPosition(null);
                return;
            }

            // Candlestick data should have o/h/l/c
            const open = (seriesData as any).open;
            const high = (seriesData as any).high;
            const low = (seriesData as any).low;
            const close = (seriesData as any).close;
            if (![open, high, low, close].every((x) => typeof x === 'number' && Number.isFinite(x))) {
                setHoverOhlcv(null);
                setCursorPosition(null);
                return;
            }

            // Get cursor position from the point parameter
            if (param.point) {
                setCursorPosition({ x: param.point.x, y: param.point.y });
            }

            setHoverOhlcv({
                time: t,
                open,
                high,
                low,
                close,
                volume: volumeByTimeRef.current.get(t),
            });
        };

        chart.subscribeCrosshairMove(handleCrosshairMove);
        return () => {
            chart.unsubscribeCrosshairMove(handleCrosshairMove);
        };
    }, []);

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
            // Detect symbol/interval change
            const symbolChanged = previousSymbolRef.current !== symbol;
            if (symbolChanged) {
                isInitialLoadRef.current = true;
                previousSymbolRef.current = symbol;
                lastUpdateTimeRef.current = 0;
            }

            const intervalChanged = previousIntervalRef.current !== interval;
            if (intervalChanged) {
                // Hard reset: avoid mixing different bar sizes (e.g. 1D -> 4H)
                // and avoid stray websocket messages arriving during the switch.
                isInitialLoadRef.current = true;
                previousIntervalRef.current = interval;
                previousDataLengthRef.current = 0;
                lastUpdateTimeRef.current = 0;
                lastCandleTimeRef.current = null;
                lastIndicatorTimeRef.current.clear();

                shouldFollowLatestRef.current = true;
                userForcedFollowRef.current = true;
                setTimeout(() => setIsFollowingLatest(true), 0);

                // Clear the series so the next setData paints a clean timeline.
                candleSeriesRef.current.setData([]);
                volumeSeriesRef.current?.setData([]);
                indicatorRefs.current.forEach((s) => {
                    try { s.setData([]); } catch { /* ignore */ }
                });
            }
            
            const currentDataLength = klineData.length;
            const lastCandle = klineData[klineData.length - 1];
            const lastCandleTime = normalizeToBarStartSeconds(toUtcTimestamp(lastCandle.time) as unknown as number, interval);
            
            // Determine what kind of update this is
            const isInitialLoad = isInitialLoadRef.current;
            const dataLengthChanged = currentDataLength !== previousDataLengthRef.current;
            const isHistoricalDataLoad = dataLengthChanged && currentDataLength > previousDataLengthRef.current + 1;
            const isNewCandle = lastCandleTime !== lastUpdateTimeRef.current;
            const indicatorsChanged = previousIndicatorsRef.current !== indicators;
            previousIndicatorsRef.current = indicators;
            
            // Format + normalize all data (time in seconds, sorted)
            const formattedData = normalizeCandles(klineData);
            
            // Format volume data
            const volumeData: HistogramData[] = formattedData.map(item => ({
                time: item.time,
                value: volumeByTimeRef.current.get(item.time as unknown as number) || 0,
                color: item.close >= item.open ? '#26a69a' : '#ef5350',
            }));
            
            // Decide between setData() and update()
            if (isInitialLoad || symbolChanged || intervalChanged || isHistoricalDataLoad) {
                // Use setData for: initial load, symbol change, or historical data prepend
                candleSeriesRef.current.setData(formattedData);
                volumeSeriesRef.current?.setData(volumeData);

                // Reset last-time tracking because setData() can contain older points.
                lastCandleTimeRef.current = formattedData.length
                    ? (formattedData[formattedData.length - 1].time as unknown as number)
                    : null;
                
                if (isInitialLoad) {
                    isInitialLoadRef.current = false;
                    // Auto-fit time and price on initial load (TradingView-like)
                    if (chartRef.current && candleSeriesRef.current) {
                        chartRef.current.timeScale().fitContent();
                        candleSeriesRef.current.priceScale().applyOptions({ autoScale: true });
                    }
                }

                // TradingView-like: after switching timeframe and painting a new dataset, fit content.
                if (intervalChanged && chartRef.current && candleSeriesRef.current) {
                    // Small delay to ensure series is painted before fitting
                    setTimeout(() => {
                        if (chartRef.current && candleSeriesRef.current) {
                            // Fit both time axis and price axis
                            chartRef.current.timeScale().fitContent();
                            candleSeriesRef.current.priceScale().applyOptions({ autoScale: true });
                            console.log('[Chart] Auto-fitted time + price after interval change to:', interval);
                        }
                    }, 50);
                }
                // For historical data load, don't call fitContent - preserve scroll
            } else {
                // Use update() for real-time updates (same candle or new candle)
                const lastFormattedCandle = formattedData[formattedData.length - 1];
                if (lastFormattedCandle) {
                    const nextTime = lastFormattedCandle.time as unknown as number;
                    const prevTime = lastCandleTimeRef.current;

                    // Contract:
                    // - If nextTime === prevTime -> update the current (forming) candle in place
                    // - If nextTime > prevTime -> append a new candle
                    // - If nextTime < prevTime -> fallback to setData to resync
                    // Note: update() requires monotonically non-decreasing time *and* consistent time type.
                    if (prevTime == null || nextTime === prevTime || nextTime > prevTime) {
                        const safeTime = toUtcTimestamp(nextTime);
                        candleSeriesRef.current.update({
                            ...lastFormattedCandle,
                            time: safeTime,
                        } as any);

                        volumeSeriesRef.current?.update({
                            time: safeTime,
                            value: volumeByTimeRef.current.get(nextTime) || 0,
                            color: lastFormattedCandle.close >= lastFormattedCandle.open ? '#26a69a' : '#ef5350',
                        });

                        lastCandleTimeRef.current = nextTime;
                    } else {
                        // Skip older updates. They can arrive due to races between REST and websocket.
                        // A subsequent full setData (history load) will resync.
                    }
                }

                // Only auto-follow the latest candle if user EXPLICITLY wants follow (not just being near edge).
                // This prevents unwanted yanking when you pan right to explore recent data.
                if (chartRef.current && userForcedFollowRef.current) {
                    chartRef.current.timeScale().scrollToRealTime();
                }
            }
            
            // Update tracking refs
            previousDataLengthRef.current = currentDataLength;
            // Track last bar time in seconds (normalized). This is used for “new candle” detection.
            lastUpdateTimeRef.current = lastCandleTime;

            // Maintain last bar OHLCV for overlay (when not hovering)
            if (formattedData.length) {
                const lastBar: any = formattedData[formattedData.length - 1];
                const t = lastBar.time as unknown as number;
                setLastOhlcv({
                    time: t,
                    open: lastBar.open,
                    high: lastBar.high,
                    low: lastBar.low,
                    close: lastBar.close,
                    volume: volumeByTimeRef.current.get(t),
                });
            }
            
            // Calculate and update indicator data
            // IMPORTANT: Use formattedData (normalized/deduped) not raw klineData to avoid duplicate times
            Object.entries(indicators).forEach(([key, config]) => {
                if (config.enabled) {
                    const series = indicatorRefs.current.get(key);
                    if (series) {
                        let data: LineData[] = [];
                        
                        if (key.startsWith('ema')) {
                            data = calculateEMA(formattedData, config.period);
                        } else if (key.startsWith('sma')) {
                            data = calculateSMA(formattedData, config.period);
                        }
                        
                        if (data.length > 0) {
                            // Use same logic as candles: setData for full updates, update for incremental
                            if (isInitialLoad || symbolChanged || intervalChanged || isHistoricalDataLoad || indicatorsChanged) {
                                // Data is already normalized from formattedData, just need to dedupe by time
                                const byTime = new Map<number, LineData>();
                                for (const p of data) {
                                    const t = toUtcTimestamp(p.time) as unknown as number;
                                    byTime.set(t, { ...p, time: t as unknown as UTCTimestamp });
                                }
                                const normalized = Array.from(byTime.entries())
                                    .sort((a, b) => a[0] - b[0])
                                    .map(([, v]) => v);
                                
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
                                        // Skip older updates (same as candles)
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
    }, [klineData, indicators, symbol, interval]);

    // Selection Mode - Click Handler
    useEffect(() => {
        if (!chartRef.current) return;
        
        const handleChartClick = (param: MouseEventParams) => {
            if (!isSelectingDate || !param.time) return;
            
            const time = param.time as number;
            
            if (selectionStart === null) {
                // First click: Set Start
                setSelectionRange(time, null);
            } else if (selectionEnd === null) {
                // Second click: Set End and Finish
                // Ensure start < end
                let start = selectionStart;
                let end = time;
                if (start > end) {
                    [start, end] = [end, start];
                }
                
                setSelectionRange(start, end);
                
                // Update Backtest Params
                const startDate = new Date(start * 1000).toISOString().split('T')[0];
                const endDate = new Date(end * 1000).toISOString().split('T')[0];
                
                setBacktestParams(prev => ({
                    ...prev,
                    startDate,
                    endDate
                }));
                
                // Exit Selection Mode
                toggleSelectionMode();
            }
        };
        
        chartRef.current.subscribeClick(handleChartClick);
        
        return () => {
             // Only unsubscribe if chart instance still exists
            if (chartRef.current) {
                try {
                    chartRef.current.unsubscribeClick(handleChartClick);
                } catch(e) {
                    // Ignore if chart is destroyed
                }
            }
        };
    }, [isSelectingDate, selectionStart, selectionEnd, setSelectionRange, toggleSelectionMode, setBacktestParams]);

    // Selection Mode - Hover/Drag Handler (Shading)
    useEffect(() => {
        if (!chartRef.current || !selectionSeriesRef.current) return;

        let animationFrameId: number;
        let lastProcessedTime: number | null = null;

        const handleSelectionMove = (param: MouseEventParams) => {
            if (!isSelectingDate || !selectionStart || !param.time) {
                 return;
            }
            
            const current = param.time as number;
            
            // Optimization: Break the recursion cycle and debounce
            // If the time hasn't changed, we don't need to update the chart again
            if (current === lastProcessedTime) return;
            lastProcessedTime = current;
            
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            
            animationFrameId = requestAnimationFrame(() => {
                if (!selectionSeriesRef.current) return;

                const start = Math.min(selectionStart, current);
                const end = Math.max(selectionStart, current);
                
                const rawData = klineDataRef.current;
                const histogramData: HistogramData[] = [];
                
                // Iterate to find candles in range
                for (let i = 0; i < rawData.length; i++) {
                    const item = rawData[i];
                    // Hand-inlined timestamp conversion to avoid dependency issues
                    let t: number = 0;
                    if (typeof item.time === 'number') {
                        t = item.time > 4_000_000_000 ? Math.floor(item.time / 1000) : item.time;
                    } else if (typeof item.time === 'string') {
                        const parsed = Number(item.time);
                        if (Number.isFinite(parsed)) t = parsed > 4_000_000_000 ? Math.floor(parsed / 1000) : parsed;
                        else t = Math.floor(new Date(item.time).getTime() / 1000);
                    } else {
                        t = Math.floor(new Date(item.time).getTime() / 1000);
                    }

                    if (t >= start && t <= end) {
                        histogramData.push({
                            time: t as UTCTimestamp,
                            value: 1, 
                            color: 'rgba(99, 102, 241, 0.3)' 
                        });
                    }
                }
                
                selectionSeriesRef.current.setData(histogramData);
            });
        };

        if (isSelectingDate && selectionStart) {
            chartRef.current.subscribeCrosshairMove(handleSelectionMove);
        } else {
            // Clear visualization when not selecting or just starting
            selectionSeriesRef.current.setData([]);
        }

        return () => {
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
            if (chartRef.current) {
               try {
                   chartRef.current.unsubscribeCrosshairMove(handleSelectionMove);
               } catch(e) {}
            }
        };
    }, [isSelectingDate, selectionStart]);

    // Update all markers (Trade + Selection)
    useEffect(() => {
        if (!candleSeriesRef.current) return;
        
        let allMarkers: any[] = [];
        
        // Add Trade Markers
        if (tradeMarkers.length > 0) {
            allMarkers = tradeMarkers.map(m => ({
                time: m.time as UTCTimestamp,
                position: m.position,
                color: m.color,
                shape: m.shape,
                text: m.text,
                size: m.size,
            }));
        }

        // Add Selection Markers
        if (isSelectingDate || selectionStart || selectionEnd) {
             if (selectionStart) {
                allMarkers.push({
                    time: selectionStart as UTCTimestamp,
                    position: 'aboveBar',
                    color: '#6366F1', // Indigo-500
                    shape: 'arrowDown',
                    text: 'Start',
                    size: 2
                });
            }
            if (selectionEnd) {
                allMarkers.push({
                    time: selectionEnd as UTCTimestamp,
                    position: 'aboveBar',
                    color: '#6366F1', // Indigo-500
                    shape: 'arrowDown',
                    text: 'End',
                    size: 2
                });
            }
        }
        
        // Sort and Set
        if (allMarkers.length > 0) {
            allMarkers.sort((a, b) => (a.time as number) - (b.time as number));
            candleSeriesRef.current.setMarkers(allMarkers);
        } else {
             candleSeriesRef.current.setMarkers([]);
        }

    }, [tradeMarkers, isSelectingDate, selectionStart, selectionEnd]);

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
                                userForcedFollowRef.current = true;
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

                {/* Floating OHLCV Tooltip (follows cursor when hovering) */}
                {hoverOhlcv && cursorPosition && (
                    <div
                        className="absolute px-3 py-2 rounded-lg text-xs font-medium tabular-nums pointer-events-none shadow-xl"
                        style={{
                            left: `${cursorPosition.x + 15}px`,
                            top: `${cursorPosition.y + 15}px`,
                            background: 'rgba(24,24,27,0.95)',
                            color: 'var(--text-primary)',
                            border: '1px solid rgba(63,63,70,0.9)',
                            backdropFilter: 'blur(8px)',
                            WebkitBackdropFilter: 'blur(8px)',
                            zIndex: 100,
                            minWidth: '200px',
                        }}
                    >
                        {(() => {
                            const d = hoverOhlcv;
                            const dt = new Date(d.time * 1000);
                            const dateStr = `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
                            const timeStr = `${String(dt.getUTCHours()).padStart(2, '0')}:${String(dt.getUTCMinutes()).padStart(2, '0')}`;
                            const fmt = (n: number) => (Number.isFinite(n) ? n.toFixed(2) : '-');
                            const v = d.volume != null ? d.volume.toFixed(2) : '-';
                            
                            return (
                                <div className="flex flex-col gap-1">
                                    <div className="text-[10px] text-gray-400 border-b border-gray-700 pb-1 mb-1">
                                        {dateStr} {timeStr}
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-400">Open:</span>
                                        <span className="text-green-400">{fmt(d.open)}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-400">High:</span>
                                        <span className="text-green-400">{fmt(d.high)}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-400">Low:</span>
                                        <span className="text-red-400">{fmt(d.low)}</span>
                                    </div>
                                    <div className="flex justify-between gap-4">
                                        <span className="text-gray-400">Close:</span>
                                        <span className={d.close >= d.open ? 'text-green-400' : 'text-red-400'}>{fmt(d.close)}</span>
                                    </div>
                                    <div className="flex justify-between gap-4 border-t border-gray-700 pt-1 mt-1">
                                        <span className="text-gray-400">Volume:</span>
                                        <span className="text-blue-400">{v}</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>
                )}
                
                {/* Floating Indicators Panel */}
                {showIndicators && (
                    <div 
                        className={`absolute ${getIndicatorsTopOffset()} left-4 md:left-6 bg-[#18181b] border border-[#3f3f46] rounded-xl shadow-2xl p-4 md:p-6 w-[calc(100vw-2rem)] md:w-[512px]`}
                        style={{ 
                            zIndex: getIndicatorsZIndex(),
                            maxHeight: 'calc(100vh - 400px)',
                            overflowY: 'auto'
                        }}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
