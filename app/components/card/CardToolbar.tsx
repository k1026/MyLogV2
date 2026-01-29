import { ArrowDownUp, CheckSquare, Clock } from 'lucide-react';
import { UseCardSortResult } from './useCardSort';

interface CardToolbarProps {
    sortState: UseCardSortResult;
}

export const CardToolbar: React.FC<CardToolbarProps> = ({ sortState }) => {
    return (
        <div className="flex gap-1 h-[28px] items-center bg-white/5 backdrop-blur-sm rounded-lg px-1">
            {/* Manual Sort */}
            <button
                aria-label="Manual Sort"
                onClick={sortState.setManualSort}
                className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${sortState.isManualSort ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
            >
                <ArrowDownUp size={20} />
            </button>

            {/* Task Sort */}
            <button
                aria-label="Sort by Task"
                onClick={sortState.toggleTaskSort}
                className={`flex items-center justify-center w-6 h-6 rounded transition-colors ${sortState.taskSortMode !== 'none' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
            >
                <CheckSquare size={20} />
            </button>

            {/* Time Sort */}
            <button
                aria-label="Sort by Time"
                onClick={sortState.toggleSort}
                className={`flex items-center justify-center h-6 px-1 rounded transition-colors ${sortState.sortMode !== 'none' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
            >
                <Clock size={20} />
                {sortState.sortMode === 'asc' && <span className="text-[10px] ml-1">OLD</span>}
                {sortState.sortMode === 'desc' && <span className="text-[10px] ml-1">NEW</span>}
            </button>
        </div>
    );
}
