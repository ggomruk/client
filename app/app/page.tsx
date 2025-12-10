
import React from 'react'
import Panel from './_components/Panel'
import { WebsocketProvider } from './_provider/binance.websocket'
import FinancialChart from './_components/Chart'
import Backtest from './_components/Backtest'
import Forward from './_components/Forward'
import History from './_components/History'
import Navbar from './_components/Navbar'

const AppPage = () => {
    return (
        <WebsocketProvider>
            <div className="min-h-screen bg-primary-50 flex flex-col">
                <Navbar />
                
                {/* Main Trading View Layout */}
                <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Top Panel - Symbol Info (like TradingView header) */}
                    <div className="border-b border-primary-300">
                        <Panel />
                    </div>
                    
                    {/* Main Content Area - Split between Chart and Right Sidebar */}
                    <div className="flex-1 flex overflow-hidden">
                        {/* Chart Area - Takes most space (like #2 in reference) */}
                        <div className="flex-1 flex flex-col min-w-0">
                            <FinancialChart />
                        </div>
                        
                        {/* Right Sidebar - Market Data/Crypto List (like #3 Order Book area) */}
                        <div className="w-80 border-l border-primary-300 hidden lg:block overflow-hidden">
                            <History />
                        </div>
                    </div>
                    
                    {/* Bottom Panel - Trading Controls (like #4, #5, #6) */}
                    <div className="border-t border-primary-300">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 p-3">
                            <Backtest />
                            <Forward />
                        </div>
                    </div>
                </div>
            </div>
        </WebsocketProvider>
    )
}

export default AppPage