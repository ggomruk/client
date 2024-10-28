import React from 'react'

interface IStrategyInputButton<T> {
    val: T;
    setVal: React.Dispatch<React.SetStateAction<T>>;
    focusState: {[key: string]: boolean};
    label: string;
    unit: string;
}

const StrategyInputButton= <T,>({val, setVal, focusState, label, unit}: IStrategyInputButton<T>) => (
    <div className={`h-12 my-5 flex flex-col justify-center w-full rounded-full border ${focusState[label] ? 'border-white' : 'border-gray-400'} bg-primary-container`}>
        <div className="p-3 flex items-center">
            <span>{label}</span>
            <input
                className="bg-transparent mx-2 text-right focus:outline-none w-full no-spinners"
                type="number"
                value={val as unknown}
                min="0"
                onChange={(e) => setVal(e.target.value as unknown as T)}
                onFocus={() => handleFocus(label)}
                onBlur={() => handleBlur(label)} />
            <span>{unit}</span>
        </div>
    </div>
)

export default StrategyInputButton