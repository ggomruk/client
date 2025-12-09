'use client'
import React, { useState } from 'react';
import StrategyModal from './StrategyModal';
import { UserStrategy } from '../_type/startegy';
import Datepicker from 'react-tailwindcss-datepicker';
import { useWebsocket } from '../_provider/binance.websocket';
import axiosInstance from '../_api/axios';
import { AxiosResponse } from 'axios';

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

        try {
            const result = await axiosInstance.post("/algo/backtest", formData);
            console.log(result);
            const { status, data } = result as AxiosResponse;
            console.log(status);
            console.log(data);
            
            if (data.ok) {
                alert('Backtest submitted successfully!');
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Failed to submit backtest');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="p-6 text-white border border-gray-700 rounded-xl shadow-lg bg-gray-800 h-full">
            <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-indigo-400'>Backtest Strategy</h2>
                <div className="flex items-center gap-2 px-3 py-1 bg-gray-700 rounded-full text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-300">{symbol}</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                {/* Capital & Settings */}
                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Capital (USDT)
                        </label>
                        <input
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            type="number"
                            value={quantity}
                            min="0"
                            step="100"
                            onChange={(e) => setQuantity(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Leverage
                        </label>
                        <input
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            type="number"
                            value={leverage}
                            min="1"
                            max="70"
                            onChange={(e) => setLeverage(Number(e.target.value))}
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Interval (Minutes)
                        </label>
                        <input
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                            type="number"
                            value={interval}
                            min="1"
                            onChange={(e) => setInterval(Number(e.target.value))}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                            Trading Cost (%)
                        </label>
                        <input
                            className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-1 focus:ring-indigo-500"
                            type="number"
                            value={tc}
                            min="0"
                            max="2"
                            step="0.01"
                            onChange={(e) => setTc(Number(e.target.value))}
                        />
                    </div>
                </div>

                {/* Date Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-2">
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
                    <label className="block text-sm font-medium text-gray-400 mb-2">
                        Trading Strategies
                    </label>
                    <button
                        type="button"
                        className="w-full px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors flex items-center justify-center gap-2"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Add Strategy
                    </button>
                </div>

                {/* Selected Strategies */}
                {strategy.length > 0 && (
                    <div className="mt-4">
                        <div 
                            className='flex items-center justify-between text-sm text-gray-400 mb-2 cursor-pointer'
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
                                        className="p-3 bg-gray-900 border border-gray-700 rounded-lg"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="font-medium text-indigo-400 mb-1">{s.name}</div>
                                                <div className="text-xs text-gray-500 space-y-1">
                                                    {Object.entries(s.params).map(([k, v]) => (
                                                        <div key={k}>
                                                            <span className="text-gray-400">{k}:</span> {v}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveStrategy(index)}
                                                className="ml-2 text-red-400 hover:text-red-300 transition-colors"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg py-3 px-4 font-medium transition-colors flex items-center justify-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Running Backtest...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
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