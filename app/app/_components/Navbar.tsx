'use client';

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuth();

    return (
        <nav className="bg-gray-800 p-4 shadow-lg">
            <div className="container mx-auto flex justify-between items-center">
                {/* Logo/Brand */}
                <Link href="/app" className="text-white text-xl font-bold hover:text-indigo-300 transition-colors">
                    Ggomruk
                </Link>

                {/* Mobile menu button */}
                <div className="block lg:hidden">
                    <button 
                        onClick={() => setIsOpen(!isOpen)} 
                        className="text-white focus:outline-none hover:text-indigo-300"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16m-7 6h7"}></path>
                        </svg>
                    </button>
                </div>

                {/* Navigation Links */}
                <div className={`w-full lg:flex lg:items-center lg:w-auto ${isOpen ? 'block' : 'hidden'}`}>
                    <ul className="lg:flex lg:space-x-4 lg:items-center">
                        <li>
                            <Link href="/app" className="block text-white py-2 px-4 hover:text-indigo-300 transition-colors">
                                Dashboard
                            </Link>
                        </li>
                        <li>
                            <Link href="/app/backtest" className="block text-white py-2 px-4 hover:text-indigo-300 transition-colors">
                                Backtest
                            </Link>
                        </li>
                        <li>
                            <Link href="/app/history" className="block text-white py-2 px-4 hover:text-indigo-300 transition-colors">
                                History
                            </Link>
                        </li>
                        
                        {/* User Menu */}
                        {isAuthenticated && user && (
                            <>
                                <li className="block text-gray-300 py-2 px-4 lg:border-l lg:border-gray-600">
                                    <span className="text-sm">
                                        <span className="text-gray-400">Welcome, </span>
                                        <span className="font-medium text-white">{user.username}</span>
                                    </span>
                                </li>
                                <li>
                                    <button
                                        onClick={logout}
                                        className="block w-full text-left lg:w-auto bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                                    >
                                        Logout
                                    </button>
                                </li>
                            </>
                        )}
                    </ul>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;