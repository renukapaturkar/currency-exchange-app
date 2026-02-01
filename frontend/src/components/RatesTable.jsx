import React from 'react';

const RatesTable = ({ rates, base }) => {
    // Common currencies to display
    const priorityCurrencies = ['USD', 'EUR', 'GBP', 'JPY', 'AUD', 'CAD', 'CHF', 'CNY', 'INR'];

    const displayRates = Object.entries(rates)
        .filter(([currency]) => priorityCurrencies.includes(currency) && currency !== base)
        .sort((a, b) => a[0].localeCompare(b[0]));

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                <h3 className="font-semibold text-slate-800">Exchange Rates</h3>
                <p className="text-xs text-slate-500">1 {base} equals</p>
            </div>
            <div className="divide-y divide-slate-100">
                {displayRates.map(([currency, rate]) => (
                    <div key={currency} className="px-6 py-3 flex justify-between items-center hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-3">
                            <span className="font-mono font-medium text-slate-700">{currency}</span>
                        </div>
                        <span className="font-semibold text-slate-900">{rate.toFixed(4)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default RatesTable;
