import React from 'react';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';

const FreshnessIndicator = ({ timestamp, source }) => {
    if (!timestamp) return null;

    const now = Date.now() / 1000;
    const diffMinutes = Math.floor((now - timestamp) / 60);

    let statusColor = "text-green-600";
    let statusText = "Fresh";
    let Icon = CheckCircle;

    if (diffMinutes > 60) {
        statusColor = "text-red-500";
        statusText = "Stale";
        Icon = AlertTriangle;
    } else if (diffMinutes > 5) {
        statusColor = "text-yellow-600";
        statusText = "Recent";
        Icon = Clock;
    }

    return (
        <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm font-medium ${statusColor} bg-white px-3 py-1 rounded-full shadow-sm border border-slate-100`}>
            <div className="flex items-center gap-1">
                <Icon size={16} />
                <span>
                    {statusText} ({diffMinutes} mins ago)
                </span>
            </div>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="text-slate-500 text-xs sm:text-sm">
                Updated: {new Date(timestamp * 1000).toLocaleString()}
            </span>
            <span className="hidden sm:inline text-slate-300">|</span>
            <span className="text-slate-600 text-xs sm:text-sm">Source: {source}</span>
        </div>
    );
};

export default FreshnessIndicator;
