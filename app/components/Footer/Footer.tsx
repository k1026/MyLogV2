'use client';

import React from 'react';
import { cn } from '../../lib/utils';
import { useUIState } from '../../contexts/UIStateContext';
import { SortButton } from './SortButton';
import { FilterButton } from './FilterButton';
import { ViewModeButton } from './ViewModeButton';
import { FilterDialog } from '../Filter/FilterDialog';

export const Footer: React.FC = () => {
    const [isFilterOpen, setIsFilterOpen] = React.useState(false);
    const { filterState, toggleFilterState, footerVisible } = useUIState();

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
                    footerVisible ? "translate-y-0" : "translate-y-full"
                )}
            >
                {/* Background & Shadow */}
                <div className="absolute inset-0 bg-white border-t border-slate-200 shadow-[0_-2px_10px_rgba(0,0,0,0.03)]" />

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
                <div className="h-[env(safe-area-inset-bottom)] bg-white" />
            </footer>

            <FilterDialog
                isOpen={isFilterOpen}
                onClose={() => setIsFilterOpen(false)}
            />
        </>
    );
};
