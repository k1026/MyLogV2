import { useState, useEffect, useCallback } from 'react';

export function useAutoVisibility(threshold = 50) {
    const [isVisible, setIsVisible] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);
    const [isInputFocused, setIsInputFocused] = useState(false);

    // Scroll handler
    const handleScroll = useCallback(() => {
        const currentScrollY = window.scrollY;

        if (currentScrollY > lastScrollY && currentScrollY > threshold) {
            // Scrolling down & passed threshold -> Hide
            setIsVisible(false);
        } else {
            // Scrolling up -> Show
            setIsVisible(true);
        }
        setLastScrollY(currentScrollY);
    }, [lastScrollY, threshold]);

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
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [handleScroll]);

    useEffect(() => {
        window.addEventListener('focusin', handleFocusIn);
        window.addEventListener('focusout', handleFocusOut);
        return () => {
            window.removeEventListener('focusin', handleFocusIn);
            window.removeEventListener('focusout', handleFocusOut);
        };
    }, [handleFocusIn, handleFocusOut]);

    // Final visibility is overridden by focus
    return isInputFocused ? false : isVisible;
}
