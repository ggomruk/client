'use client';

import { 
    useState,
    useEffect,
    createContext,
    useContext, 
} from "react";
import io, { Socket } from "socket.io-client";

interface IServerWebsocketContext {
    socket: Socket | null;
}

const ServerWebsocketContext = createContext<IServerWebsocketContext|undefined>(undefined);

interface ServerWebsocketProviderProps {
    children: React.ReactNode;
}

export const ServerWebsocketProvider : React.FC<ServerWebsocketProviderProps> = ({children}) => {
    const [socket, setSocket] = useState<Socket | null>(null);

    useEffect(() => {
        const _socket = io("http://localhost:5678/ws", { transports: ['websocket'] });

        _socket.on('connect',  () => {
            console.log('Connected to server websocket');
        })

        _socket.on('disconnect', () => {
            console.log('Disconnected from server websocket');
        })

        setSocket(_socket);

        return () => {
            _socket.disconnect();
        }
    }, [])

    return (
        <ServerWebsocketContext.Provider value={{socket}}>
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