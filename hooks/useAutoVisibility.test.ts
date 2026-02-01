import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useAutoVisibility } from './useAutoVisibility';

describe('useAutoVisibility', () => {
    beforeEach(() => {
        // Reset window state
        vi.stubGlobal('scrollY', 0);
        document.body.innerHTML = '';
    });

    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('初期状態は visible であること', () => {
        const { result } = renderHook(() => useAutoVisibility());
        expect(result.current).toBe(true);
    });

    it('50px以上スクロールダウンすると非表示になること', () => {
        const { result } = renderHook(() => useAutoVisibility(50));

        // Mock scroll
        vi.stubGlobal('scrollY', 100);
        act(() => {
            window.dispatchEvent(new Event('scroll'));
        });

        expect(result.current).toBe(false);
    });

    it('スクロールアップすると表示されること', () => {
        const { result } = renderHook(() => useAutoVisibility(50));

        // Scroll down first
        vi.stubGlobal('scrollY', 100);
        act(() => {
            window.dispatchEvent(new Event('scroll'));
        });
        expect(result.current).toBe(false);

        // Scroll up
        vi.stubGlobal('scrollY', 20);
        act(() => {
            window.dispatchEvent(new Event('scroll'));
        });
        expect(result.current).toBe(true);
    });

    it('input にフォーカスすると非表示になり、フォーカスアウトで表示されること', () => {
        const { result } = renderHook(() => useAutoVisibility());

        const input = document.createElement('input');
        document.body.appendChild(input);

        // Focus in
        act(() => {
            input.focus();
            // JSDOM might not trigger focusin event automatically on focus() if not in document correctly or listeners not set
            // Let's manually dispatch it to be sure what we are testing (the event handler in the hook)
            window.dispatchEvent(new CustomEvent('focusin', { bubbles: true, detail: { target: input } }));
            // Actually, we should mock the event properly
            const focusEvent = new FocusEvent('focusin', { bubbles: true });
            Object.defineProperty(focusEvent, 'target', { value: input });
            window.dispatchEvent(focusEvent);
        });

        expect(result.current).toBe(false);

        // Focus out
        act(() => {
            const focusOutEvent = new FocusEvent('focusout', { bubbles: true });
            window.dispatchEvent(focusOutEvent);
        });

        expect(result.current).toBe(true);
    });
});
