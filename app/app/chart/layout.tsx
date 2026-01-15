'use client';

import React from 'react';
import { WebsocketProvider } from '../_provider/binance.websocket';

export default function ChartLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <WebsocketProvider>
            {children}
        </WebsocketProvider>
    );
}
