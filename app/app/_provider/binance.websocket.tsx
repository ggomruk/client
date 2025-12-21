'use client';
import axiosInstance from "../_api/axios";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react"
import { IKlineData } from "../_dto/kline";
import { ISymbolData } from "../_dto/symbol";

// Helper function to convert interval to seconds
const getIntervalSeconds = (interval: string): number => {
    const unit = interval.slice(-1);
    const value = parseInt(interval.slice(0, -1));
    
    switch (unit) {
        case 'm': return value * 60;
        case 'h': return value * 60 * 60;
        case 'd': return value * 24 * 60 * 60;
        case 'w': return value * 7 * 24 * 60 * 60;
        case 'M': return value * 30 * 24 * 60 * 60; // Approximate
        default: return 60; // Default to 1 minute
    }
};

interface IWebsocketProviderProps {
    children: ReactNode;
}

interface IWebsocketContext {
    klineData: IKlineData[];
    symbolData: ISymbolData | null;
    symbol: string;
    setSymbol: (symbol: string) => void;
    interval: string;
    setInterval: (interval: string) => void;
    loadMoreData: () => Promise<boolean>; // Returns true if more data was loaded
    isLoadingMore: boolean;
}

const WebSocketContext = createContext<IWebsocketContext | undefined>(undefined);

export const WebsocketProvider = ({ children }: IWebsocketProviderProps) => {
    const [klineData, setKlineData] = useState<IKlineData[]>([]);
    const [symbolData, setSymbolData] = useState<ISymbolData | null>(null);
    const [symbol, setSymbol] = useState<string>('BTCUSDT');
    const [interval, setInterval] = useState<string>('1d');
    const [isHistoryDataFetched, setisHistoryDataFetched] = useState(false);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const websocketRef = useRef<WebSocket | null>(null);
    const oldestTimestampRef = useRef<number | null>(null);

    // Function to load more historical data
    const loadMoreData = async (): Promise<boolean> => {
        if (isLoadingMore || !oldestTimestampRef.current) return false;

        setIsLoadingMore(true);
        try {
            // Calculate interval duration in seconds
            const intervalSeconds = getIntervalSeconds(interval);
            // Calculate endTime (one interval before our oldest data)
            const endTime = oldestTimestampRef.current - intervalSeconds;
            
            const response = await axiosInstance.get('/market/klines', {
                params: {
                    symbol,
                    interval,
                    limit: 1000, // Fetch 1000 more candles
                    endTime: endTime * 1000 // Convert to milliseconds
                }
            });

            const olderData: IKlineData[] = response.data;
            
            if (olderData.length > 0) {
                // Prepend older data to existing data
                setKlineData(prev => [...olderData, ...prev]);
                // Update oldest timestamp
                oldestTimestampRef.current = olderData[0].time;
                setIsLoadingMore(false);
                return true;
            }
            
            setIsLoadingMore(false);
            return false;
        } catch (error) {
            console.error("Error loading more historical data:", error);
            setIsLoadingMore(false);
            return false;
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Fetch initial 24hr ticker data immediately
                const tickerResponse = await axiosInstance.get('/market/ticker', {
                    params: { symbol }
                });
                
                if (tickerResponse.data) {
                    setSymbolData({
                        eventTime: Date.now(),
                        symbol: tickerResponse.data.symbol,
                        priceChange: parseFloat(tickerResponse.data.priceChange),
                        priceChangePercent: parseFloat(tickerResponse.data.priceChangePercent),
                        lastPrice: parseFloat(tickerResponse.data.lastPrice),
                        openPrice: parseFloat(tickerResponse.data.openPrice),
                        highPrice: parseFloat(tickerResponse.data.highPrice),
                        lowPrice: parseFloat(tickerResponse.data.lowPrice),
                        quantity: parseFloat(tickerResponse.data.volume),
                    });
                }
                
                // Fetch from YOUR API server, not Binance directly
                const response = await axiosInstance.get('/market/klines', {
                    params: {
                        symbol,
                        interval,
                        limit: 1000 // Fetch 1000 candles initially
                    }
                });
                
                const data: IKlineData[] = response.data;
                setKlineData(data);
                
                // Track the oldest timestamp for lazy loading
                if (data.length > 0) {
                    oldestTimestampRef.current = data[0].time;
                }
                
                setisHistoryDataFetched(true);
            } catch (error) {
                console.error("Error fetching historical data:", error);
                // Fallback: show empty chart
                setKlineData([]);
                setisHistoryDataFetched(true);
            }
        }

        fetchData();
    }, [symbol, interval])

    useEffect(() => {
        if(!isHistoryDataFetched) return;
        function connectWebsocket(onMessage: (event: MessageEvent) => void) {
            const websocketUrl = `wss://stream.binance.com:9443/ws`;
            const ws = new WebSocket(websocketUrl);

            ws.onopen = () => {
                const subscribe = {
                    method: 'SUBSCRIBE',
                    params: [
                        `${symbol.toLowerCase()}@kline_${interval}`,
                        `${symbol.toLowerCase()}@ticker`
                    ],
                    id: 1
                };
                console.log("[onOpen] Subscribed to: ", subscribe);
                ws.send(JSON.stringify(subscribe));
            };

            ws.onmessage = onMessage;

            ws.onerror = (error) => {
                console.log("[onError] Error: " + error);
            };

            ws.onclose = (event) => {
                console.log("[onClose] WebSocket connection closed: ", event.reason);
                // Do not reconnect immediately in onclose; handle reconnection externally if needed
            };

            return ws;
        }

        // create websocket connection
        websocketRef.current = connectWebsocket((event: MessageEvent) => {
            const data = JSON.parse(event.data);
            if (data.e === "kline") {
                const d = {
                    open: parseFloat(data.k.o),
                    high: parseFloat(data.k.h),
                    low: parseFloat(data.k.l),
                    close: parseFloat(data.k.c),
                    time: data.k.T / 1000,
                };
                setKlineData((prevData) => {
                    // check if the last data in prevData has the same time as the time of new data
                    if (prevData.length && prevData[prevData.length - 1].time === d.time) {
                        // replace the last data with the new data using spread operator 
                        // Get all data except the last data
                        const oldData = prevData.slice(0, prevData.length - 1);
                        const newData = [...oldData, d];
                        return newData;
                    }
                    return [...prevData, d];
                });
            } else if (data.e === "24hrTicker") {
                setSymbolData({
                    eventTime: data.E,
                    symbol: data.s,
                    priceChange: parseFloat(data.p),
                    priceChangePercent: parseFloat(data.P),
                    lastPrice: parseFloat(data.c),
                    openPrice: parseFloat(data.o),
                    highPrice: parseFloat(data.h),
                    lowPrice: parseFloat(data.l),
                    quantity: parseFloat(data.q),
                });
            } else {
                console.log("[websocket] Received unknown message: ", data);
            }
        });

        return () => {
            websocketRef.current?.close();
            websocketRef.current = null;
            setKlineData([]);
            setSymbolData(null);
            setisHistoryDataFetched(false);
        }

    }, [symbol, interval, isHistoryDataFetched]);

    return (
        <WebSocketContext.Provider value={{ klineData, symbolData, symbol, setSymbol, interval, setInterval, loadMoreData, isLoadingMore }}>
            {children}
        </WebSocketContext.Provider>
    );
}

export const useWebsocket = (): IWebsocketContext => {
    const context = useContext(WebSocketContext);
    if (context === undefined) {
        throw new Error('useWebsocket must be used within a WebSocketProvider');
    }
    return context;
}
