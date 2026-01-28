import React from 'react';
import { cn } from '../../lib/utils';
import { Database, Shuffle, Loader2 } from 'lucide-react';

interface HeaderActionsProps {
    onRandomPick: () => void;
    onDbOpen: () => void;
    isDbLoading: boolean;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
    onRandomPick,
    onDbOpen,
    isDbLoading
}) => {
    return (
        <div className="flex items-center gap-3">
            <button
                onClick={onRandomPick}
                className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-slate-200 text-slate-400 hover:text-purple-600 hover:border-purple-200 hover:bg-purple-50 transition-all shadow-sm active:scale-95"
                aria-label="Random Pick"
                title="Random Pick"
            >
                <Shuffle size={20} />
            </button>

            <button
                onClick={onDbOpen}
                className={cn(
                    "w-10 h-10 flex flex-col items-center justify-center rounded-xl transition-all border shadow-sm active:scale-95 relative overflow-hidden",
                    isDbLoading
                        ? "text-purple-600 border-purple-500/30 bg-purple-500/10"
                        : "text-slate-400 border-slate-200 hover:bg-slate-50 hover:text-slate-600"
                )}
                aria-label="Database Viewer"
                title="Database Status"
            >
                {isDbLoading ? (
                    <>
                        <Database size={16} className="animate-pulse mb-0.5" />
                        <span className="text-[6px] font-bold uppercase tracking-tighter leading-none animate-pulse">Load</span>
                    </>
                ) : (
                    <Database size={20} />
                )}
            </button>
        </div>
    );
};
