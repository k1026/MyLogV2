'use client';

import React, { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { MaterialIcon } from '../ui/MaterialIcon';
import { FilterAttribute, FilterTarget, FilterSettings, DEFAULT_FILTER_SETTINGS } from '../../lib/models/filter';
import { useFilter } from '../../contexts/FilterContext';
import { useUIState } from '../../contexts/UIStateContext';

interface FilterDialogProps {
    isOpen: boolean;
    onClose: () => void;
}

export const FilterDialog: React.FC<FilterDialogProps> = ({
    isOpen,
    onClose,
}) => {
    const { filterSettings, setAttributes, setIncludeKeywords, setExcludeKeywords, setKeywordTarget, setDateRange, resetFilter } = useFilter();
    const { setFilterState } = useUIState();

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
        setFilterState('on');
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
        setFilterState('off');
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                onClick={onClose}
            />

            <div className="relative w-full max-w-md bg-gradient-to-br from-purple-600 via-purple-700 to-indigo-800 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300 border border-white/20">
                {/* Header */}
                <div className="p-6 pb-2 flex items-center justify-between text-white">
                    <div className="flex items-center gap-3">
                        <MaterialIcon icon="filter_alt" size={24} className="text-white" />
                    </div>
                    <button
                        onClick={onClose}
                        className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white/70 transition-colors"
                    >
                        <MaterialIcon icon="close" size={24} />
                    </button>
                </div>

                <div className="p-6 pt-4 space-y-[12px]">
                    {/* Attributes */}
                    <div>
                        <div className="flex gap-[12px]">
                            {(['Text', 'Task', 'Remove'] as FilterAttribute[]).map(attr => (
                                <button
                                    key={attr}
                                    onClick={() => toggleAttribute(attr)}
                                    className={cn(
                                        "flex-1 py-3 px-4 rounded-2xl text-sm font-bold transition-all",
                                        localAttributes.includes(attr)
                                            ? "bg-purple-600 text-white shadow-md"
                                            : "bg-white/40 text-purple-300 hover:bg-white/60"
                                    )}
                                >
                                    {attr}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Keywords Include */}
                    <div>
                        <div className="flex gap-[12px]">
                            <div className="relative flex-1">
                                <MaterialIcon icon="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200" />
                                <input
                                    type="text"
                                    value={localInclude}
                                    onChange={(e) => setLocalInclude(e.target.value)}
                                    placeholder="キーワード (スペース区切り)"
                                    className="w-full bg-white border-none rounded-2xl py-3 pl-11 pr-4 text-purple-600 placeholder:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-100"
                                />
                            </div>
                            <button
                                onClick={nextTarget}
                                className="px-4 bg-white rounded-2xl text-purple-400 text-xs font-bold hover:bg-purple-50 transition-all min-w-[4rem]"
                            >
                                {getTargetLabel(localTarget)}
                            </button>
                        </div>
                    </div>

                    {/* Keywords Exclude */}
                    <div>
                        <div className="relative">
                            <MaterialIcon icon="search" size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-200" />
                            <input
                                type="text"
                                value={localExclude}
                                onChange={(e) => setLocalExclude(e.target.value)}
                                placeholder="除外キーワード"
                                className="w-full bg-white border-none rounded-2xl py-3 pl-11 pr-4 text-purple-600 placeholder:text-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-100"
                            />
                        </div>
                    </div>

                    {/* Date Range */}
                    <div>
                        <div className="flex items-center gap-[12px]">
                            <div className="relative flex-1">
                                <input
                                    type="date"
                                    value={localFrom || ''}
                                    onChange={(e) => setLocalFrom(e.target.value || null)}
                                    className="w-full bg-white border-none rounded-2xl py-3 px-4 text-purple-600 text-sm focus:outline-none [color-scheme:light]"
                                />
                            </div>
                            <span className="text-white/40 text-lg">~</span>
                            <div className="relative flex-1">
                                <input
                                    type="date"
                                    value={localTo || ''}
                                    onChange={(e) => setLocalTo(e.target.value || null)}
                                    className="w-full bg-white border-none rounded-2xl py-3 px-4 text-purple-600 text-sm focus:outline-none [color-scheme:light]"
                                />
                            </div>
                            <button
                                onClick={() => { setLocalFrom(null); setLocalTo(null); }}
                                className="w-10 h-10 flex items-center justify-center bg-white rounded-xl text-purple-600 hover:bg-purple-50"
                            >
                                <MaterialIcon icon="restart_alt" size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-black/10 backdrop-blur-md flex gap-[12px]">
                    <button
                        onClick={handleReset}
                        className="flex-1 py-4 bg-white hover:bg-purple-50 text-purple-400 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                    >
                        <MaterialIcon icon="restart_alt" size={18} />
                        リセット
                    </button>
                    <button
                        onClick={handleApply}
                        className="flex-1 py-4 bg-white text-purple-700 hover:bg-purple-50 font-bold rounded-2xl transition-all shadow-xl flex items-center justify-center gap-2"
                    >
                        <MaterialIcon icon="check" size={20} />
                        ✓適用
                    </button>
                </div>
            </div>
        </div>
    );
};
