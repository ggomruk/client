'use client';

import React, { useRef, useEffect } from 'react'
import { useWebsocket } from '../_context/websocket.context';
import { createChart, ColorType, LineStyle, CrosshairMode, IChartApi, ISeriesApi, CandlestickData } from "lightweight-charts";

const FinancialChart = () => {
    const { klineData } = useWebsocket();

    const chartContainerRef = useRef<HTMLDivElement|null>(null); // used to store chart DOM element
    const chartRef = useRef<IChartApi|null>(null); // used to store chart instance
    const seriesRef = useRef<ISeriesApi<"Candlestick">|null>(null);

    useEffect(() => {
        if (chartRef.current) return;
    
        // returns IChartAPI instance
        const handleResize = () => {
            chart.applyOptions({ width: chartContainerRef.current?.clientWidth });
        };

        const chart = createChart(chartContainerRef.current!, {
            width: chartContainerRef.current?.clientWidth || 600,
            height: chartContainerRef.current?.clientHeight || 400,
            crosshair: {
                mode: CrosshairMode.Normal,
                vertLine: {
                    width: 8,
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

        chart.timeScale().fitContent();
    
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
        console.log(klineData)
        if (klineData.length > 0) {
            seriesRef.current?.update(klineData[klineData.length - 1] as CandlestickData);
        }
    }, [klineData]);

    return (
        <div className="m-6 mb-0 py-3 border-solid border-gray-500 border-opacity-70 border h-full rounded-xl bg-primary-container-dark">
            <div className="m-6" ref={chartContainerRef} />
        </div>
    )
}

export default FinancialChart