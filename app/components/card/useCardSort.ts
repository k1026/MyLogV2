import { useState, useMemo, useCallback } from 'react';
import { CellDB } from '@/app/lib/db/db';
import { CellAttribute } from '@/app/lib/models/cell';

export type SortMode = 'none' | 'asc' | 'desc'; // 生成時間ソート
export type TaskSortMode = 'none' | 'incomplete' | 'complete'; // タスクソート

export interface UseCardSortResult {
    sortedCells: CellDB[];
    sortMode: SortMode;
    taskSortMode: TaskSortMode;
    toggleSort: () => void;
    toggleTaskSort: () => void;
    setManualSort: () => void;
    isManualSort: boolean;
}

/**
 * useCardSort Hook
 * @param cells フィルタリング対象のセルリスト (DB形式)
 */
export function useCardSort(cells: CellDB[] | undefined): UseCardSortResult {
    const [sortMode, setSortMode] = useState<SortMode>('none');
    const [taskSortMode, setTaskSortMode] = useState<TaskSortMode>('none');
    const [isManualSort, setIsManualSort] = useState(false);

    const toggleSort = useCallback(() => {
        setIsManualSort(false);
        setSortMode(prev => {
            if (prev === 'none') return 'asc';
            if (prev === 'asc') return 'desc';
            return 'none';
        });
    }, []);

    const toggleTaskSort = useCallback(() => {
        setIsManualSort(false);
        setTaskSortMode(prev => {
            if (prev === 'none') return 'incomplete';
            if (prev === 'incomplete') return 'complete';
            return 'none';
        });
    }, []);

    const setManualSortMode = useCallback(() => {
        setIsManualSort(!isManualSort);
        if (!isManualSort) {
            setSortMode('none');
            setTaskSortMode('none');
        }
    }, [isManualSort]);

    const sortedCells = useMemo(() => {
        if (!cells) return [];

        let result = [...cells];

        // 常にTimeセルを先頭に固定するための分離
        const timeCells = result.filter(c => c.A === CellAttribute.Time);
        let otherCells = result.filter(c => c.A !== CellAttribute.Time);

        // Sorting Logic
        if (sortMode !== 'none') {
            otherCells.sort((a, b) => {
                const timeA = parseInt(a.I.split('-')[0] || '0');
                const timeB = parseInt(b.I.split('-')[0] || '0');

                if (sortMode === 'asc') return timeA - timeB;
                return timeB - timeA;
            });
        }

        if (taskSortMode !== 'none') {
            otherCells.sort((a, b) => {
                // Task Priority Logic
                // TaskSortMode: incomplete -> Task(incomplete) top, Task(complete) bottom
                // TaskSortMode: complete -> Task(complete) top, Task(incomplete) bottom

                const isTaskA = a.A === CellAttribute.Task;
                const isTaskB = b.A === CellAttribute.Task;

                if (!isTaskA && !isTaskB) return 0;
                if (isTaskA && !isTaskB) return -1; // Task priority over non-task? Spec vague, assuming Task groupings
                if (!isTaskA && isTaskB) return 1;

                // Both are Tasks
                const isDoneA = a.V === 'done';
                const isDoneB = b.V === 'done';

                if (taskSortMode === 'incomplete') {
                    // Incomplete -> Complete
                    if (!isDoneA && isDoneB) return -1;
                    if (isDoneA && !isDoneB) return 1;
                } else {
                    // Complete -> Incomplete
                    if (isDoneA && !isDoneB) return -1;
                    if (!isDoneA && isDoneB) return 1;
                }
                return 0;
            });
        }

        // Manual sort: uses provided order (handled via Drag & Drop externally mostly, 
        // but here "none" sort means original order which is what we start with)

        return [...timeCells, ...otherCells];
    }, [cells, sortMode, taskSortMode]);

    return {
        sortedCells,
        sortMode,
        taskSortMode,
        toggleSort,
        toggleTaskSort,
        setManualSort: setManualSortMode,
        isManualSort
    };
}
