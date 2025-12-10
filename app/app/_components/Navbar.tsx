'use client';

import React, { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <nav className="bg-primary-100 border-b border-primary-300 sticky top-0 z-50 backdrop-blur-sm animate-slide-in">
            <div className="container mx-auto px-3 lg:px-4 py-2.5">
                <div className="flex justify-between items-center">
                    {/* Logo/Brand */}
                    <Link href="/app" className="flex items-center gap-2.5 group">
                        <div className="relative">
                            <div className="bg-primary-400 p-1.5 rounded-md transition-all duration-200 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-primary-400/30">
                                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                        </div>
                        <span className="text-lg font-semibold text-text-primary bg-gradient-to-r from-primary-400 to-secondary-400 bg-clip-text text-transparent">
                            Ggomruk
                        </span>
                    </Link>

                    {/* Mobile menu button */}
                    <div className="block lg:hidden">
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className="text-text-primary focus:outline-none hover:text-primary-400 p-1.5 transition-all duration-200 hover:scale-110"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className={`w-full lg:flex lg:items-center lg:w-auto ${isOpen ? 'block' : 'hidden'}`}>
                    <ul className="lg:flex lg:space-x-1 lg:items-center">
                        <li>
                            <Link href="/app" className="block text-text-secondary text-sm py-1.5 px-3 hover:text-text-primary hover:bg-primary-200 rounded-md transition-all">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/app/backtest" className="block text-text-secondary text-sm py-1.5 px-3 hover:text-text-primary hover:bg-primary-200 rounded-md transition-all">
                                Backtest
                            </Link>
                        </li>
                        <li>
                            <Link href="/app/history" className="block text-text-secondary text-sm py-1.5 px-3 hover:text-text-primary hover:bg-primary-200 rounded-md transition-all duration-200 hover:translate-x-1">
                                History
                            </Link>
                        </li>
                        
                        {/* User Menu */}
                        {isAuthenticated && user && (
                            <>
                                <li className="block text-text-secondary py-1.5 px-3 lg:ml-4">
                                    <span className="text-xs">
                                        <span className="text-text-tertiary">Welcome, </span>
                                        <span className="font-medium text-text-primary">{user.username}</span>
                                    </span>
                                </li>
                                <li>
                                    <button
                                        onClick={logout}
                                        className="block w-full text-left lg:w-auto bg-error hover:brightness-110 text-white text-xs py-1.5 px-3 rounded-md transition-all duration-200 hover:shadow-lg hover:shadow-error/30 hover:-translate-y-0.5"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;