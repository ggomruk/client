'use client'

import { faArrowCircleDown, faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useRef } from 'react';
import CRYPTO_SYMBOLS from '../_constants/crypto';
import Image from 'next/image';
import { useWebsocket } from "../_provider/binance.websocket";

const Panel = () => {
    const { symbolData, symbol, setSymbol } = useWebsocket();
    const [dropdownOpen, setDropdownOpen] = React.useState<boolean>(false);
    const [currentPrice, setCurrentPrice] = React.useState<number>(0);
    const [searchContent, setSearchContent] = React.useState<string>('');
    const prevPriceRef = useRef<number>(0);

    useEffect(() => {
        if (symbolData?.lastPrice !== undefined) {
            setCurrentPrice(parseFloat((symbolData.lastPrice).toFixed(2)));
        }
    }, [symbolData?.lastPrice]);

    useEffect(() => {
        if (currentPrice !== prevPriceRef.current) {
            prevPriceRef.current = currentPrice;
        }
    }, [currentPrice]);

    const handleKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key === 'Escape' && dropdownOpen) {
            setDropdownOpen(false);
        }
    }, [dropdownOpen]);

    const handleOutsideClick = useCallback((event: MouseEvent) => {
        if (event.target instanceof HTMLElement) {
            if (!event.target.closest('.panel')) {
                setDropdownOpen(false);
            }
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchContent(e.target.value);
    };

    const resetSearchContent = () => {
        setSearchContent('');
    };

    useEffect(() => {
        if (dropdownOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.addEventListener('click', handleOutsideClick);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.removeEventListener('click', handleOutsideClick);
        };
    }, [dropdownOpen, handleKeyDown, handleOutsideClick]);

    return (
        <div className="card w-full flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 animate-slide-in">
            <div className="relative flex items-center justify-start w-full sm:w-auto">

                <div className="bg-white rounded-md w-9 h-9 flex items-center justify-center mr-2.5 flex-shrink-0">
                    <Image src={`./images/${symbol.slice(0, -4).toLocaleLowerCase()}.svg`} width={24} height={24} alt='Symbol Icon' className="w-6 h-6" />
                </div>

                <div className="flex flex-col">
                    <span className="font-semibold text-base">{`${symbol.toUpperCase().slice(0, -4)}/${symbol.toUpperCase().slice(-4)}`}</span>
                    <span className="text-muted text-xs">{CRYPTO_SYMBOLS[symbol.slice(0, -4).toUpperCase() as keyof typeof CRYPTO_SYMBOLS] ?? "NA"}</span>
                </div>

                <button className="h-5 w-5 ml-2 hover:scale-110 transition-all duration-200" onClick={() => setDropdownOpen(!dropdownOpen)}>
                    <FontAwesomeIcon fixedWidth style={{color: 'var(--primary-400)'}} icon={faArrowCircleDown} />
                </button>

                {
                    dropdownOpen && (
                        <div className="dropdown absolute top-full left-0 z-10 h-80 w-80 mt-1 flex flex-col animate-slide-in">
                            <div className="relative flex items-center p-3">
                                <FontAwesomeIcon icon={faSearch} className="absolute left-6 text-text-tertiary" />
                                <input
                                    type="text"
                                    placeholder="Search symbols..."
                                    value={searchContent}
                                    onChange={handleInputChange}
                                    className="w-full pl-8 pr-8 py-2 text-sm"
                                />
                                {searchContent && (
                                    <FontAwesomeIcon icon={faXmark} className="absolute right-6 cursor-pointer text-text-tertiary hover:text-text-primary" onClick={resetSearchContent} />
                                )}
                            </div>
                            <hr />
                            <div className="no-scrollbar flex-1 overflow-y-auto p-1">
                                {Object.keys(CRYPTO_SYMBOLS).map((s, index) => (
                                    <div 
                                        key={index} 
                                        className="flex items-center gap-2 py-2 px-3 rounded-md cursor-pointer hover:bg-primary-200 transition-all duration-200 hover:translate-x-1 text-sm" 
                                        onClick={() => {
                                            setSymbol(`${s}USDT`);
                                            setDropdownOpen(false);
                                        }}
                                    >
                                        {`${s}USDT`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                }

            </div>

            {/* Current Price */}
            <div className="flex flex-col items-center justify-center px-4 border-l border-primary-300">
                <p className="text-muted text-xs mb-1">Mark Price</p>
                {symbolData !== null ? (
                    <span className={`text-xl font-semibold ${currentPrice > prevPriceRef.current ? "status-success" : currentPrice < prevPriceRef.current ? "status-error" : "text-text-primary"}`}>
                        ${currentPrice.toFixed(2)}
                    </span>
                ) : (
                    <div className="skeleton h-6 w-20"></div>
                )}
            </div>

            {/* Market Stats Grid - Clean layout */}
            <div className="flex-1 flex items-center gap-6 ml-auto">
                {/* Market Change */}
                <div className="flex flex-col">
                    <p className="text-muted text-xs mb-0.5">24h Change</p>
                    {symbolData !== null ? (
                        <span className={`text-sm font-medium ${symbolData?.priceChange > 0 ? "status-success" : symbolData?.priceChange < 0 ? "status-error" : "text-text-primary"}`}>
                            {symbolData?.priceChange > 0 ? '+' : ''}{symbolData?.priceChange.toFixed(2)}
                        </span>
                    ) : (
                        <div className="skeleton h-5 w-14"></div>
                    )}
                </div>

                {/* Market Change % */}
                <div className="flex flex-col">
                    <p className="text-muted text-xs mb-0.5">24h Change (%)</p>
                    {symbolData !== null ? (
                        <span className={`text-sm font-medium ${symbolData?.priceChangePercent > 0 ? "status-success" : symbolData?.priceChangePercent < 0 ? "status-error" : "text-text-primary"}`}>
                            {symbolData?.priceChangePercent > 0 ? '+' : ''}{symbolData?.priceChangePercent.toFixed(2)}%
                        </span>
                    ) : (
                        <div className="skeleton h-5 w-14"></div>
                    )}
                </div>

                {/* High */}
                <div className="flex flex-col">
                    <p className="text-muted text-xs mb-0.5">24h High</p>
                    {symbolData !== null ? (
                        <span className="text-sm font-medium text-text-primary">${symbolData.highPrice.toFixed(2)}</span>
                    ) : (
                        <div className="skeleton h-5 w-14"></div>
                    )}
                </div>

                {/* Low */}
                <div className="flex flex-col">
                    <p className="text-muted text-xs mb-0.5">24h Low</p>
                    {symbolData !== null ? (
                        <span className="text-sm font-medium text-text-primary">${symbolData.lowPrice.toFixed(2)}</span>
                    ) : (
                        <div className="skeleton h-5 w-14"></div>
                    )}
                </div>

                {/* Volume */}
                <div className="flex flex-col">
                    <p className="text-muted text-xs mb-0.5">24h Volume</p>
                    {symbolData !== null ? (
                        <span className="text-sm font-medium text-text-primary">{(symbolData.quantity / 1000).toFixed(2)}K</span>
                    ) : (
                        <div className="skeleton h-5 w-14"></div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Panel;