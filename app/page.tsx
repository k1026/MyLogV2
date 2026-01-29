'use client';

import React, { useState, useEffect } from 'react';
import { Cell } from './lib/models/cell';
import { cn } from './lib/utils';
import { useRarity } from './contexts/RarityContext';
import { createCard } from './components/card/cardUtils';
import { DbViewer } from './components/db-viewer/DbViewer';
import { useCardList } from './hooks/useCardList';
import { Header } from './components/Header/Header';
import { CardList } from './components/CardList/CardList';
import { CardAddButton } from './components/CardList/CardAddButton';
import { Footer } from './components/Footer/Footer';
import { useUIState } from './contexts/UIStateContext';
import { useFilter } from './contexts/FilterContext';
import { filterCards } from './lib/filter/cardFilter';
import { useCellTitleEstimation } from './lib/hooks/useCellTitleEstimation';

export default function Home() {
    const { sortOrder, filterState } = useUIState();
    const { filterSettings } = useFilter();
    const useCardListResult = useCardList(sortOrder);
    const { cards, subCellMap, isLoading, isSorting, totalCount } = useCardListResult;
    const { isCalculating } = useRarity();
    const [mounted, setMounted] = useState(false);
    const [isDbViewerOpen, setIsDbViewerOpen] = useState(false);
    const [focusedCardId, setFocusedCardId] = useState<string | null>(null);

    const { init: initEstimation } = useCellTitleEstimation();

    useEffect(() => {
        setMounted(true);
        initEstimation();
    }, [initEstimation]);

    // フィルタリングの適用
    const filteredCards = filterState === 'on'
        ? filterCards(cards, subCellMap, filterSettings)
        : cards.filter(c => c.remove === null);

    const handleReset = () => {
        setFocusedCardId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRandomPick = () => {
        if (filteredCards.length === 0) return;
        const randomIndex = Math.floor(Math.random() * filteredCards.length);
        const randomCard = filteredCards[randomIndex];
        setFocusedCardId(randomCard.id);
    };

    const handleNewCard = async () => {
        try {
            const newCard = await createCard();
            // Add card to UI immediately
            useCardListResult.addCard(newCard);
            // Set focus to the new card immediately
            setFocusedCardId(newCard.id);
        } catch (error) {
            console.error('Failed to create new card:', error);
        }
    };

    if (!mounted) {
        return <div className="min-h-screen bg-slate-900" />;
    }

    return (
        <main className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-purple-100 relative overflow-hidden">
            <Header
                cardCount={filteredCards.length}
                totalCardCount={totalCount}
                onReset={handleReset}
                onRandomPick={handleRandomPick}
                onDbOpen={() => setIsDbViewerOpen(true)}
                isDbLoading={isLoading || isCalculating}
                isSorting={isSorting}
            />

            {/* Main Content (Card List) */}
            <div className="flex-1 overflow-hidden relative">
                {isLoading && cards.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-purple-500/10 border-t-purple-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-medium animate-pulse">Loading Logs...</p>
                    </div>
                ) : filteredCards.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-slate-400 font-medium">表示するカードがありません</p>
                    </div>
                ) : (
                    <CardList
                        cards={filteredCards}
                        focusedId={focusedCardId}
                        onFocusClear={() => setFocusedCardId(null)}
                        onFocus={setFocusedCardId}
                    />
                )}
            </div>

            {/* DB Viewer Dialog */}
            <DbViewer
                isOpen={isDbViewerOpen}
                onClose={() => setIsDbViewerOpen(false)}
            />

            {/* Footer */}
            <Footer />

            {/* Card Add Button (FAB) */}
            <CardAddButton
                onClick={handleNewCard}
                visible={!focusedCardId}
            />
        </main>
    );
}
