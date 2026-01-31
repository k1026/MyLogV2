import React from 'react';
import { renderHook, act } from '@testing-library/react';
import { CardSortProvider, useCardSortContext } from './CardSortContext';
import { describe, it, expect } from 'vitest';

describe('CardSortContext', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardSortProvider>{children}</CardSortProvider>
    );

    it('should have default values', () => {
        const { result } = renderHook(() => useCardSortContext(), { wrapper });
        expect(result.current.sortMode).toBe('desc');
        expect(result.current.taskSortMode).toBe('none');
        expect(result.current.isManualSort).toBe(false);
    });

    it('should toggle sortMode in correct sequence: desc -> asc -> desc', () => {
        const { result } = renderHook(() => useCardSortContext(), { wrapper });

        // Initial: desc
        expect(result.current.sortMode).toBe('desc');

        // Toggle 1: asc (Old)
        act(() => result.current.toggleSort());
        expect(result.current.sortMode).toBe('asc');

        // Toggle 2: desc (New)
        act(() => result.current.toggleSort());
        expect(result.current.sortMode).toBe('desc');
    });

    it('should toggle taskSortMode in correct sequence: none -> complete -> incomplete -> none', () => {
        const { result } = renderHook(() => useCardSortContext(), { wrapper });

        // Initial: none
        expect(result.current.taskSortMode).toBe('none');

        // Toggle 1: complete (完了優先)
        act(() => result.current.toggleTaskSort());
        expect(result.current.taskSortMode).toBe('complete');

        // Toggle 2: incomplete (未完了優先)
        act(() => result.current.toggleTaskSort());
        expect(result.current.taskSortMode).toBe('incomplete');

        // Toggle 3: none
        act(() => result.current.toggleTaskSort());
        expect(result.current.taskSortMode).toBe('none');
    });

    it('should disable other sorts when manual sort is enabled', () => {
        const { result } = renderHook(() => useCardSortContext(), { wrapper });

        // Initial state is desc, set taskSortMode to complete
        act(() => {
            result.current.toggleTaskSort(); // complete
        });
        expect(result.current.sortMode).toBe('desc');
        expect(result.current.taskSortMode).toBe('complete');

        // Enable manual sort
        act(() => result.current.setManualSort());
        expect(result.current.isManualSort).toBe(true);
        expect(result.current.sortMode).toBe('none');
        expect(result.current.taskSortMode).toBe('none');
    });

    it('should disable manual sort when other sorts are enabled', () => {
        const { result } = renderHook(() => useCardSortContext(), { wrapper });

        // Enable manual sort
        act(() => result.current.setManualSort());
        expect(result.current.isManualSort).toBe(true);

        // Toggle sortMode -> becomes desc (since it was none and now toggles to desc)
        act(() => result.current.toggleSort());
        expect(result.current.isManualSort).toBe(false);
        expect(result.current.sortMode).toBe('desc');
    });
});
