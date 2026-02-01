'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'list' | 'enum';
export type FilterState = 'off' | 'on' | 'disabled';

interface UIStateContextType {
    sortOrder: SortOrder;
    toggleSortOrder: () => void;
    viewMode: ViewMode;
    toggleViewMode: () => void;
    filterState: FilterState;
    toggleFilterState: () => void;
    setFilterState: (state: FilterState) => void;
    headerVisible: boolean;
    setHeaderVisible: (visible: boolean) => void;
    footerVisible: boolean;
    setFooterVisible: (visible: boolean) => void;
    handleScroll: (scrollTop: number) => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export const UIStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
    const [viewMode, setViewMode] = React.useState<ViewMode>('list');
    const [filterState, setFilterState] = React.useState<FilterState>('off');
    const [headerVisible, setHeaderVisible] = React.useState(true);
    const [footerVisible, setFooterVisible] = React.useState(true);
    const [isInputFocused, setIsInputFocused] = useState(false);
    const lastScrollRef = useRef(0);
    const threshold = 50;

    // Scroll handler
    const handleScroll = useCallback((scrollTop: number) => {
        if (scrollTop > lastScrollRef.current && scrollTop > threshold) {
            setHeaderVisible(false);
            setFooterVisible(false);
        } else {
            setHeaderVisible(true);
            setFooterVisible(true);
        }
        lastScrollRef.current = scrollTop;
    }, []);

    // Focus handler
    const handleFocusIn = useCallback((e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
            setIsInputFocused(true);
        }
    }, []);

    const handleFocusOut = useCallback(() => {
        setIsInputFocused(false);
    }, []);

    useEffect(() => {
        const onScroll = () => handleScroll(window.scrollY);
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, [handleScroll]);

    useEffect(() => {
        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        return () => {
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
        };
    }, [handleFocusIn, handleFocusOut]);

    // Apply focus override
    const effectiveHeaderVisible = isInputFocused ? false : headerVisible;
    const effectiveFooterVisible = isInputFocused ? false : footerVisible;

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'list' ? 'enum' : 'list');
    };

    const toggleFilterState = () => {
        setFilterState(prev => {
            if (prev === 'off') return 'on';
            if (prev === 'on') return 'disabled';
            return 'off';
        });
    };

    const value: UIStateContextType = React.useMemo(() => ({
        sortOrder,
        toggleSortOrder,
        viewMode,
        toggleViewMode,
        filterState,
        toggleFilterState,
        setFilterState,
        headerVisible: effectiveHeaderVisible,
        setHeaderVisible,
        footerVisible: effectiveFooterVisible,
        setFooterVisible,
        handleScroll,
    }), [
        sortOrder,
        viewMode,
        filterState,
        effectiveHeaderVisible,
        effectiveFooterVisible,
        handleScroll
    ]);

    return (
        <UIStateContext.Provider value={value}>
            {children}
        </UIStateContext.Provider>
    );
};

export const useUIState = () => {
    const context = useContext(UIStateContext);
    if (context === undefined) {
        throw new Error('useUIState must be used within a UIStateProvider');
    }
    return context;
};
