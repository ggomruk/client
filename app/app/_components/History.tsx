'use client';

import React, { useState, useEffect } from 'react';
import { useBacktest } from '../_contexts/BacktestContext';

const History = () => {
    const { backtests, loading, refreshBacktests } = useBacktest();
    const [filter, setFilter] = useState<'all' | 'completed' | 'processing' | 'error'>('all');

    useEffect(() => {
        refreshBacktests();
    }, [refreshBacktests]);

    const backtestList = Array.from(backtests.values())
        .filter(bt => {
            if (filter === 'all') return true;
            return bt.status === filter;
        })
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-success';
            case 'processing': return 'bg-info';
            case 'pending': return 'bg-warning';
            case 'error': return 'bg-error';
            default: return 'bg-primary-300';
        }
    };

    const formatPercentage = (value?: number) => {
        if (value === undefined) return 'N/A';
        return `${value > 0 ? '+' : ''}${value.toFixed(2)}%`;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);

        if (minutes < 1) return 'just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    return (
        <div className="h-full flex flex-col bg-primary-100 animate-slide-in">
            <div className="px-3 py-2.5 border-b flex items-center justify-between" style={{borderColor: 'var(--primary-300)'}}>
                <h2 className="text-sm font-semibold text-text-primary">Recent Backtests</h2>
                <button
                    onClick={refreshBacktests}
                    disabled={loading}
                    className="p-1 hover:bg-primary-200 rounded transition-all duration-200 hover:scale-110"
                >
                    <svg className={`w-4 h-4 text-muted ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                </button>
            </div>
            
            <div className="px-2 py-2 border-b" style={{borderColor: 'var(--primary-300)'}}>
                <div className="flex gap-1.5">
                    <button onClick={() => setFilter('all')} className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${filter === 'all' ? 'bg-primary-400 text-white shadow-lg shadow-primary-400/30' : 'text-muted hover:text-white hover:bg-primary-200 hover:scale-105'}`}>All</button>
                    <button onClick={() => setFilter('completed')} className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${filter === 'completed' ? 'bg-success text-white shadow-lg shadow-success/30' : 'text-muted hover:text-white hover:bg-primary-200 hover:scale-105'}`}>Done</button>
                    <button onClick={() => setFilter('processing')} className={`px-2 py-1 text-xs font-medium rounded transition-all duration-200 ${filter === 'processing' ? 'bg-info text-white shadow-lg shadow-info/30' : 'text-muted hover:text-white hover:bg-primary-200 hover:scale-105'}`}>Running</button>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                {loading && backtestList.length === 0 ? (
                    <div className="text-center py-8 animate-fade-in">
                        <div className="animate-spin text-2xl mb-2" style={{color: 'var(--primary-400)'}}>⟳</div>
                        <p className="text-muted text-xs">Loading...</p>
                    </div>
                ) : backtestList.length > 0 ? (
                    <div className="p-2 space-y-1.5">
                        {backtestList.map((item, index) => (
                            <div key={item.backtestId} className="p-2.5 rounded-md cursor-pointer hover:bg-primary-200 transition-all duration-200 border hover:border-primary-400 hover:shadow-lg hover:-translate-y-0.5 animate-slide-in" style={{borderColor: 'var(--primary-300)', background: 'var(--primary-100)', animationDelay: `${index * 50}ms`}}>
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-sm font-medium text-white">{item.params?.symbol || 'Unknown'}</span>
                                    <div className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(item.status)}`} style={{opacity: 0.2}}>
                                        <span className={`${getStatusColor(item.status).replace('bg-', 'text-')}`} style={{opacity: 1}}>{item.status}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center text-xs">
                                    <span className="text-muted">{formatDate(item.createdAt)}</span>
                                    {item.status === 'completed' && item.result && (
                                        <span className={`font-semibold ${(item.result.totalReturn || 0) >= 0 ? 'status-success' : 'status-error'}`}>
                                            {formatPercentage(item.result.totalReturn)}
                                        </span>
                                    )}
                                    {item.status === 'processing' && (
                                        <span className="status-info font-medium">{item.progress}%</span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-8 px-4">
                        <div className="text-4xl mb-2">📊</div>
                        <p className="text-muted text-xs mb-1">No backtests yet</p>
                        <p className="text-subtle text-xs">Run a backtest to see results</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;
