import { useMemo } from 'react';
import { CellDB } from '@/app/lib/db/db';
import { CellAttribute } from '@/app/lib/models/cell';
import { useCardSortContext, SortMode, TaskSortMode } from '@/app/contexts/CardSortContext';

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
    const {
        sortMode,
        taskSortMode,
        isManualSort,
        toggleSort,
        toggleTaskSort,
        setManualSort
    } = useCardSortContext();

    const sortedCells = useMemo(() => {
        if (!cells) return [];

        let result = [...cells];

        // 常にTimeセルを先頭に固定するための分離
        const timeCells = result.filter(c => c.A === CellAttribute.Time);
        let otherCells = result.filter(c => c.A !== CellAttribute.Time);

        // Sorting Logic: まず時間ソートを適用
        if (!isManualSort) {
            otherCells.sort((a, b) => {
                const timeA = parseInt(a.I.split('-')[0] || '0');
                const timeB = parseInt(b.I.split('-')[0] || '0');

                if (sortMode === 'asc') return timeA - timeB;
                return timeB - timeA;
            });
        }

        // 次にタスクソートを適用（時間ソートの結果を維持しつつグループ化）
        if (taskSortMode !== 'none') {
            const tasks = otherCells.filter(c => c.A === CellAttribute.Task);
            const nonTasks = otherCells.filter(c => c.A !== CellAttribute.Task);

            const doneTasks = tasks.filter(t => t.V === 'done');
            const todoTasks = tasks.filter(t => t.V !== 'done');

            if (taskSortMode === 'complete') {
                // 完了優先: 完了タスク -> 未完了タスク -> 非タスク（タスクを先頭グループ化）
                otherCells = [...doneTasks, ...todoTasks, ...nonTasks];
            } else {
                // 未完了優先: 非タスク -> 未完了タスク -> 完了タスク（タスクを末尾グループ化）
                otherCells = [...nonTasks, ...todoTasks, ...doneTasks];
            }
        }

        return [...timeCells, ...otherCells];
    }, [cells, sortMode, taskSortMode, isManualSort]);

    return {
        sortedCells,
        sortMode,
        taskSortMode,
        toggleSort,
        toggleTaskSort,
        setManualSort,
        isManualSort
    };
}
