'use client';
import React from 'react';
import { EstimationCandidate } from '@/app/lib/services/estimation/types';

interface TitleCandidatesProps {
    candidates: EstimationCandidate[];
    onSelect: (title: string) => void;
}

/**
 * 推定されたタイトル候補をチップ形式で表示するコンポーネント
 */
export const TitleCandidates: React.FC<TitleCandidatesProps> = ({ candidates, onSelect }) => {
    if (candidates.length === 0) return null;

    return (
        <div
            data-testid="title-candidates"
            className="flex flex-row items-center gap-2 overflow-x-auto pb-2 scrollbar-hide py-1 px-1 -mx-1"
        >
            {candidates.map((candidate) => (
                <button
                    key={candidate.title}
                    type="button"
                    onClick={() => onSelect(candidate.title)}
                    className="flex-shrink-0 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-sm border border-white/30 text-slate-700 text-sm font-medium hover:bg-white/40 active:scale-95 transition-all shadow-sm"
                >
                    {candidate.title}
                </button>
            ))}
        </div>
    );
};
