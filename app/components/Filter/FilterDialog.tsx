'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { X, Calendar, RotateCcw, Check, Type, Tag, Search, Filter } from 'lucide-react';
import { FilterAttribute, FilterTarget, FilterSettings, DEFAULT_FILTER_SETTINGS } from '../../lib/models/filter';
import { useFilter } from '../../contexts/FilterContext';

interface FilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
    isOpen,
    onClose,
}) => {
    const { filterSettings, setAttributes, setIncludeKeywords, setExcludeKeywords, setKeywordTarget, setDateRange, resetFilter } = useFilter();

    // Dialog local state
    const [localAttributes, setLocalAttributes] = useState<FilterAttribute[]>(filterSettings.attributes);
    const [localInclude, setLocalInclude] = useState<string>(filterSettings.keywords.include.join(' '));
    const [localExclude, setLocalExclude] = useState<string>(filterSettings.keywords.exclude.join(' '));
    const [localTarget, setLocalTarget] = useState<FilterTarget>(filterSettings.keywords.target);
    const [localFrom, setLocalFrom] = useState<string | null>(filterSettings.dateRange.from);
    const [localTo, setLocalTo] = useState<string | null>(filterSettings.dateRange.to);

    // Sync from context when opened
    useEffect(() => {
        if (isOpen) {
            setLocalAttributes(filterSettings.attributes);
            setLocalInclude(filterSettings.keywords.include.join(' '));
            setLocalExclude(filterSettings.keywords.exclude.join(' '));
            setLocalTarget(filterSettings.keywords.target);
            setLocalFrom(filterSettings.dateRange.from);
            setLocalTo(filterSettings.dateRange.to);
        }
    }, [isOpen, filterSettings]);

    if (!isOpen) return null;

    const toggleAttribute = (attr: FilterAttribute) => {
        if (localAttributes.includes(attr)) {
            setLocalAttributes(localAttributes.filter(a => a !== attr));
        } else {
            setLocalAttributes([...localAttributes, attr]);
        }
    };

    const nextTarget = () => {
        const targets: FilterTarget[] = ['both', 'name', 'value'];
        const currentIndex = targets.indexOf(localTarget);
        setLocalTarget(targets[(currentIndex + 1) % targets.length]);
    };

    const getTargetLabel = (target: FilterTarget) => {
        switch (target) {
            case 'both': return '両方';
            case 'name': return '名前';
            case 'value': return '値';
        }
    };

    const handleApply = () => {
        setAttributes(localAttributes);
        setIncludeKeywords(localInclude.trim().split(/\s+/).filter(k => k.length > 0));
        setExcludeKeywords(localExclude.trim().split(/\s+/).filter(k => k.length > 0));
        setKeywordTarget(localTarget);
        setDateRange(localFrom, localTo);
        onClose();
    };

    const handleReset = () => {
        resetFilter();
        // Also reset local state
        setLocalAttributes(DEFAULT_FILTER_SETTINGS.attributes);
        setLocalInclude('');
        setLocalExclude('');
        setLocalTarget(DEFAULT_FILTER_SETTINGS.keywords.target);
        setLocalFrom(null);
        setLocalTo(null);
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
                {/* Header */}
                <div className="p-6 pb-2 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center">
                            <Filter size={20} />
                        </div>
                        <h2 className="text-xl font-bold tracking-tight">Filter Settings</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/70 transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 pt-4 space-y-6">
                    {/* Attributes */}
                    <div className="space-y-3">
                        <label className="text-white/60 text-xs font-bold uppercase tracking-widest pl-1">属性選択</label>
                        <div className="flex gap-2">
                            {(['Text', 'Task', 'Remove'] as FilterAttribute[]).map(attr => (
                                <button
                                    key={attr}
                                    onClick={() => toggleAttribute(attr)}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all border border-white/40",
                                        localAttributes.includes(attr)
                                            ? "bg-white text-purple-700 shadow-lg"
                                            : "bg-white/10 text-white/50 hover:bg-white/20"
                                    )}
                                >
                                    {attr}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Keywords Include */}
                    <div className="space-y-3">
                        <label className="text-white/60 text-xs font-bold uppercase tracking-widest pl-1">キーワード抽出</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-300" size={18} />
                                <input
                                    type="text"
                                    value={localInclude}
                                    onChange={(e) => setLocalInclude(e.target.value)}
                                    placeholder="キーワード (スペース区切り)"
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                                />
                            </div>
                            <button
                                onClick={nextTarget}
                                className="px-4 bg-white/10 border border-white/20 rounded-2xl text-white text-xs font-bold hover:bg-white/20 transition-all min-w-[4rem]"
                            >
                                {getTargetLabel(localTarget)}
                            </button>
                        </div>
                    </div>

                    {/* Keywords Exclude */}
                    <div className="space-y-3">
                        <label className="text-white/60 text-xs font-bold uppercase tracking-widest pl-1">キーワード除外</label>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-red-300" size={18} />
                            <input
                                type="text"
                                value={localExclude}
                                onChange={(e) => setLocalExclude(e.target.value)}
                                placeholder="除外キーワード"
                                className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 pl-11 pr-4 text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div className="space-y-3">
                        <label className="text-white/60 text-xs font-bold uppercase tracking-widest pl-1">期間フィルタ</label>
                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <input
                                    type="date"
                                    value={localFrom || ''}
                                    onChange={(e) => setLocalFrom(e.target.value || null)}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none [color-scheme:dark]"
                                />
                            </div>
                            <span className="text-white/40">~</span>
                            <div className="relative flex-1">
                                <input
                                    type="date"
                                    value={localTo || ''}
                                    onChange={(e) => setLocalTo(e.target.value || null)}
                                    className="w-full bg-white/10 border border-white/20 rounded-2xl py-3 px-4 text-white text-sm focus:outline-none [color-scheme:dark]"
                                />
                            </div>
                            <button
                                onClick={() => { setLocalFrom(null); setLocalTo(null); }}
                                className="w-10 h-10 flex items-center justify-center bg-white/10 rounded-xl text-white/50 hover:bg-white/20"
                            >
                                <RotateCcw size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-black/10 backdrop-blur-md flex gap-3">
                    <button
                        onClick={handleReset}
                        className="flex-1 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                        <RotateCcw size={18} />
                        リセット
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-[2] py-4 bg-white text-purple-700 hover:bg-purple-50 font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        <Check size={20} />
                        適用する
                    </button>
                </div>
            </div>
        </div>
    );
};
