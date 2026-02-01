'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { FilterSettings, DEFAULT_FILTER_SETTINGS, FilterAttribute, FilterTarget } from '../lib/models/filter';

interface FilterContextType {
    filterSettings: FilterSettings;
    setAttributes: (attributes: FilterAttribute[]) => void;
    setIncludeKeywords: (keywords: string[]) => void;
    setExcludeKeywords: (keywords: string[]) => void;
    setKeywordTarget: (target: FilterTarget) => void;
    setDateRange: (from: string | null, to: string | null) => void;
    resetFilter: () => void;
    isFilterActive: boolean;
}

const FilterContext = createContext<FilterContextType | undefined>(undefined);

export const FilterProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [filterSettings, setFilterSettings] = useState<FilterSettings>(DEFAULT_FILTER_SETTINGS);

    const setAttributes = useCallback((attributes: FilterAttribute[]) => {
        setFilterSettings((prev) => ({ ...prev, attributes }));
    }, []);

    const setIncludeKeywords = useCallback((include: string[]) => {
        setFilterSettings((prev) => ({
            ...prev,
            keywords: { ...prev.keywords, include },
        }));
    }, []);

    const setExcludeKeywords = useCallback((exclude: string[]) => {
        setFilterSettings((prev) => ({
            ...prev,
            keywords: { ...prev.keywords, exclude },
        }));
    }, []);

    const setKeywordTarget = useCallback((target: FilterTarget) => {
        setFilterSettings((prev) => ({
            ...prev,
            keywords: { ...prev.keywords, target },
        }));
    }, []);

    const setDateRange = useCallback((from: string | null, to: string | null) => {
        setFilterSettings((prev) => ({
            ...prev,
            dateRange: { from, to },
        }));
    }, []);

    const resetFilter = useCallback(() => {
        setFilterSettings(DEFAULT_FILTER_SETTINGS);
    }, []);

    const isFilterActive =
        filterSettings.keywords.include.length > 0 ||
        filterSettings.keywords.exclude.length > 0 ||
        filterSettings.dateRange.from !== null ||
        filterSettings.dateRange.to !== null ||
        filterSettings.attributes.length !== DEFAULT_FILTER_SETTINGS.attributes.length ||
        !filterSettings.attributes.every(attr => DEFAULT_FILTER_SETTINGS.attributes.includes(attr));

    return (
        <FilterContext.Provider
            value={{
                filterSettings,
                setAttributes,
                setIncludeKeywords,
                setExcludeKeywords,
                setKeywordTarget,
                setDateRange,
                resetFilter,
                isFilterActive,
            }}
        >
            {children}
        </FilterContext.Provider>
    );
};

export const useFilter = () => {
    const context = useContext(FilterContext);
    if (context === undefined) {
        throw new Error('useFilter must be used within a FilterProvider');
    }
    return context;
};
