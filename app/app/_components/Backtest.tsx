'use client'
import React, { useState } from 'react';
import StrategyModal from './StrategyModal';
import { UserStrategy } from '../_type/startegy';
import Datepicker from 'react-tailwindcss-datepicker';
import { useWebsocket } from '../_context/websocket.context';
import axiosInstance from '../_api/axios';
import { AxiosResponse } from 'axios';

const Backtest = () => {
    const { symbol } = useWebsocket();
    const [quantity, setQuantity] = useState<number>(0);
    const [interval, setInterval] = useState<number>(1);
    const [date, setDate] = useState<{startDate: Date | null, endDate: Date | null}>({startDate: null, endDate: null})
    const [showStrategyDetails, setShowStrategyDetails] = useState<boolean>(false);
    const [strategy, setStrategy] = useState<UserStrategy[]>([]);
    const [focusState, setFocusState] = useState<{ [key: string]: boolean }>({});
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const formData = {
            "symbol": symbol,
            "startDate": date.startDate?.toISOString(),
            "endDate": date.endDate?.toISOString(),
            "usdt": quantity,
            "interval": interval.toString(),
            "tc": 0.1,
            "leverage": 1,
            "strategies": strategy.reduce((acc, s) => {
                acc[s.name] = { ...s.params };
                return acc;
            }, {})
        };

        try {
            const result = await axiosInstance.post("/algo/backtest", formData);
            console.log(result);
            // status code and response body
            const { status, data } = result as AxiosResponse;
            console.log(status);
            console.log(data);

        } catch (error) {
            console.error('Error:', error);
        }
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
                    {/* Date  */}
                    <div className="my-3 w-full">
                        <Datepicker value={date} onChange={newValue => setDate(newValue)}
                        />
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
                                    Select Strategy
                            </button>
                        </div>
                    </div>
                    {

                    }
                    <div className='text-sm cursor-pointer text-gray-400 underline decoration-solid underline-offset-4' onClick={() => setShowStrategyDetails(!showStrategyDetails)}> {strategy.length} Strategies Selected</div>
                    {
                        (showStrategyDetails && strategy.length) && (
                            <div className="flex flex-col items-end">
                                {
                                    strategy.map((s, index) => (
                                        <p key={"_"+index}>{s.name} ({
                                            Object.entries(s.params).map(([k, v]) => `${k} : ${v}`).join(", ")
                                            })</p>
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