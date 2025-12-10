
export interface Strategy {
    name: string;
    symbol: string;
    params: string[];
}

export interface UserStrategy {
    name: string;
    params: { [key: string]: number };
}
