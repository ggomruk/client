'use client'
import React, { useEffect } from 'react'
import { useServerWebsocket } from '../_provider/server.websocket'
import Backtest from './Backtest';
import Forward from './Forward';
import History from './History';

const WebsocketComponent = () => {
    // const { socket } = useServerWebsocket();

    useEffect(() => {
        if(!socket) return;

        socket.on('backtest', () => {
            console.log('Backtest event received');
        });

        socket.on('signal', () => {
            console.log('Signal event received');
        });

        socket.on('error', () => {
            console.log('Error event received');
        });

        return () => {
            socket.off('backtest');
            socket.off('signal');
            socket.off('error')
        }
    }, [socket]);

    const sendBacktest = () => {
        if(socket) {
            socket.emit('backtest', {"test":"test"});
        }
    }

    return (
        <div className="h-full mt-6 mb-0 py-3 flex">
            <Backtest />
            <Forward />
            <History />
        </div>
    )
}

export default WebsocketComponent