import { Strategy } from "../_type/startegy";

export const strategyList : Strategy[] = [
    { name: 'Moving Average Convergence Divergence', symbol: 'MACD', params: ['ema_s', 'ema_l', 'signal_mw'] },
    { name: 'Bollinger Band', symbol: 'BB', params: ['sma', 'dev'] },
    { name: 'Simple Moving Average', symbol: 'SMA', params: ['sma_s', 'sma_m', 'sma_l'] },
    { name: 'Relative Strength Index', symbol: 'RSI', params: ['periods', 'rsi_upper', 'rsi_lower'] },
    { name: 'RV', symbol: 'RV', params: ['volume_thresh_low', 'volume_thresh_high', 'return_thresh_low', 'return_thresh_high'] },
    { name: 'SO', symbol: 'SO', params: ['periods', 'd_mw'] },
];
