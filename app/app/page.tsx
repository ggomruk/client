
import React from 'react'
import Panel from './_components/Panel'
import { WebsocketProvider } from './_provider/binance.websocket'
import FinancialChart from './_components/Chart'
import { ServerWebsocketProvider } from './_provider/server.websocket'
import WebsocketComponent from './_components/WebsocketComponent'

const AppPage = () => {
    return (
        <ServerWebsocketProvider>
            <WebsocketProvider>
                <div className='mx-6'>
                    <Panel />
                    <FinancialChart />
                    <WebsocketComponent />
                </div>
            </WebsocketProvider>
        </ServerWebsocketProvider>
    )
}

export default AppPage