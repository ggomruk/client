'use client'

import { useWebsocket } from "../_context/websocket.context";
import { faArrowCircleDown, faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useRef } from 'react';
import CRYPTO_SYMBOLS from '../_constants/crypto';
import Image from 'next/image';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

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

    const toggleDropDown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    return (
        <div className="flex flex-row h-full items-center text-white text-base m-6 mb-0 border-solid border border-opacity-70 border-gray-500 rounded-xl shadow bg-primary-container-dark">
            <div className="m-6 flex flex-col items-center justify-center">
                <div className="flex items-center">
                    <div className="bg-gray-200 rounded-full w-10 h-10 flex items-center justify-center mr-2.5 ">
                        <Image src={`./images/${symbol.slice(0, -4).toLocaleLowerCase()}.svg`} width={20} height={20} alt='Symbol Icon' className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col mx-2">
                        <span className="font-bold text-white text-lg">{`${symbol.toUpperCase().slice(0, -4)}${symbol.toUpperCase().slice(-4)}`}</span>
                        <span className="text-gray-400 text-sm mt-1 underline">{CRYPTO_SYMBOLS[symbol.slice(0, -4).toUpperCase() as keyof typeof CRYPTO_SYMBOLS] ?? "NA"}</span>
                    </div>
                    <button className="text-primary h-full w-5" onClick={toggleDropDown}>
                        <FontAwesomeIcon className="text-yellow-500" icon={faArrowCircleDown} />
                    </button>
                    {dropdownOpen && (
                        <div className="absolute top-full left-0 z-10 rounded-lg border border-gray-300 shadow-lg h-96 w-80 bg-gray-800 opacity-0 transform -translate-y-2 animate-dropdownFadeIn flex flex-col box-border">
                            <div className="relative flex items-center justify-center">
                                <FontAwesomeIcon icon={faSearch} className="absolute top-1/2 left-10 transform -translate-y-1/2" />
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={searchContent}
                                    onChange={handleInputChange}
                                    className="bg-transparent w-full h-10 m-4 rounded-full border border-gray-300 box-border px-10"
                                />
                                <FontAwesomeIcon icon={faXmark} className="absolute top-1/2 right-10 transform -translate-y-1/2" onClick={resetSearchContent} />
                            </div>
                            <hr className="border-none h-px bg-gray-500 w-full" />
                            <div className="flex-1 overflow-y-auto">
                                {Object.keys(CRYPTO_SYMBOLS).map((s, index) => (
                                    <div key={index} className="p-2.5 h-12 cursor-pointer flex items-center hover:bg-gray-700" onClick={() => {
                                        setSymbol(`${s}USDT`);
                                        setDropdownOpen(false);
                                    }}>
                                        {`${s}USDT`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Current Price */}
            <div className="m-6 flex flex-col items-center justify-center">
                <p className="text-gray-400 text-sm underline mb-1">Mark Price</p>
                {symbolData !== null ? (
                    <span className={currentPrice > prevPriceRef.current ? "text-green-500" : currentPrice < prevPriceRef.current ? "text-red-500" : "text-white"}>
                        {currentPrice.toFixed(2)}
                    </span>
                ) : (
                    <Skeleton width='90px' height="1.2rem" baseColor="rgb(241 237 237)" />
                )}
            </div>

            {/* Market Change */}
            <div className="m-6 flex flex-col items-center justify-center">
                <p className="text-gray-400 text-sm underline mb-1">24h Change</p>
                {symbolData !== null ? (
                    <span className={symbolData?.priceChange > 0 ? "text-green-500" : symbolData?.priceChange < 0 ? "text-red-500" : "text-white"}>
                        {symbolData?.priceChange.toFixed(2) ?? 0}
                    </span>
                ) : (
                    <Skeleton width='90px' height="1.2rem" baseColor="rgb(241 237 237)" />
                )}
            </div>

            {/* Market Change % */}
            <div className="m-6 flex flex-col items-center justify-center">
                <p className="text-gray-400 text-sm underline mb-1">24h Change (%)</p>
                {symbolData !== null ? (
                    <span className={symbolData?.priceChangePercent > 0 ? "text-green-500" : symbolData?.priceChangePercent < 0 ? "text-red-500" : "text-white"}>
                        {symbolData?.priceChangePercent.toFixed(2)}%
                    </span>
                ) : (
                    <Skeleton width='90px' height="1.2rem" baseColor="rgb(241 237 237)" />
                )}
            </div>

            {/* High */}
            <div className="m-6 flex flex-col items-center justify-center">
                <p className="text-gray-400 text-sm underline mb-1">24h High</p>
                {symbolData !== null ? (
                    <span className="text-white">{symbolData.highPrice.toFixed(2)}</span>
                ) : (
                    <Skeleton width='90px' height="1.2rem" baseColor="rgb(241 237 237)" />
                )}
            </div>

            {/* Low */}
            <div className="m-6 flex flex-col items-center justify-center">
                <p className="text-gray-400 text-sm underline mb-1">24h Low</p>
                {symbolData !== null ? (
                    <span className="text-white">{symbolData.lowPrice.toFixed(2)}</span>
                ) : (
                    <Skeleton width='90px' height="1.2rem" baseColor="rgb(241 237 237)" />
                )}
            </div>

            {/* Quantity */}
            <div className="m-6 flex flex-col items-center justify-center">
                <p className="text-gray-400 text-sm underline mb-1">24h Quantity</p>
                {symbolData !== null ? (
                    <span className="text-white">{symbolData.quantity.toFixed(2)}</span>
                ) : (
                    <Skeleton width='90px' height="1.2rem" baseColor="rgb(241 237 237)" />
                )}
            </div>
        </div>
    );
};

export default Panel;