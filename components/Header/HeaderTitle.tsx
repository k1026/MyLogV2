import React from 'react';
import { cn } from '../../lib/utils';

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
        <div className="flex flex-col items-center cursor-pointer group" onClick={onReset} role="button" aria-label="Reset App">
            <div className="relative">
                {/* Base Logo (Deep Purple) */}
                <h1 className="text-lg font-black text-purple-300 font-sans tracking-tight">
                    MyLog
                </h1>

                {/* Overlay Logo for Loading Progress */}
                {isDbLoading && (
                    <h1 className="absolute inset-0 text-lg font-black text-purple-600 font-sans tracking-tight animate-clip-loading overflow-hidden">
                        MyLog
                    </h1>
                )}
            </div>

            <span className="text-[10px] text-slate-400 font-bold tracking-widest uppercase opacity-50 group-hover:opacity-100 transition-opacity">
                {version}
            </span>


        </div>
    );
};
