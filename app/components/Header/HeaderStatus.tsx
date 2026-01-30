import React from 'react';
import { useLocation } from '../../contexts/LocationContext';
import { cn } from '../../lib/utils';
import { MaterialIcon } from '../ui/MaterialIcon';

interface HeaderStatusProps {
    cardCount: number;
    cellCount: number;
}

export const HeaderStatus: React.FC<HeaderStatusProps> = ({ cardCount, cellCount }) => {
    const { status, toggleLocation } = useLocation();

    return (
        <div className="flex flex-col items-start gap-1">
            <button
                onClick={toggleLocation}
                className={cn(
                    "p-1.5 rounded-full transition-all duration-300",
                    status === 'active' && "text-slate-500",
                    status === 'loading' && "text-slate-400 cursor-wait",
                    status === 'error' && "text-red-500",
                    status === 'idle' && "text-slate-400"
                )}
                title={`Location: ${status}`}
                aria-label="Location Status"
            >
                {status === 'loading' ? (
                    <MaterialIcon icon="progress_activity" size={16} className="animate-spin" />
                ) : status === 'error' ? (
                    <MaterialIcon icon="location_off" size={16} className="text-red-500" fill />
                ) : (
                    <MaterialIcon
                        icon="location_on"
                        size={16}
                        fill={status === 'active' || status === 'idle'}
                        className={cn(
                            status === 'active' && "text-purple-300",
                            status === 'idle' && "text-white"
                        )}
                    />
                )}
            </button>

            <div className="flex flex-col items-start text-slate-500 font-bold tracking-widest uppercase leading-tight">
                <div className="text-[10px] whitespace-nowrap">CARDS: {cardCount}</div>
                <div className="text-[10px] whitespace-nowrap">CELLS: {cellCount}</div>
            </div>
        </div>
    );
};

