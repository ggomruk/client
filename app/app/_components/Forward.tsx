'use client'

import React, { useState } from 'react'
import { strategyList } from '../_constants/strategy';

const Forward = () => {
    const [interval, setInterval] = useState<number>(1);
    const [strategy, setStrategy] = useState<string>('MACD');
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedStrategy = e.target.value;
        setStrategy(selectedStrategy);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        
        const formData = {
            interval,
            strategy,
        };
        
        console.log('Form Data:', formData);
        
        // Simulate API call
        setTimeout(() => {
            setIsLoading(false);
        }, 1000);
    };

    return (
        <div className="bg-primary-100 rounded-md border border-primary-300 p-3 transition-all duration-200 hover:border-primary-400 animate-slide-in">
            <div className='flex items-center justify-between mb-3'>
                <h2 className='text-sm font-semibold text-text-primary'>Signal Trading</h2>
                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-secondary-400/20 text-secondary-400 transition-all duration-200 hover:bg-secondary-400/30">
                    <div className="w-1.5 h-1.5 bg-secondary-400 rounded-full animate-pulse-subtle"></div>
                    <span className="text-xs font-medium">Live</span>
                </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-2.5">
                {/* Interval Input */}
                <div>
                    <label className="block text-muted text-xs font-medium mb-1">
                        Interval (Minutes)
                    </label>
                    <input
                        type="number"
                        value={interval}
                        min="1"
                        onChange={(e) => setInterval(Number(e.target.value))}
                        placeholder="Enter interval"
                        className="text-sm"
                    />
                </div>

                {/* Strategy Dropdown */}
                <div>
                    <label className="block text-muted text-xs font-medium mb-1">
                        Strategy
                    </label>
                    <select
                        value={strategy}
                        onChange={handleStrategyChange}
                        className="text-sm"
                    >
                        {strategyList.map((strategy, index) => (
                            <option key={index} value={strategy.symbol}>
                                {strategy.name} ({strategy.symbol})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="btn-secondary w-full font-semibold py-2.5 px-4 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-3 transition-all duration-200"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Starting...
                        </>
                    ) : (
                        <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Start Signal Trading
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Forward;