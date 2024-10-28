'use client'
import React, { useState } from 'react';
import StrategyModal from './StrategyModal';
import { UserStrategy } from '../_type/startegy';

const Backtest = () => {
    const [symbol, setSymbol] = useState('BTCUSDT');
    const [quantity, setQuantity] = useState<number>(0);
    const [interval, setInterval] = useState<number>(1);
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [showStrategyDetails, setShowStrategyDetails] = useState(false);

    const [strategy, setStrategy] = useState<UserStrategy|null>(null);
    
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
        <div className="mr-8 p-5 text-white border border-solid border-opacity-70 border-gray-500 rounded-xl shadow w-1/4 bg-primary-container-dark">
            <div className='px-2'>
                <div className='text-3xl py-3'>Backtest</div>

                <div className="flex flex-col items-end">
                    {/* Quantity */}
                    <div className={`h-12 my-3 flex flex-col justify-center w-full rounded-lg border ${focusState.quantity ? 'border-white' : 'border-gray-400'} bg-primary-container`}>
                        <div className="p-3 flex items-center">
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
                        </div>
                    </div>
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
                    {/* Strategy */}
                    <div className={`h-12 my-3 flex flex-col justify-center w-full rounded-lg border ${focusState.strategy ? 'border-white' : 'border-gray-400'} bg-primary-container`}>
                        <div className="p-3 flex items-center">
                            <span>Strategy</span>
                            <button
                                    className="bg-transparent mx-2 text-right focus:outline-none w-full no-spinners"
                                    onClick={() => setIsModalOpen(true)}
                                    onFocus={() => handleFocus('strategy')}
                                    onBlur={() => handleBlur('strategy')}
                                >
                                    {strategy?.name ?? 'Select Strategy'}
                            </button>
                        </div>
                    </div>
                    <div 
                        className='text-sm text-gray-400 underline decoration-solid underline-offset-4'
                        onClick={() => setShowStrategyDetails(!showStrategyDetails)}
                    > 0 Strategies Selected</div>
                    {
                        showStrategyDetails && (
                            <div className="flex flex-col items-end">
                                {
                                    Object.entries(strategy?.params).map(([key, value], index) => (
                                        <p key={key+"_"+index}>{key}: {value}</p>
                                    ))
                                }
                            </div>
                        )
                    }

                    {isModalOpen && (
                        <StrategyModal
                            onClose={() => setIsModalOpen(false)}
                            handleStrategyChange={handleStrategyChange}
                        />
                    )}
                </div>

                <hr className='mt-8 bg-gray-500 border-t-1 border-transparent w-full' />

                <button
                    className="bg-green-500 hover:bg-green-600 text-white rounded-lg py-2 px-4 my-8 w-full h-13"
                    onClick={handleSubmit}
                >
                    Submit
                </button>
            </div>
        </div>
    );
};

export default Backtest;