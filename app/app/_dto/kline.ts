
export interface IKlineData {
    open: number;
    high: number;
    low: number;
    close: number;
    time: number;
}

export class Kline implements IKlineData{
    open: number;
    high: number;
    low: number;
    close: number;
    time: number;

    constructor(open: number, high: number, low: number, close: number, time: number) {
        this.open = open;
        this.high = high;
        this.low = low;
        this.close = close;
        this.time = time;
    }
}