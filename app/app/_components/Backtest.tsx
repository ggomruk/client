'use client'
import React, { useState } from 'react';
import StrategyModal from './StrategyModal';
import Datepicker from 'react-tailwindcss-datepicker';
import { useWebsocket } from '../_provider/binance.websocket';
import { UserStrategy } from '../_types/startegy';
import backtestService from '../../services/backtestService';

const Backtest = () => {
    const { symbol } = useWebsocket();
    const [quantity, setQuantity] = useState<number>(1000);
    const [interval, setInterval] = useState<number>(1);
    const [leverage, setLeverage] = useState<number>(1);
    const [tc, setTc] = useState<number>(0.1);
    const [date, setDate] = useState<{startDate: Date | null, endDate: Date | null}>({startDate: null, endDate: null})
    const [showStrategyDetails, setShowStrategyDetails] = useState<boolean>(false);
    const [strategy, setStrategy] = useState<UserStrategy[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Called if user selects a strategy and sets the parameters
    const handleStrategyChange = (selectedStrategy: UserStrategy) => {
        // If there is no strategy, add the selected strategy
        if(!strategy.length)  {
            return setStrategy([selectedStrategy]);
        }
        // check if strategy already exists in the list
        const index = strategy?.findIndex((s) => s.name === selectedStrategy.name);
        // if strategy already exists, replace the strategy with same name to the new strategy
        if (index !== -1) {
            const newStrategies = [...strategy];
            newStrategies[index] = selectedStrategy;
            setStrategy(newStrategies);
        } else {
            // else add the new strategy to the list
            setStrategy([...strategy, selectedStrategy]);
        }
        
        setIsModalOpen(false);
    };

    const handleRemoveStrategy = (index: number) => {
        const newStrategies = strategy.filter((_, i) => i !== index);
        setStrategy(newStrategies);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!date.startDate || !date.endDate) {
            alert('Please select date range');
            return;
        }

        if (strategy.length === 0) {
            alert('Please select at least one strategy');
            return;
        }

        setIsSubmitting(true);

        const formData = {
            "symbol": symbol,
            "startDate": date.startDate?.toISOString(),
            "endDate": date.endDate?.toISOString(),
            "usdt": quantity,
            "interval": interval.toString(),
            "tc": tc,
            "leverage": leverage,
            "strategies": strategy.reduce((acc, s) => {
                acc[s.name] = { ...s.params };
                return acc;
            }, {} as Record<string, any>)
        };

        console.log(formData);

        try {
            const response = await backtestService.submitBacktest(formData);
            if (response.ok && response.data) {
                alert(`Backtest submitted successfully! ID: ${response.data.backtestId}`);
            } else {
                alert(response.error || 'Failed to submit backtest');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit backtest');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-primary-100 rounded-md border border-primary-300 p-3 transition-all duration-200 hover:border-primary-400 animate-slide-in">
            <div className='flex items-center justify-between mb-3'>
                <h2 className='text-sm font-semibold text-text-primary'>Backtest Strategy</h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-success/20 text-success transition-all duration-200 hover:bg-success/30">
                    <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse-subtle"></div>
                    <span className="text-xs font-medium">{symbol}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-2.5">
                {/* Capital & Settings */}
                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            Capital (USDT)
                        </label>
                        <input
                            type="number"
                            value={quantity}
                            min="0"
                            step="100"
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            Leverage
                        </label>
                        <input
                            type="number"
                            value={leverage}
                            min="1"
                            max="70"
                            onChange={(e) => setLeverage(Number(e.target.value))}
                            className="text-sm"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            Interval (Minutes)
                        </label>
                        <input
                            type="number"
                            value={interval}
                            min="1"
                            onChange={(e) => setInterval(Number(e.target.value))}
                            className="text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-muted mb-1">
                            Trading Cost (%)
                        </label>
                        <input
                            type="number"
                            value={tc}
                            min="0"
                            max="2"
                            step="0.01"
                            onChange={(e) => setTc(Number(e.target.value))}
                            className="text-sm"
                        />
                    </div>
                </div>

                {/* Date Range */}
                <div>
                    <label className="block text-xs font-medium text-muted mb-1">
                        Date Range
                    </label>
                    <div className="backtest-datepicker">
                        <Datepicker 
                            value={date} 
                            onChange={newValue => newValue && setDate(newValue)}
                            showShortcuts={true}
                            primaryColor="indigo"
                        />
                    </div>
                </div>

                {/* Strategy Selection */}
                <div>
                    <label className="block text-xs font-medium text-muted mb-1">
                        Trading Strategies
                    </label>
                    <button
                        type="button"
                        className="btn-primary w-full flex items-center justify-center gap-2 text-sm py-2.5 px-4"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Strategy
                    </button>
                </div>

                {/* Selected Strategies */}
                {strategy.length > 0 && (
                    <div className="mt-2">
                        <div 
                            className='flex items-center justify-between text-xs font-medium text-muted mb-2 cursor-pointer hover:text-text-primary transition-colors'
                            onClick={() => setShowStrategyDetails(!showStrategyDetails)}
                        >
                            <span>{strategy.length} {strategy.length === 1 ? 'Strategy' : 'Strategies'} Selected</span>
                            <svg 
                                className={`w-4 h-4 transition-transform ${showStrategyDetails ? 'rotate-180' : ''}`} 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </div>
                        
                        {showStrategyDetails && (
                            <div className="space-y-2">
                                {strategy.map((s, index) => (
                                    <div 
                                        key={index} 
                                        className="card border"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="text-sm font-medium mb-1" style={{color: 'var(--primary-400)'}}>{s.name}</div>
                                                <div className="text-xs text-subtle space-y-1">
                                                    {Object.entries(s.params).map(([k, v]) => (
                                                        <div key={k}>
                                                            <span className="text-muted">{k}:</span> {v}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStrategy(index)}
                                                className="ml-2 text-error hover:brightness-110 transition-all"
                                            >
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {isModalOpen && (
                    <StrategyModal
                        onClose={() => setIsModalOpen(false)}
                        handleStrategyChange={handleStrategyChange}
                    />
                )}

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isSubmitting || strategy.length === 0}
                    className="btn-primary w-full font-semibold py-2.5 px-4 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-3 transition-all duration-200"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Running...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                            Run Backtest
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Backtest;