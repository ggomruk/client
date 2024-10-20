'use client'
import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';

const History = () => {
    const [history, setHistory] = useState<string | null>(null);

    return (
        <div className="flex flex-col mr-3 p-3 text-white border border-solid border-opacity-70 border-gray-500 rounded-xl shadow w-1/2 bg-primary-container-dark">
            <div className='px-2 h-full'>
                <div className='text-2xl pb-2'>History</div>
                {history ? (
                    <div>History list</div>
                ) : (
                    <div className="w-full h-full flex flex-col justify-center items-center">
                        <FontAwesomeIcon icon={faTimesCircle} size="3x" className="mb-2 text-red-500" />
                        <div>No records</div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default History;