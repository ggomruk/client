
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
            <div className="min-h-screen bg-gray-900">
                <Navbar />
                
                {/* Main Dashboard Container */}
                <div className='container mx-auto px-4 py-6'>
                    {/* Market Overview Panel */}
                    <Panel />
                    
                    {/* Chart Section */}
                    <div className="mt-6">
                        <FinancialChart />
                    </div>
                    
                    {/* Strategy and History Section */}
                    <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Backtest Strategy Panel */}
                        <div className="lg:col-span-1">
                            <Backtest />
                        </div>
                        
                        {/* Signal Trading Panel */}
                        <div className="lg:col-span-1">
                            <Forward />
                        </div>
                        
                        {/* History Panel */}
                        <div className="lg:col-span-1">
                            <History />
                        </div>
                    </div>
                </div>
            </div>
        </WebsocketProvider>
    )
}

export default AppPage