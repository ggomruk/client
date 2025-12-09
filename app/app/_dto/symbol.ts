
export interface ISymbolData {
    eventTime: number;
    symbol: string;
    priceChange: number;
    priceChangePercent: number;
    lastPrice: number;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    quantity: number;
}

export class SymbolData implements ISymbolData {
    eventTime: number;
    symbol: string;
    priceChange: number;
    priceChangePercent: number;
    lastPrice: number;
    openPrice: number;
    highPrice: number;
    lowPrice: number;
    quantity: number;

    constructor(eventTime: number, symbol: string, priceChange: number, priceChangePercent: number, lastPrice: number, openPrice: number, highPrice: number, lowPrice: number, quantity: number) {
        this.eventTime = eventTime;
        this.symbol = symbol;
        this.priceChange = priceChange;
        this.priceChangePercent = priceChangePercent;
        this.lastPrice = lastPrice;
        this.openPrice = openPrice;
        this.highPrice = highPrice;
        this.lowPrice = lowPrice;
        this.quantity = quantity;
    }
}