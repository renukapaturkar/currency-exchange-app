import React, { useState, useEffect } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { fetchRates } from './api';
import FreshnessIndicator from './components/FreshnessIndicator';
import RatesTable from './components/RatesTable';
import Converter from './components/Converter';
import { RefreshCw } from 'lucide-react';

function App() {
    const [ratesData, setRatesData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [baseCurrency, setBaseCurrency] = useState('USD');
    const [error, setError] = useState(null);

    const loadRates = async (base) => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchRates(base);
            setRatesData(data);
            toast.success(`Updated rates from ${data.source}`);
        } catch (err) {
            console.error(err);
            setError("Failed to fetch rates. Please check API keys or try again later.");
            toast.error("Failed to update rates");
        } finally {
            setLoading(false);
        }
    };

    // Load rates when baseCurrency changes
    useEffect(() => {
        loadRates(baseCurrency);
    }, [baseCurrency]);

    return (
        <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto">

                {/* Header */}
                <div className="mb-8 flex flex-col gap-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-slate-900">Currency Tracker</h1>
                            <p className="text-slate-500 mt-1">Real-time exchange rates & conversion</p>
                        </div>

                        <div className="flex items-center gap-3">
                            {ratesData && (
                                <FreshnessIndicator
                                    timestamp={ratesData.timestamp}
                                    source={ratesData.source}
                                />
                            )}
                            <button
                                onClick={() => loadRates(baseCurrency)}
                                disabled={loading}
                                className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                                title="Refresh Rates"
                            >
                                <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
                            </button>
                        </div>
                    </div>


                </div>

                {/* Content */}
                {error ? (
                    <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200">
                        {error}
                    </div>
                ) : !ratesData && loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                ) : ratesData ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Left Column: Converter */}
                        <div className="md:col-span-1">
                            <Converter
                                rates={ratesData.rates}
                                base={baseCurrency}
                                onBaseChange={setBaseCurrency}
                            />
                        </div>

                        {/* Right Column: Table */}
                        <div className="md:col-span-2">
                            <RatesTable rates={ratesData.rates} base={baseCurrency} />
                        </div>
                    </div>
                ) : null}

                <ToastContainer position="bottom-right" />
            </div>
        </div>
    );
}

export default App;
