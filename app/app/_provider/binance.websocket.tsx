'use client';
import axios from "axios";
import { createContext, ReactNode, useContext, useEffect, useRef, useState } from "react"
import { IKlineData } from "../_dto/kline";
import { ISymbolData } from "../_dto/symbol";

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
    const [isHistoryDataFetched, setisHistoryDataFetched] = useState(false);
    const websocketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const historyData : IKlineData[] = [];
        const fetchData = async () => {
            // Get initial data
            let startTime = new Date(new Date().getFullYear(), new Date().getMonth(), 7).getTime();
            const endTime = new Date().getTime();
            const interval = "1m";
            
            while(true) {
                const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&startTime=${startTime}&endTime=${endTime}&limit=1500`;
                try {
                    const response = await axios.get(url)
                    const status = response.status; // HTTP Response code
                    if (status === 429 || status === 418) {
                        const weightUsed = response.headers["x-mbx-used-weight"];
                        console.log(`Rate limit exceeded: ${weightUsed}`);
                        await new Promise((resolve) => setTimeout(resolve, 1000));
                        continue;
                    } else {
                        console.log(url)
                        console.log(response.data)
                        const data = response.data;
                        const d = data.map((item: any[]) => ({
                            open: parseFloat(item[1]),
                            high: parseFloat(item[2]),
                            low: parseFloat(item[3]),
                            close: parseFloat(item[4]),
                            time: item[6] / 1000,
                        }))
                        historyData.push(...d);

                        const lastDataCloseTime = d[d.length - 1]['time'];
                        
                        if(lastDataCloseTime < endTime) {
                            startTime = lastDataCloseTime * 1000;
                        } else {
                            break
                        }
                    }
                } catch (error) {
                    console.error("Error fetching data: ", error);
                    break
                }
            }
            setKlineData(historyData);
            setisHistoryDataFetched(true);
        }

        fetchData();
    }, [symbol])

    useEffect(() => {
        if(!isHistoryDataFetched) return;
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

    }, [symbol, isHistoryDataFetched]);

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
