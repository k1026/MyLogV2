import { renderHook, act } from '@testing-library/react';
import { useCardSort } from './useCardSort';
import { CellDB } from '@/app/lib/db/db';
import { CellAttribute } from '@/app/lib/models/cell';
import { describe, it, expect } from 'vitest';

describe('useCardSort', () => {
    // テストデータ
    // IDにはタイムスタンプが含まれるため、順序制御可能
    // 1000, 2000, 3000, 4000
    const mockCells: CellDB[] = [
        { I: '1000-TIME', A: CellAttribute.Time, N: 'Time', V: 'Now', G: null, R: null },
        { I: '2000-TEXT', A: CellAttribute.Text, N: 'Text', V: 'Note', G: null, R: null },
        { I: '3000-TASK1', A: CellAttribute.Task, N: 'Task1', V: 'not done', G: null, R: null }, // 未完了
        { I: '4000-TASK2', A: CellAttribute.Task, N: 'Task2', V: 'done', G: null, R: null }, // 完了
    ];

    it('should return cells in original order by default', () => {
        const { result } = renderHook(() => useCardSort(mockCells));
        expect(result.current.sortedCells).toEqual(mockCells);
        expect(result.current.sortMode).toBe('none');
    });

    it('should keep Time cell at the top always', () => {
        const { result } = renderHook(() => useCardSort(mockCells));

        // Change to DESC sort
        act(() => {
            result.current.toggleSort(); // none -> asc
            result.current.toggleSort(); // asc -> desc
        });

        const sorted = result.current.sortedCells;
        expect(sorted[0].I).toBe('1000-TIME'); // Time must remain top
        // Others should be desc: 4000 -> 3000 -> 2000
        expect(sorted[1].I).toBe('4000-TASK2');
        expect(sorted[2].I).toBe('3000-TASK1');
        expect(sorted[3].I).toBe('2000-TEXT');
    });

    it('should sort by time (asc/desc)', () => {
        const { result } = renderHook(() => useCardSort(mockCells));

        // ASC: 1000 -> 2000 -> 3000 -> 4000
        act(() => result.current.toggleSort());
        expect(result.current.sortMode).toBe('asc');
        let sorted = result.current.sortedCells;
        expect(sorted.map(c => c.I)).toEqual(['1000-TIME', '2000-TEXT', '3000-TASK1', '4000-TASK2']);

        // DESC: 1000 -> 4000 -> 3000 -> 2000
        act(() => result.current.toggleSort());
        expect(result.current.sortMode).toBe('desc');
        sorted = result.current.sortedCells;
        expect(sorted.map(c => c.I)).toEqual(['1000-TIME', '4000-TASK2', '3000-TASK1', '2000-TEXT']);

        // NONE: Original
        act(() => result.current.toggleSort());
        expect(result.current.sortMode).toBe('none');
        sorted = result.current.sortedCells;
        expect(sorted.map(c => c.I)).toEqual(['1000-TIME', '2000-TEXT', '3000-TASK1', '4000-TASK2']);
    });

    it('should sort by task status', () => {
        const { result } = renderHook(() => useCardSort(mockCells));

        // Incomplete first
        act(() => result.current.toggleTaskSort());
        expect(result.current.taskSortMode).toBe('incomplete');
        // Order: Time -> Incomplete (Task1) -> Complete (Task2) (Text is treated as complete/neutral or just placed by time?)
        // Spec: "生成時間順にソートしたうえで未完了タスクを先頭に集め、完了タスクを末尾に集める"
        // Task1(3000, not done), Task2(4000, done). Text(2000) behavior needs checking logic.
        // Usually non-tasks are treated as "completed" or simply "not incomplete".
        // Let's assume standard grouping: [Time] + [Incomplete Tasks] + [Others/Complete Tasks]
        let sorted = result.current.sortedCells;
        expect(sorted[0].I).toBe('1000-TIME');
        expect(sorted[1].I).toBe('3000-TASK1'); // Incomplete

        // Complete first
        act(() => result.current.toggleTaskSort());
        expect(result.current.taskSortMode).toBe('complete');
        // Order: Time -> Complete (Task2) -> Incomplete (Task1)
        sorted = result.current.sortedCells;
        expect(sorted[0].I).toBe('1000-TIME');
        expect(sorted[1].I).toBe('4000-TASK2'); // Complete

        // None
        act(() => result.current.toggleTaskSort());
        expect(result.current.taskSortMode).toBe('none');
    });

    it('should manage manual sort integrity', () => {
        const { result } = renderHook(() => useCardSort(mockCells));

        // Enable manual sort -> disables others
        act(() => {
            result.current.toggleSort(); // Enable Asc
            result.current.setManualSort(); // Turn on Manual
        });

        expect(result.current.isManualSort).toBe(true);
        expect(result.current.sortMode).toBe('none');
    });
});
