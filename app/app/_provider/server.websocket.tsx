'use client';

import { 
    useState,
    useEffect,
    createContext,
    useContext, 
} from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "@/app/contexts/AuthContext";

interface IServerWebsocketContext {
    socket: Socket | null;
    isConnected: boolean;
}

const ServerWebsocketContext = createContext<IServerWebsocketContext|undefined>(undefined);

interface ServerWebsocketProviderProps {
    children: React.ReactNode;
}

export const ServerWebsocketProvider : React.FC<ServerWebsocketProviderProps> = ({children}) => {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        // Only connect if user is authenticated
        if (!isAuthenticated || !user) {
            return;
        }

        const wsUrl = process.env.NEXT_PUBLIC_WS_URL || "http://localhost:5678";
        const _socket = io(`${wsUrl}/ws`, { 
            transports: ['websocket'],
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5
        });

        _socket.on('connect',  () => {
            console.log('✅ Connected to server websocket, Socket ID:', _socket.id);
            setIsConnected(true);
            
            // Subscribe to backtest updates for this user
            console.log('📡 Subscribing to backtest updates for user:', user.userId);
            _socket.emit('backtest:subscribe', { userId: user.userId });
        });

        _socket.on('disconnect', (reason) => {
            console.log('❌ Disconnected from server websocket, reason:', reason);
            setIsConnected(false);
        });

        _socket.on('reconnect', (attemptNumber) => {
            console.log('🔄 Reconnected after', attemptNumber, 'attempts');
            // Re-subscribe after reconnection
            _socket.emit('backtest:subscribe', { userId: user.userId });
        });

        _socket.on('reconnect_attempt', (attemptNumber) => {
            console.log('🔄 Attempting to reconnect...', attemptNumber);
        });

        _socket.on('backtest:subscribed', (data) => {
            console.log('✅ Subscribed to backtest updates:', data);
        });

        _socket.on('error', (error) => {
            console.error('❌ WebSocket error:', error);
        });

        _socket.on('connect_error', (error) => {
            console.error('❌ Connection error:', error.message);
        });

        setSocket(_socket);

        return () => {
            if (user) {
                _socket.emit('backtest:unsubscribe', { userId: user.userId });
            }
            _socket.disconnect();
        }
    }, [isAuthenticated, user, setSocket]);

    return (
        <ServerWebsocketContext.Provider value={{socket, isConnected}}>
            {children}
        </ServerWebsocketContext.Provider>
    )
}

export const useServerWebsocket = (): IServerWebsocketContext => {
    const context = useContext(ServerWebsocketContext);
    if (!context) {
        throw new Error('useServerWebsocket must be used within ServerWebsocketProvider');
    }
    return context;
}