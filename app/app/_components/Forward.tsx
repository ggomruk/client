'use client'

import React, {useState} from 'react'

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
    const [focusState, setFocusState] = useState<{ [key: string]: boolean }>({});
    const [strategy, setStrategy] = useState<string>('MACD');
    const [strategyParams, setStrategyParams] = useState<any>({});

    const handleStrategyChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedStrategy = e.target.value;
        setStrategy(selectedStrategy);
        setStrategyParams({});
    };

    const handleFocus = (inputName: string) => {
        setFocusState({ ...focusState, [inputName]: true });
    };

    const handleBlur = (inputName: string) => {
        setFocusState({ ...focusState, [inputName]: false });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = {
            interval,
            strategy,
            strategyParams,
        };
        console.log('Form Data:', formData);
        // Process the form data (e.g., send to an API)
    };

    return (
        <div className="mr-8 p-5 text-white border border-solid border-opacity-70 border-gray-500 rounded-xl shadow w-1/4 bg-primary-container-dark">
            <div className='px-2'>
                <div className='text-3xl py-3'>Signal</div>
                    {/* Interval */}
                    <div className={`h-12 my-3 flex flex-col justify-center w-full rounded-lg border ${focusState.interval ? 'border-white' : 'border-gray-400'} bg-primary-container`}>
                        <div className="p-3 flex items-center">
                            <span>Interval</span>
                            <input
                                className="bg-transparent mx-2 text-right focus:outline-none w-full no-spinners"
                                type="number"
                                value={interval}
                                min="0"
                                onChange={(e) => setInterval(Number(e.target.value))}
                                onFocus={() => handleFocus('interval')}
                                onBlur={() => handleBlur('interval')}
                            />
                            <span>Minute</span>
                        </div>
                    </div>

                    {/* Strategy Dropdown */}
                    <div className='flex flex-row'>
                        <div className={`w-full rounded-lg border ${focusState.strategy ? 'border-white' : 'border-gray-400'} my-3 bg-primary-container`}>
                            <span className="p-3 flex items-center">
                                <span>Strategy</span>
                                <select
                                    value={strategy}
                                    className="bg-transparent mx-2 text-right focus:outline-none w-full no-spinners"
                                    onChange={handleStrategyChange}
                                    onFocus={() => handleFocus('strategy')}
                                    onBlur={() => handleBlur('strategy')}
                                >
                                    {
                                        strategyList.map((strategy, index) => (
                                            <option key={index} value={strategy.symbol}>{strategy.name} ({strategy.symbol})</option>
                                        ))
                                    }
                                </select>
                                <span>
                                </span>
                            </span>
                        </div>
                    </div>

                <div className='flex flex-col `items-end'>

                </div>

                <button
                    className="bg-green-400 hover:bg-green-600 text-white rounded-lg py-2 px-4 mt-4 w-full"
                    onClick={handleSubmit}
                >
                    Submit
                </button>


            </div>
        </div>
    )
}

export default Forward