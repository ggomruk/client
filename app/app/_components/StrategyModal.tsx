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
        const defaultParams: any = {};
        strategy.params.forEach(p => {
            if (p.default !== undefined) defaultParams[p.name] = p.default;
        });
        setUserStrategy({ name: strategy.symbol, params: defaultParams });
    }

    const handleBack = () => {
        setSelectedStrategy(null);
        setUserStrategy(null);
    }

    return (
        <div 
            className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div 
                className="bg-primary-100 rounded-lg border border-primary-300 shadow-2xl w-full max-w-md overflow-hidden animate-slide-in"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-primary-300">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-primary-400/20 flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                        </div>
                        <h2 className="text-base font-semibold text-text-primary">
                            {selectedStrategy ? `Configure ${selectedStrategy.symbol}` : 'Select Strategy'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-muted hover:text-text-primary transition-all duration-200 hover:scale-110 p-1"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                {/* Content */}
                <div className="relative overflow-hidden">
                    <div 
                        className="flex transition-transform duration-300 ease-in-out"
                        style={{ transform: `translateX(-${selectedStrategy !== null ? 100 : 0}%)` }}
                    >
                        {/* Step 1: Strategy Selection */}
                        <div className="w-full flex-shrink-0 p-5">
                            <p className="text-xs text-muted mb-4">Choose a trading strategy to configure</p>
                            <div className="space-y-2 max-h-96 overflow-y-auto">
                                {strategyList.map((strategy: Strategy, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className="w-full text-left px-4 py-3 rounded-md bg-primary-200 border border-primary-300 hover:border-primary-400 hover:bg-primary-300 transition-all duration-200 hover:translate-x-1 group"
                                        onClick={() => handleStrategySelection(strategy)}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <div className="text-sm font-medium text-text-primary group-hover:text-primary-400 transition-colors">
                                                    {strategy.name}
                                                </div>
                                                <div className="text-xs text-muted mt-0.5">
                                                    {strategy.symbol} · {strategy.params.length} parameters
                                                </div>
                                            </div>
                                            <svg className="w-4 h-4 text-muted group-hover:text-primary-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Step 2: Parameter Configuration */}
                        <div className="w-full flex-shrink-0 p-5">
                            {(selectedStrategy && userStrategy) && (
                                <>
                                    <div className="mb-4">
                                        <p className="text-xs text-muted">Configure parameters for</p>
                                        <p className="text-sm font-semibold text-primary-400 mt-1">{selectedStrategy.name}</p>
                                    </div>
                                    
                                    <div className="space-y-3 max-h-80 overflow-y-auto">
                                        {selectedStrategy.params.map((param, index) => (
                                            <div key={param.name + "_" + index} className="space-y-1">
                                                <label className="block text-xs font-medium text-muted">
                                                    {param.label}
                                                </label>
                                                <input
                                                    type="number"
                                                    value={userStrategy.params[param.name] ?? param.default ?? ''}
                                                    placeholder="Enter value"
                                                    min={param.min}
                                                    max={param.max}
                                                    step={param.step}
                                                    onChange={(e) => setUserStrategy({ 
                                                        ...userStrategy, 
                                                        params: {
                                                            ...userStrategy.params,
                                                            [param.name]: Number(e.target.value)
                                                        }
                                                    })}
                                                    className="w-full text-sm"
                                                />
                                                {param.explanation && (
                                                    <p className="text-[10px] text-muted mt-0.5 leading-tight">
                                                        {param.explanation}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 mt-5 pt-4 border-t border-primary-300">
                                        <button
                                            type="button"
                                            className="btn-outline flex-1 py-2.5 px-4 text-sm"
                                            onClick={handleBack}
                                        >
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                            </svg>
                                            Back
                                        </button>
                                        <button
                                            type="button"
                                            className="btn-primary flex-1 py-2.5 px-4 text-sm"
                                            onClick={() => handleStrategyChange(userStrategy)}
                                        >
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Save Strategy
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StrategyModal;