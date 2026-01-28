import { ArrowDownUp, CheckSquare, Clock } from 'lucide-react';
import { UseCardSortResult } from './useCardSort';

interface CardToolbarProps {
    sortState: UseCardSortResult;
}

export const CardToolbar: React.FC<CardToolbarProps> = ({ sortState }) => {
    return (
        <div className="flex gap-2 p-2 bg-white/5 backdrop-blur-sm rounded-lg">
            {/* Time Sort */}
            <button
                aria-label="Sort by Time"
                onClick={sortState.toggleSort}
                className={`p-1.5 rounded transition-colors ${sortState.sortMode !== 'none' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
            >
                <Clock size={16} />
                {sortState.sortMode === 'asc' && <span className="text-[10px] ml-1">OLD</span>}
                {sortState.sortMode === 'desc' && <span className="text-[10px] ml-1">NEW</span>}
            </button>

            {/* Task Sort */}
            <button
                aria-label="Sort by Task"
                onClick={sortState.toggleTaskSort}
                className={`p-1.5 rounded transition-colors ${sortState.taskSortMode !== 'none' ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
            >
                <CheckSquare size={16} />
            </button>

            {/* Manual Sort */}
            <button
                aria-label="Manual Sort"
                onClick={sortState.setManualSort}
                className={`p-1.5 rounded transition-colors ${sortState.isManualSort ? 'bg-white/20 text-white' : 'text-white/50 hover:bg-white/10'}`}
            >
                <ArrowDownUp size={16} />
            </button>
        </div>
    );
}
