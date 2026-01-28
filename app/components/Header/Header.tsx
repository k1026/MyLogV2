import React from 'react';
import { cn } from '../../lib/utils';
import { HeaderTitle } from './HeaderTitle';
import { HeaderStatus } from './HeaderStatus';
import { HeaderActions } from './HeaderActions';
import { useAutoVisibility } from '../../hooks/useAutoVisibility';

interface HeaderProps {
    cardCount: number;
    totalCardCount: number;
    onReset: () => void;
    onRandomPick: () => void;
    onDbOpen: () => void;
    isDbLoading?: boolean;
    isSorting?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    cardCount,
    totalCardCount,
    onReset,
    onRandomPick,
    onDbOpen,
    isDbLoading = false,
    isSorting = false,
}) => {
    const isVisible = useAutoVisibility(50);

    return (
        <header
            data-testid="app-header"
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out",
                isVisible ? "translate-y-0" : "-translate-y-full"
            )}
        >
            <div className="absolute inset-0 bg-white/70 backdrop-blur-md border-b border-slate-200 shadow-sm" />

            <div className="relative max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
                <HeaderTitle
                    onReset={onReset}
                    isDbLoading={isDbLoading}
                />

                <HeaderStatus
                    cardCount={cardCount}
                    totalCardCount={totalCardCount}
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
