'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SortMode = 'none' | 'asc' | 'desc';
export type TaskSortMode = 'none' | 'incomplete' | 'complete';

interface CardSortContextType {
    sortMode: SortMode;
    taskSortMode: TaskSortMode;
    isManualSort: boolean;
    toggleSort: () => void;
    toggleTaskSort: () => void;
    setManualSort: () => void;
}

const CardSortContext = createContext<CardSortContextType | undefined>(undefined);

export const CardSortProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [sortMode, setSortMode] = useState<SortMode>('desc');
    const [taskSortMode, setTaskSortMode] = useState<TaskSortMode>('none');
    const [isManualSort, setIsManualSort] = useState(false);

    const toggleSort = () => {
        setIsManualSort(false);
        setSortMode(prev => {
            if (prev === 'desc') return 'asc';
            return 'desc';
        });
    };

    const toggleTaskSort = () => {
        setIsManualSort(false);
        setTaskSortMode(prev => {
            if (prev === 'none') return 'complete';
            if (prev === 'complete') return 'incomplete';
            return 'none';
        });
    };

    const setManualSort = () => {
        setIsManualSort(prev => {
            const next = !prev;
            if (next) {
                setSortMode('none');
                setTaskSortMode('none');
            } else {
                setSortMode('desc');
            }
            return next;
        });
    };

    const value = React.useMemo(() => ({
        sortMode,
        taskSortMode,
        isManualSort,
        toggleSort,
        toggleTaskSort,
        setManualSort
    }), [sortMode, taskSortMode, isManualSort]);

    return (
        <CardSortContext.Provider value={value}>
            {children}
        </CardSortContext.Provider>
    );
};

export const useCardSortContext = () => {
    const context = useContext(CardSortContext);
    if (context === undefined) {
        throw new Error('useCardSortContext must be used within a CardSortProvider');
    }
    return context;
};
