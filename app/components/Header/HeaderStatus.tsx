import React from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { cn } from '../../lib/utils';
import { MapPin, Loader2, AlertCircle } from 'lucide-react';

interface HeaderStatusProps {
    cardCount: number;
    totalCardCount: number;
}

export const HeaderStatus: React.FC<HeaderStatusProps> = ({ cardCount, totalCardCount }) => {
    const { status, toggleLocation } = useLocation();

    return (
        <div className="flex flex-col items-center justify-center mx-4">
            <div className="flex items-center gap-2 mb-1">
                <button
                    onClick={toggleLocation}
                    className={cn(
                        "p-1.5 rounded-full transition-all duration-300",
                        status === 'active' && "bg-purple-100 text-purple-600",
                        status === 'loading' && "bg-purple-50 text-purple-400 cursor-wait",
                        status === 'error' && "bg-red-50 text-red-500",
                        status === 'idle' && "text-slate-400 hover:bg-slate-100"
                    )}
                    title={`Location: ${status}`}
                >
                    {status === 'loading' ? (
                        <Loader2 size={16} className="animate-spin" />
                    ) : status === 'error' ? (
                        <AlertCircle size={16} />
                    ) : (
                        <MapPin size={16} className={cn(status === 'active' && "fill-current")} />
                    )}
                </button>
            </div>

            <div className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                Cards: {cardCount} <span className="text-slate-300 mx-1">/</span> Total: {totalCardCount}
            </div>
        </div>
    );
};
