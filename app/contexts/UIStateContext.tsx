'use client';

import React, { createContext, useContext } from 'react';

export type SortOrder = 'asc' | 'desc';
export type ViewMode = 'list' | 'grid';
export type FilterState = 'off' | 'on' | 'disabled';

interface UIStateContextType {
    sortOrder: SortOrder;
    toggleSortOrder: () => void;
    viewMode: ViewMode;
    toggleViewMode: () => void;
    filterState: FilterState;
    toggleFilterState: () => void;
}

const UIStateContext = createContext<UIStateContextType | undefined>(undefined);

export const UIStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc');
    const [viewMode, setViewMode] = React.useState<ViewMode>('list');
    const [filterState, setFilterState] = React.useState<FilterState>('off');

    const toggleSortOrder = () => {
        setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    };

    const toggleViewMode = () => {
        setViewMode(prev => prev === 'list' ? 'grid' : 'list');
    };

    const toggleFilterState = () => {
        setFilterState(prev => {
            if (prev === 'off') return 'on';
            if (prev === 'on') return 'disabled';
            return 'off';
        });
    };

    const value: UIStateContextType = {
        sortOrder,
        toggleSortOrder,
        viewMode,
        toggleViewMode,
        filterState,
        toggleFilterState,
    };

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
