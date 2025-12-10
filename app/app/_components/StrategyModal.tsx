'use client'
import React, { useState } from 'react';
import { strategyList } from '../_constants/strategy';
import { Strategy, UserStrategy } from '../_types/startegy';

interface StrategyModalProps {
    onClose: () => void;
    handleStrategyChange: (selectedStrategy: UserStrategy) => void;
}

const StrategyModal: React.FC<StrategyModalProps> = ({ onClose, handleStrategyChange }) => {
    const [selectedStrategy, setSelectedStrategy] = useState<Strategy | null>(null);
    const [userStrategy, setUserStrategy] = useState<UserStrategy | null>(null);

    const handleStrategySelection = (strategy: Strategy) => {
        setSelectedStrategy(strategy);
        setUserStrategy({ name: strategy.symbol, params: {} });
    }

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10 p-6">
            <div className="modal w-1/4 overflow-hidden">
                <div className="flex transition-transform duration-300 ease-in-out w-full" style={{ transform: `translateX(-${selectedStrategy !== null ? 100 : 0}%)` }}>
                    {/* Step 1 */}
                    <div className="w-full flex-shrink-0 p-8">
                        <h2 className="text-2xl mb-4 font-bold" style={{color: 'var(--primary-400)'}}>Select Strategy</h2>
                        <ul>
                            {strategyList.map((strategy: Strategy, index) => (
                                <li key={index} className="mb-2">
                                    <button
                                        className="list-item w-full text-left"
                                        onClick={() => handleStrategySelection(strategy)}
                                    >
                                        {strategy.name} ({strategy.symbol})
                                    </button>
                                </li>
                            ))}
                        </ul>
                        <button
                            className="btn-error mt-4"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>

                    {/* Step 2 */}
                    <div className="w-full flex-shrink-0 p-8">
                        {(selectedStrategy && userStrategy) && (
                            <>
                                <h2 className="text-2xl mb-4 font-bold" style={{color: 'var(--primary-400)'}}>Enter Parameters for {selectedStrategy.symbol}</h2>
                                <ul>
                                    {selectedStrategy.params.map((param, index) => (
                                        <div className='flex flex-row' key={param+"_"+index}>
                                            <div className={`w-full rounded-lg border my-3`} style={{borderColor: 'var(--primary-300)', background: 'var(--primary-100)'}}>
                                                <span className="p-3 flex items-center">
                                                    <span className="w-32 text-muted">{param}</span>
                                                    <input
                                                        type="number"
                                                        value={userStrategy.params[param]}
                                                        min={0}
                                                        onChange={(e) => setUserStrategy({ 
                                                            ...userStrategy, 
                                                            params: {
                                                                ...userStrategy.params,
                                                                [param]: Number(e.target.value)
                                                            }
                                                        }
                                                    )}
                                                        className="bg-transparent mx-2 text-right focus:outline-none w-full no-spinners"
                                                    />
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </ul>
                                <div className='flex justify-between gap-3'>
                                    <button
                                        className="btn-outline mt-4"
                                        onClick={() => setSelectedStrategy(null)}
                                    >
                                        Return
                                    </button>
                                    <button
                                        className="btn-primary mt-4"
                                        onClick={() => handleStrategyChange(userStrategy)}
                                    >
                                        Save
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StrategyModal;