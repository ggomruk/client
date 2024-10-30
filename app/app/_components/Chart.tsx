'use client';

import React, { useRef, useEffect } from 'react'
import { useWebsocket } from '../_provider/binance.websocket';
import { createChart, ColorType, LineStyle, CrosshairMode, IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";

const FinancialChart = () => {
    const { klineData } = useWebsocket();

    const chartContainerRef = useRef<HTMLDivElement|null>(null); // used to store chart DOM element
    const chartRef = useRef<IChartApi|null>(null); // used to store chart instance
    const seriesRef = useRef<ISeriesApi<"Candlestick">|null>(null);

    useEffect(() => {
        if (chartRef.current) return;
    
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        };

        const chart = createChart(chartContainerRef.current!, {
            width: chartContainerRef.current?.clientWidth,
            height: chartContainerRef.current?.clientHeight,

            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 4,
                    color: '#C3BCDB44',
                    style: LineStyle.Solid,
                    labelBackgroundColor: '#9B7DFF',
                },
                horzLine: {
                    color: '#9B7DFF',
                    labelBackgroundColor: '#9B7DFF',
                },
            },
            layout: {
                background: { type: ColorType.Solid, color: '#222' },
                textColor: '#DDD',
                
            },
            grid: {
                vertLines: { color: '#444' },
                horzLines: { color: '#444' },
            },
        });
        
        const newSeries = chart.addCandlestickSeries({
            upColor: '#26a69a', 
            downColor: '#ef5350', 
            borderVisible: false, 
            wickUpColor: '#26a69a', 
            wickDownColor: '#ef5350' 
        });
        newSeries.setData(klineData as CandlestickData[]);

        window.addEventListener('resize', handleResize);
    
        seriesRef.current = newSeries;
    }, [])

    useEffect(() => {
        if (klineData.length > 0) {
            // seriesRef.current?.update(klineData[klineData.length - 1] as CandlestickData);
            seriesRef.current?.setData(klineData as CandlestickData[]);
        }
    }, [klineData]);

    return (
        <div className="mt-6 mb-0 py-3 border-solid border-gray-500 border-opacity-70 border rounded-xl w-full bg-primary-container-dark">
            <div className="m-6 h-96" ref={chartContainerRef} />
        </div>
    )
}

export default FinancialChart