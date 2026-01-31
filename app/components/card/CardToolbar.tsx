import { MaterialIcon } from '../ui/MaterialIcon';
import { UseCardSortResult } from './useCardSort';

interface CardToolbarProps {
    sortState: UseCardSortResult;
}

export const CardToolbar: React.FC<CardToolbarProps> = ({ sortState }) => {
    return (
        <div className="flex gap-1 h-[32px] items-center bg-white/10 backdrop-blur-md rounded-lg px-2">
            {/* Manual Sort */}
            <button
                aria-label="Manual Sort"
                onClick={sortState.setManualSort}
                className={`flex flex-col items-center justify-center w-7 h-7 rounded transition-all hover:scale-105 ${sortState.isManualSort ? 'bg-white/20 text-white shadow-sm shadow-white/20' : 'text-white/50 hover:bg-white/10'}`}
            >
                <MaterialIcon icon="swap_vert" size={20} />
                <span className={`text-[10px] leading-tight transition-opacity duration-200 ${sortState.isManualSort ? 'text-white opacity-100' : 'opacity-0'}`}>MOVE</span>
            </button>

            {/* Task Sort */}
            <button
                aria-label="Sort by Task"
                onClick={sortState.toggleTaskSort}
                className={`flex flex-col items-center justify-center w-7 h-7 rounded transition-all hover:scale-105 ${sortState.taskSortMode !== 'none' ? 'bg-white/20 text-white shadow-sm shadow-white/20' : 'text-white/50 hover:bg-white/10'}`}
            >
                <MaterialIcon
                    icon={sortState.taskSortMode === 'incomplete' ? 'check_box_outline_blank' : 'check_box'}
                    size={20}
                    data-testid="task-sort-icon"
                />
                <span className={`text-[10px] leading-tight transition-opacity duration-200 ${sortState.taskSortMode !== 'none' ? 'text-white opacity-100' : 'opacity-0'}`}>
                    {sortState.taskSortMode === 'complete' ? 'DONE' : 'TODO'}
                </span>
            </button>

            {/* Time Sort */}
            <button
                aria-label="Sort by Time"
                onClick={sortState.toggleSort}
                className={`flex flex-col items-center justify-center w-7 h-7 rounded transition-all hover:scale-105 ${sortState.sortMode !== 'none' ? 'bg-white/20 text-white shadow-sm shadow-white/20' : 'text-white/50 hover:bg-white/10'}`}
            >
                <MaterialIcon icon="schedule" size={20} />
                <span className={`text-[10px] leading-tight transition-opacity duration-200 ${sortState.sortMode !== 'none' ? 'text-white opacity-100' : 'opacity-0'}`}>
                    {sortState.sortMode === 'asc' ? 'OLD' : 'NEW'}
                </span>
            </button>
        </div>
    );
}

