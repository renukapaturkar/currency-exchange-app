import React, { useState, useEffect } from 'react';
import { ArrowRightLeft } from 'lucide-react';

const Converter = ({ rates, base, onBaseChange }) => {
    const [amount, setAmount] = useState(1);
    const [targetCurrency, setTargetCurrency] = useState('EUR');

    // Ensure target is not base if possible, default to something else
    useEffect(() => {
        if (base === targetCurrency) {
            setTargetCurrency(base === 'USD' ? 'EUR' : 'USD');
        }
    }, [base]);

    const convertedValue = rates[targetCurrency]
        ? (amount * rates[targetCurrency]).toFixed(2)
        : '---';

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h3 className="font-semibold text-slate-800 mb-4">Currency Converter</h3>

            <div className="space-y-4">
                {/* Amount Input */}
                <div>
                    <label className="block text-sm font-medium text-slate-600 mb-1">Amount</label>
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-2">
                    {/* From Currency (Base) */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-600 mb-1">From</label>
                        <select
                            value={base}
                            onChange={(e) => onBaseChange(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {Object.keys(rates).sort().map(cur => (
                                <option key={cur} value={cur}>{cur}</option>
                            ))}
                        </select>
                    </div>

                    <div className="mt-6 text-slate-400">
                        <ArrowRightLeft size={20} />
                    </div>

                    {/* To Currency */}
                    <div className="flex-1">
                        <label className="block text-sm font-medium text-slate-600 mb-1">To</label>
                        <select
                            value={targetCurrency}
                            onChange={(e) => setTargetCurrency(e.target.value)}
                            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                        >
                            {Object.keys(rates).sort().map(cur => (
                                <option key={cur} value={cur}>{cur}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Result */}
                <div className="mt-6 p-4 bg-blue-50 rounded-lg text-center">
                    <p className="text-sm text-blue-600 mb-1">Converted Amount</p>
                    <p className="text-3xl font-bold text-blue-900">
                        {convertedValue} <span className="text-lg font-medium">{targetCurrency}</span>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Converter;
