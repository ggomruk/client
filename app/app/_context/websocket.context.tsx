'use client';
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react"

interface IKlineData {
    open: number;
    high: number;
    low: number;
    close: number;
    time: number;
}

interface ISymbolData {
    eventTime: number;
    symbol: string;
    priceChange: number;
    priceChangePercent: number;
    lastPrice: number;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    quantity: number;
}

interface IWebsocketProviderProps {
    children: ReactNode;
}

interface IWebsocketContext {
    klineData: IKlineData[];
    symbolData: ISymbolData | null;
    symbol: string;
    setSymbol: (symbol: string) => void;
}

const WebSocketContext = createContext<IWebsocketContext | undefined>(undefined);

export const WebsocketProvider = ({ children }: IWebsocketProviderProps) => {
    const [klineData, setKlineData] = useState<IKlineData[]>([]);
    const [symbolData, setSymbolData] = useState<ISymbolData | null>(null);
    const [symbol, setSymbol] = useState<string>('BTCUSDT');
    const websocketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        function connectWebsocket(onMessage: (event: MessageEvent) => void) {
            const websocketUrl = `wss://stream.binance.com:9443/ws`;
            const ws = new WebSocket(websocketUrl);

            ws.onopen = () => {
                const subscribe = {
                    method: 'SUBSCRIBE',
                    params: [
                        `${symbol.toLowerCase()}@kline_1m`,
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
                    const newData = [...prevData, d];
                    return newData.length > 100 ? newData.slice(newData.length - 100) : newData;
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
        }

    }, [symbol]);

    return (
        <WebSocketContext.Provider value={{ klineData, symbolData, symbol, setSymbol }}>
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
