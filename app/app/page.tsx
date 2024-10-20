
import React from 'react'
import Panel from './_components/Panel'
import { WebsocketProvider } from './_context/websocket.context'
import FinancialChart from './_components/Chart'
import Backtest from './_components/Backtest'
import Forward from './_components/Forward'
import History from './_components/History'

const AppPage = () => {
    return (
        <WebsocketProvider>
            <Panel />
            <FinancialChart />
            <div className="m-6 mb-0 py-3 flex">
                <Backtest />
                <Forward />
                <History />
            </div>
        </WebsocketProvider>
    )
}

export default AppPage