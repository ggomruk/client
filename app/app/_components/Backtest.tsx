'use client'
import React, { useState } from 'react';
import StrategyModal from './StrategyModal';
import { UserStrategy } from '../_type/startegy';

const Backtest = () => {
    const [symbol, setSymbol] = useState('BTCUSDT');
    const [quantity, setQuantity] = useState(0);
    const [interval, setInterval] = useState<number>(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");

    const [strategy, setStrategy] = useState<UserStrategy|null>(null);
    // const [strategy, setStrategy] = useState<string|null>(null);
    // const [strategyParams, setStrategyParams] = useState<{[key: string]:number}>({});
    
    const [focusState, setFocusState] = useState<{ [key: string]: boolean }>({});
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Called if user selects a strategy and sets the parameters
    const handleStrategyChange = (selectedStrategy: UserStrategy) => {
        setStrategy(selectedStrategy);
        setIsModalOpen(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const formData = {
            symbol,
            interval,
            startDate,
            endDate,
            strategy,
        };
        console.log('Form Data:', formData);
        // Process the form data (e.g., send to an API)
    };

    const handleFocus = (inputName: string) => {
        setFocusState({ ...focusState, [inputName]: true });
    };

    const handleBlur = (inputName: string) => {
        setFocusState({ ...focusState, [inputName]: false });
    };

    return (
        <div className="flex flex-col mr-8 p-3 text-white border border-solid border-opacity-70 border-gray-500 rounded-xl shadow w-1/4 bg-primary-container-dark">
            <div className='px-2'>
                <div className='text-2xl pb-2'>Backtest</div>

                {/* Quantity */}
                <div className='flex flex-row'>
                    <div className={`w-full rounded-full border ${focusState.quantity ? 'border-white' : 'border-gray-400'} my-3 bg-primary-container`}>
                        <span className="p-3 flex items-center">
                            <span>Quantity</span>
                            <input
                                className="bg-transparent mx-2 text-right focus:outline-none w-full no-spinners"
                                type="number"
                                value={quantity}
                                min="0"
                                onChange={(e) => setQuantity(Number(e.target.value))}
                                onFocus={() => handleFocus('quantity')}
                                onBlur={() => handleBlur('quantity')}
                            />
                            <span>USDT</span>
                        </span>
                    </div>
                </div>

                {/* Interval */}
                <div className='flex flex-row'>
                    <div className={`w-full rounded-full border ${focusState.interval ? 'border-white' : 'border-gray-400'} my-3 bg-primary-container`}>
                        <span className="p-3 flex items-center">
                            <span>Interval</span>
                            <input
                                type="number"
                                value={interval}
                                min="0"
                                onChange={(e) => setInterval(Number(e.target.value))}
                                className="bg-transparent mx-2 text-right focus:outline-none w-full no-spinners"
                                onFocus={() => handleFocus('interval')}
                                onBlur={() => handleBlur('interval')}
                            />
                            <span>Minute</span>
                        </span>
                    </div>
                </div>

                <div className="flex flex-col">
                    <div className={`w-full rounded-full border ${focusState.strategy ? 'border-white' : 'border-gray-400'} my-3 bg-primary-container`}>
                        <span className="p-3 flex items-center">
                            <span>Strategy</span>
                            <button
                                className="bg-transparent mx-2 text-right focus:outline-none w-full no-spinners"
                                onClick={() => setIsModalOpen(true)}
                                onFocus={() => handleFocus('strategy')}
                                onBlur={() => handleBlur('strategy')}
                            >
                                {strategy?.name ?? 'Select Strategy'}
                            </button>
                            <span>
                            </span>
                        </span>
                    </div>
                    {
                        strategy && (
                            <div className="flex flex-col items-end">
                                {
                                    Object.entries(strategy?.params).map(([key, value], index) => (
                                        <p key={key+"_"+index}>{key}: {value}</p>
                                    ))
                                }
                            </div>
                        )
                    }
                </div>

                {isModalOpen && (
                    <StrategyModal
                        onClose={() => setIsModalOpen(false)}
                        handleStrategyChange={handleStrategyChange}
                    />
                )}

                <button
                    className="bg-green-400 hover:bg-green-600 text-white rounded-full py-2 px-4 mt-4 w-full"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default Backtest;