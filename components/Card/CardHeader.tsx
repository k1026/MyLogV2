import React from 'react';
import { CellAttribute } from '@/lib/models/cell';
import { highlightText } from '@/lib/utils/highlight';
import { CardToolbar } from './CardToolbar';
import { UseCardSortResult } from './useCardSort';

interface CardHeaderProps {
    isExpanded: boolean;
    isRemoved: boolean;
    viewMode: string;
    sortState: UseCardSortResult;
    displayTitle: string;
    highlightKeywords: string[];
    formattedDate: string;
    handleToggle: () => void;
}

export const CardHeader: React.FC<CardHeaderProps> = ({
    isExpanded,
    isRemoved,
    viewMode,
    sortState,
    displayTitle,
    highlightKeywords,
    formattedDate,
    handleToggle
}) => {
    return (
        <div className={`flex ${isExpanded ? 'items-center justify-end' : 'items-start justify-between'} w-full mb-2`}>
            {!isExpanded && (
                <div className={`flex flex-col gap-0.5 ${isRemoved ? 'line-through opacity-70' : ''}`}>
                    {viewMode === 'enum' && sortState.sortedCells.some(c => c.A === CellAttribute.Text || c.A === CellAttribute.Task) ? (
                        sortState.sortedCells
                            .filter(c => c.A === CellAttribute.Text || c.A === CellAttribute.Task)
                            .map((c, i) => (
                                <div key={c.I} className={i === 0 ? "font-bold text-lg text-white" : "text-sm text-white/80"}>
                                    {highlightText(c.N || '', highlightKeywords)}
                                </div>
                            ))
                    ) : (
                        <div className="font-bold text-lg text-white">
                            {highlightText(displayTitle, highlightKeywords)}
                        </div>
                    )}
                </div>
            )}
            <div className="flex items-center gap-2">
                {isExpanded && <CardToolbar sortState={sortState} />}
                {!isExpanded && <div className="text-xs text-gray-400 mt-1">{formattedDate}</div>}
                {isExpanded && (
                    <button
                        data-testid="card-close-button"
                        className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-gray-400 transition-colors"
                        onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                )}
            </div>
        </div>
    );
};
