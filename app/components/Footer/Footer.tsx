'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { useAutoVisibility } from '../../hooks/useAutoVisibility';
import { useUIState } from '../../contexts/UIStateContext';
import { SortButton } from './SortButton';
import { FilterButton } from './FilterButton';
import { ViewModeButton } from './ViewModeButton';
import { FilterDialog } from '../Filter/FilterDialog';

export const Footer: React.FC = () => {
    const isVisible = useAutoVisibility(50);
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const { filterState, toggleFilterState } = useUIState();

    const handleFilterClick = () => {
        if (filterState === 'on') {
            toggleFilterState();
        } else {
            setIsFilterOpen(true);
        }
    };

    return (
        <>
            <footer
                data-testid="app-footer"
                className={cn(
                    "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out",
                    isVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
                {/* Glassmorphism Background */}
                <div className="absolute inset-0 bg-white/70 backdrop-blur-md border-t border-slate-200 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]" />

                <div className="relative max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
                    {/* Left: Sort */}
                    <div className="flex-1 flex justify-start">
                        <SortButton />
                    </div>

                    {/* Center: Filter */}
                    <div className="flex-1 flex justify-center">
                        <FilterButton onClick={handleFilterClick} />
                    </div>

                    {/* Right: View */}
                    <div className="flex-1 flex justify-end">
                        <ViewModeButton />
                    </div>
                </div>

                {/* Extra padding for safe area on mobile if needed */}
                <div className="h-[env(safe-area-inset-bottom)] bg-white/70 backdrop-blur-md" />
            </footer>

            <FilterDialog
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            />
        </>
    );
};
