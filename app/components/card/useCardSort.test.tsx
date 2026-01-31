import { renderHook, act } from '@testing-library/react';
import { useCardSort } from './useCardSort';
import { CellDB } from '@/app/lib/db/db';
import { CellAttribute } from '@/app/lib/models/cell';
import { describe, it, expect } from 'vitest';
import { CardSortProvider } from '@/app/contexts/CardSortContext';
import React from 'react';

describe('useCardSort', () => {
    const wrapper = ({ children }: { children: React.ReactNode }) => (
        <CardSortProvider>{children} </CardSortProvider>
    );

    // テストデータ
    // IDにはタイムスタンプが含まれるため、順序制御可能
    const mockCells: CellDB[] = [
        { I: '1000-TIME', A: CellAttribute.Time, N: 'Time', V: 'Now', G: null, R: null },
        { I: '2000-TEXT', A: CellAttribute.Text, N: 'Text', V: 'Note', G: null, R: null },
        { I: '3000-TASK1', A: CellAttribute.Task, N: 'Task1', V: 'not done', G: null, R: null }, // 未完了
        { I: '4000-TASK2', A: CellAttribute.Task, N: 'Task2', V: 'done', G: null, R: null }, // 完了
    ];

    it('should return cells in desc arrival order by default', () => {
        const { result } = renderHook(() => useCardSort(mockCells), { wrapper });
        // Default is desc: 1000-TIME (fixed top) -> 4000 -> 3000 -> 2000
        expect(result.current.sortedCells.map(c => c.I)).toEqual(['1000-TIME', '4000-TASK2', '3000-TASK1', '2000-TEXT']);
        expect(result.current.sortMode).toBe('desc');
    });

    it('should keep Time cell at the top always', () => {
        const { result } = renderHook(() => useCardSort(mockCells), { wrapper });

        // Default is DESC: 1000-TIME (fixed top) -> 4000 -> 3000 -> 2000
        const sorted = result.current.sortedCells;
        expect(sorted[0].I).toBe('1000-TIME'); // Time must remain top
        expect(sorted[1].I).toBe('4000-TASK2');
        expect(sorted[2].I).toBe('3000-TASK1');
        expect(sorted[3].I).toBe('2000-TEXT');
    });

    it('should sort by time (desc/asc)', () => {
        const { result } = renderHook(() => useCardSort(mockCells), { wrapper });

        // Initially DESC (New): 1000 -> 4000 -> 3000 -> 2000
        expect(result.current.sortMode).toBe('desc');
        let sorted = result.current.sortedCells;
        expect(sorted.map(c => c.I)).toEqual(['1000-TIME', '4000-TASK2', '3000-TASK1', '2000-TEXT']);

        // Toggle to ASC (Old): 1000 -> 2000 -> 3000 -> 4000
        act(() => result.current.toggleSort());
        expect(result.current.sortMode).toBe('asc');
        sorted = result.current.sortedCells;
        expect(sorted.map(c => c.I)).toEqual(['1000-TIME', '2000-TEXT', '3000-TASK1', '4000-TASK2']);

        // Toggle back to DESC: 1000 -> 4000 -> 3000 -> 2000
        act(() => result.current.toggleSort());
        expect(result.current.sortMode).toBe('desc');
        sorted = result.current.sortedCells;
        expect(sorted.map(c => c.I)).toEqual(['1000-TIME', '4000-TASK2', '3000-TASK1', '2000-TEXT']);
    });

    it('should sort by task status (complete/incomplete) with grouped logic', () => {
        const { result } = renderHook(() => useCardSort(mockCells), { wrapper });

        // Initial state: desc sort
        // Complete first (DONE): 完了(done) -> 未完了(todo) -> 非タスク
        act(() => result.current.toggleTaskSort());
        expect(result.current.taskSortMode).toBe('complete');
        let sorted = result.current.sortedCells;
        expect(sorted.map(c => c.I)).toEqual(['1000-TIME', '4000-TASK2', '3000-TASK1', '2000-TEXT']);

        // Incomplete first (TODO): 非タスク -> 未完了(todo) -> 完了(done)
        act(() => result.current.toggleTaskSort());
        expect(result.current.taskSortMode).toBe('incomplete');
        sorted = result.current.sortedCells;
        expect(sorted.map(c => c.I)).toEqual(['1000-TIME', '2000-TEXT', '3000-TASK1', '4000-TASK2']);

        // None: Back to time sort (desc)
        act(() => result.current.toggleTaskSort());
        expect(result.current.taskSortMode).toBe('none');
        sorted = result.current.sortedCells;
        expect(sorted.map(c => c.I)).toEqual(['1000-TIME', '4000-TASK2', '3000-TASK1', '2000-TEXT']);
    });

    it('should manage manual sort integrity', () => {
        const { result } = renderHook(() => useCardSort(mockCells), { wrapper });

        // Enable manual sort -> disables others
        act(() => {
            result.current.setManualSort(); // Turn on Manual
        });

        expect(result.current.isManualSort).toBe(true);
        expect(result.current.sortMode).toBe('none');
    });
});
