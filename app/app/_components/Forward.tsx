'use client'

import React, { useState } from 'react'

const strategyList = [
    { name: 'Moving Average Convergence Divergence', symbol: 'MACD', params: ['short', 'long', 'signal'] },
    { name: 'Bollinger Band', symbol: 'BB', params: ['sma', 'dev'] },
    { name: 'Simple Moving Average', symbol: 'SMA', params: ['sma S', 'sma M', 'sma L'] },
    { name: 'Relative Strength Index', symbol: 'RSI', params: ['periods', 'rsi upper', 'rsi lower'] },
    { name: 'RV', symbol: 'RV', params: ['volume low', 'volume high', 'return low', 'return high'] },
    { name: 'SO', symbol: 'SO', params: ['period', 'd_mw'] },
];

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
        <div className="bg-gray-800 rounded-xl border border-gray-700 shadow-lg overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">Signal Trading</h2>
                <p className="text-indigo-200 text-sm mt-1">Real-time strategy execution</p>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
                {/* Interval Input */}
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                        Interval (Minutes)
                    </label>
                    <input
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                        type="number"
                        value={interval}
                        min="1"
                        onChange={(e) => setInterval(Number(e.target.value))}
                        placeholder="Enter interval"
                    />
                </div>

                {/* Strategy Dropdown */}
                <div>
                    <label className="block text-gray-300 text-sm font-medium mb-2">
                        Strategy
                    </label>
                    <select
                        value={strategy}
                        className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition cursor-pointer"
                        onChange={handleStrategyChange}
                    >
                        {strategyList.map((strategy, index) => (
                            <option key={index} value={strategy.symbol} className="bg-gray-800">
                                {strategy.name} ({strategy.symbol})
                            </option>
                        ))}
                    </select>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-semibold rounded-lg py-3 px-4 transition duration-200 flex items-center justify-center gap-2"
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Starting...
                        </>
                    ) : (
                        <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Submit
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Forward;