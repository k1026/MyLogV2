import React, { useState, useEffect, useCallback } from 'react';
import { cn } from '../../lib/utils';
import { HeaderTitle } from './HeaderTitle';
import { HeaderStatus } from './HeaderStatus';
import { HeaderActions } from './HeaderActions';

interface HeaderProps {
    cardCount: number;
    totalCardCount: number;
    onReset: () => void;
    onRandomPick: () => void;
    onDbOpen: () => void;
    isDbLoading?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
    cardCount,
    totalCardCount,
    onReset,
    onRandomPick,
    onDbOpen,
    isDbLoading = false,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isInputFocused, setIsInputFocused] = useState(false);

    // Scroll handler
    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > 50) {
            // Scrolling down & passed threshold -> Hide
            setIsVisible(false);
        } else {
            // Scrolling up -> Show
            setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
    }, [lastScrollY]);

    // Focus handler
    const handleFocusIn = useCallback((e: FocusEvent) => {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
            setIsVisible(false);
            setIsInputFocused(true);
        }
    }, []);

    const handleFocusOut = useCallback(() => {
        setIsInputFocused(false);
        // We act optimistically; if another input is focused immediately, focusin will fire likely before render cycle stabilizes or shortly after.
        // But to be safe, we set visible true. If capturing another focus, it will set false again.
        // However, a slight delay might be better UX, but let's stick to simple logic.
        setIsVisible(true);
    }, []);

    useEffect(() => {
        if (isInputFocused) return; // If input is focused, don't show on scroll (optional policy, but spec says "Hide on focus")
        // Actually spec says: 
        // Scroll: Down->Hide, Up->Show
        // Focus: Active->Hide, Out->Show
        // They are independent triggers.
        // If focused, we probably want it hidden regardless of scroll.

        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll, isInputFocused]);

    useEffect(() => {
        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        return () => {
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
        };
    }, [handleFocusIn, handleFocusOut]);

    // Override visibility: if input is focused, force hide (unless we want to allow showing on scroll up even while focused? unlikely)
    const finalIsVisible = isInputFocused ? false : isVisible;

    return (
        <header
            data-testid="app-header"
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-transform duration-300 ease-in-out",
                finalIsVisible ? "translate-y-0" : "-translate-y-full"
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
                />
            </div>
        </header>
    );
};
