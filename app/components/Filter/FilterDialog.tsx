'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { X } from 'lucide-react';

interface FilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
    isOpen,
    onClose,
}) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Filter Settings</h2>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8">
                    <div className="flex flex-col items-center justify-center gap-4 text-center">
                        <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600">
                            {/* Filter Icon Placeholder */}
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon></svg>
                        </div>
                        <p className="text-slate-500 font-medium">フィルタ機能は現在開発中です。<br />将来のアップデートをお楽しみに！</p>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold rounded-xl transition-all"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};
