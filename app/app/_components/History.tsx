'use client'
import React, { useState, useEffect } from 'react';

interface BacktestResult {
    id: string;
    symbol: string;
    strategy: string;
    startDate: string;
    endDate: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    profit?: number;
    createdAt: string;
}

const History = () => {
    const [history, setHistory] = useState<BacktestResult[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    // Mock data for demonstration
    useEffect(() => {
        // In production, fetch from API
        // fetchHistory();
    }, []);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'bg-green-500';
            case 'running':
                return 'bg-blue-500';
            case 'pending':
                return 'bg-yellow-500';
            case 'failed':
                return 'bg-red-500';
            default:
                return 'bg-gray-500';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                );
            case 'running':
                return (
                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                );
            case 'failed':
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                );
        }
    };

    return (
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">History</h2>
                <p className="text-purple-200 text-sm mt-1">Backtest results</p>
            </div>
            
            <div className="p-6">
                {history.length > 0 ? (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {history.map((item) => (
                            <div
                                key={item.id}
                                className="bg-gray-700 rounded-lg p-4 border border-gray-600 hover:border-purple-500 transition cursor-pointer"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white font-semibold">{item.symbol}</span>
                                    <div className={`flex items-center gap-2 px-3 py-1 rounded-full ${getStatusColor(item.status)} bg-opacity-20`}>
                                        <span className={`text-xs ${getStatusColor(item.status).replace('bg-', 'text-')}`}>
                                            {getStatusIcon(item.status)}
                                        </span>
                                        <span className="text-xs text-white capitalize">{item.status}</span>
                                    </div>
                                </div>
                                
                                <div className="text-sm text-gray-300 space-y-1">
                                    <div>Strategy: <span className="text-purple-400">{item.strategy}</span></div>
                                    <div className="flex justify-between">
                                        <span>Period: {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}</span>
                                        {item.profit !== undefined && (
                                            <span className={item.profit >= 0 ? 'text-green-400' : 'text-red-400'}>
                                                {item.profit >= 0 ? '+' : ''}{item.profit.toFixed(2)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-12">
                        <svg className="w-16 h-16 text-gray-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-400 text-lg font-medium">No records</p>
                        <p className="text-gray-500 text-sm mt-2">Run a backtest to see results here</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;