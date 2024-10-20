import { Strategy } from "../_type/startegy";

export const strategyList : Strategy[] = [
    { name: 'Moving Average Convergence Divergence', symbol: 'MACD', params: ['short', 'long', 'signal'] },
    { name: 'Bollinger Band', symbol: 'BB', params: ['sma', 'dev'] },
    { name: 'Simple Moving Average', symbol: 'SMA', params: ['sma S', 'sma M', 'sma L'] },
    { name: 'Relative Strength Index', symbol: 'RSI', params: ['periods', 'rsi upper', 'rsi lower'] },
    { name: 'RV', symbol: 'RV', params: ['volume low', 'volume high', 'return low', 'return high'] },
    { name: 'SO', symbol: 'SO', params: ['period', 'd_mw'] },
];
