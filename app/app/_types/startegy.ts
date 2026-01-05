
export interface StrategyParam {
    name: string;
    label: string;
    type: 'number' | 'select' | 'boolean';
    min?: number;
    max?: number;
    default?: number;
    step?: number;
    options?: string[];
    explanation?: string;
}

export interface Strategy {
    name: string;
    symbol: string;
    description?: string;
    signal?: string;
    requirements?: string;
    params: StrategyParam[];
}

export interface UserStrategy {
    name: string;
    params: { [key: string]: number };
}
