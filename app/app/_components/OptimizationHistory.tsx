'use client';

import React, { useState, useEffect } from 'react';
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Play, CheckCircle, XCircle, Clock, Loader2 } from "lucide-react";
import axiosInstance from "../_api/axios";
import { toast } from "sonner";

interface OptimizationTask {
    optimizationId: string;
    userId: string;
    status: string;
    params: any;
    resultId?: string;
    createdAt: string;
    updatedAt: string;
}

interface OptimizationHistoryProps {
    onLoadResult: (result: any) => void;
}

export function OptimizationHistory({ onLoadResult }: OptimizationHistoryProps) {
    const [tasks, setTasks] = useState<OptimizationTask[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingResultId, setLoadingResultId] = useState<string | null>(null);

    const fetchHistory = async () => {
        setLoading(true);
        try {
            const response = await axiosInstance.get('/algo/optimizations');
            if (response.data.ok) {
                setTasks(response.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch optimization history", error);
            toast.error("Failed to fetch history");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchHistory();
    }, []);

    const handleLoad = async (task: OptimizationTask) => {
        if (task.status !== 'completed') return;
        
        setLoadingResultId(task.optimizationId);
        try {
            // Fetch full result
            const response = await axiosInstance.get(`/algo/optimization/${task.optimizationId}/result`);
            if (response.data.ok) {
                const resultData = response.data.data;
                
                // Transform to format expected by OptimizerPage
                // We take the best result (rank 1)
                if (resultData.topResults && resultData.topResults.length > 0) {
                    const best = resultData.topResults[0];
                    const perf = best.performance || {};
                    
                    const transformedResult = {
                        parameters: best.parameters,
                        totalReturn: perf.cstrategy ? (perf.cstrategy - 1) * 100 : 0,
                        sharpeRatio: perf.sharpe || 0,
                        maxDrawdown: 0, // Not currently returned by Python optimization
                        profitFactor: 0, // Not currently returned by Python optimization
                        cagr: (perf.cagr || 0) * 100, // Assuming cagr is decimal
                        finalUsdt: perf.final_usdt_levered || 0,
                        rank: 1
                    };
                    
                    // Also pass all results if needed, but for now let's pass the best one
                    // Or we can pass the array of top results
                    const allResults = resultData.topResults.map((r: any) => {
                        const p = r.performance || {};
                        return {
                            parameters: r.parameters,
                            totalReturn: p.cstrategy ? (p.cstrategy - 1) * 100 : 0,
                            sharpeRatio: p.sharpe || 0,
                            maxDrawdown: 0,
                            profitFactor: 0,
                            cagr: (p.cagr || 0) * 100,
                            finalUsdt: p.final_usdt_levered || 0,
                            rank: r.rank
                        };
                    });

                    onLoadResult({ best: transformedResult, all: allResults });
                    toast.success("Optimization result loaded");
                } else {
                    toast.error("No results found in this optimization");
                }
            } else {
                toast.error("Failed to load result details");
            }
        } catch (error) {
            console.error("Failed to load result", error);
            toast.error("Failed to load result");
        } finally {
            setLoadingResultId(null);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'completed': return <CheckCircle className="w-4 h-4 text-green-400" />;
            case 'failed': return <XCircle className="w-4 h-4 text-red-400" />;
            case 'processing': return <Loader2 className="w-4 h-4 text-blue-400 animate-spin" />;
            default: return <Clock className="w-4 h-4 text-yellow-400" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-[#fafafa]">Optimization History</h3>
                <Button variant="ghost" size="sm" onClick={fetchHistory} disabled={loading}>
                    Refresh
                </Button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {loading && tasks.length === 0 ? (
                    <div className="text-center py-8 text-[#a1a1aa]">Loading history...</div>
                ) : tasks.length === 0 ? (
                    <div className="text-center py-8 text-[#a1a1aa]">No optimization history found</div>
                ) : (
                    tasks.map((task) => (
                        <Card key={task.optimizationId} variant="glass" className="p-3 hover:bg-[#27272a]/50 transition-colors">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    {getStatusIcon(task.status)}
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-medium text-[#fafafa]">
                                                {task.params.symbol} ({task.params.interval})
                                            </span>
                                            <span className="text-xs text-[#a1a1aa]">
                                                {formatDate(task.createdAt)}
                                            </span>
                                        </div>
                                        <div className="text-xs text-[#a1a1aa] mt-1">
                                            Strategies: {task.params.strategies.map((s: any) => s.type).join(', ')}
                                        </div>
                                    </div>
                                </div>
                                
                                {task.status === 'completed' && (
                                    <Button 
                                        size="sm" 
                                        variant="outline" 
                                        onClick={() => handleLoad(task)}
                                        disabled={loadingResultId === task.optimizationId}
                                    >
                                        {loadingResultId === task.optimizationId ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : (
                                            <Play className="w-4 h-4" />
                                        )}
                                        <span className="ml-2">Load</span>
                                    </Button>
                                )}
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
