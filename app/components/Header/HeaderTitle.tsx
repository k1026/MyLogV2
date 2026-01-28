import React from 'react';
import { cn } from '../../lib/utils';
import { RefreshCw } from 'lucide-react';

interface HeaderTitleProps {
    onReset: () => void;
    isDbLoading: boolean;
    version?: string;
}

export const HeaderTitle: React.FC<HeaderTitleProps> = ({
    onReset,
    isDbLoading,
    version = "v2.0.0"
}) => {
    return (
        <div className="flex flex-col cursor-pointer group" onClick={onReset} role="button" aria-label="Reset App">
            <div className="relative">
                {/* Base Logo (Deep Purple) */}
                <h1 className="text-xl font-black text-purple-300 font-sans tracking-tight">
                    MyLog
                </h1>

                {/* Overlay Logo (White/Filled) for Loading Progress */}
                {/* If simple boolean, we can just animate opacity or clip-path loop */}
                {isDbLoading && (
                    <h1 className="absolute inset-0 text-xl font-black text-purple-600 font-sans tracking-tight animate-pulse overflow-hidden">
                        MyLog
                    </h1>
                )}

                {/* 
                   Note: For "real" progress bar effect (clip-path), we would need a progress % prop.
                   Since we only have boolean `isLoading` currently, we use valid visual feedback (pulse/color change).
                   The spec mentions "clip-path" specifically, so if we can mock it:
                */}
                <div
                    className={cn(
                        "absolute inset-0 text-xl font-black text-purple-600 font-sans tracking-tight overflow-hidden transition-all duration-300",
                        isDbLoading ? "animate-[clip-loading_2s_ease-in-out_infinite]" : "h-0"
                    )}
                    style={{ clipPath: 'inset(0 0 0 0)' }} // This would be dynamic with %
                >
                    {/* If we strictly follow clip-path wiping from bottom: */}
                </div>
            </div>

            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase opacity-50 group-hover:opacity-100 transition-opacity">
                {version}
            </span>

            <style jsx global>{`
                @keyframes clip-loading {
                    0% { clip-path: inset(100% 0 0 0); }
                    50% { clip-path: inset(0 0 0 0); }
                    100% { clip-path: inset(0 0 0 0); opacity: 0; }
                }
            `}</style>
        </div>
    );
};
