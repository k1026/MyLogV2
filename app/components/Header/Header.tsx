import React from 'react';
import { cn } from '../../lib/utils';
import { HeaderTitle } from './HeaderTitle';
import { HeaderStatus } from './HeaderStatus';
import { HeaderActions } from './HeaderActions';
import { useUIState } from '../../contexts/UIStateContext';

interface HeaderProps {
    cardCount: number;
    totalCardCount: number;
    cellCount: number;
    onReset: () => void;
    onRandomPick: () => void;
    onDbOpen: () => void;
    isDbLoading?: boolean;
    isSorting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    cardCount,
    totalCardCount,
    cellCount,
    onReset,
    onRandomPick,
    onDbOpen,
    isDbLoading = false,
    isSorting = false,
}) => {
    const { headerVisible } = useUIState();

    return (
        <header
            data-testid="app-header"
            className={cn(
                "fixed top-0 left-0 right-0 z-[60] transition-transform duration-300 ease-in-out pointer-events-none",
                headerVisible ? "translate-y-0" : "-translate-y-full"
            )}
        >
            <div className="absolute inset-0 bg-white border-b border-slate-200 shadow-sm pointer-events-none" />

            <div className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between pointer-events-auto">
                <HeaderStatus
                    cardCount={cardCount}
                    cellCount={cellCount}
                />

                <HeaderTitle
                    onReset={onReset}
                    isDbLoading={isDbLoading}
                />

                <HeaderActions
                    onRandomPick={onRandomPick}
                    onDbOpen={onDbOpen}
                    isDbLoading={isDbLoading}
                    isSorting={isSorting}
                />
            </div>
        </header>
    );
};
