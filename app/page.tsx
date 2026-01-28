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
import { useLocation } from './contexts/LocationContext';

export default function Home() {
    const { cards, isLoading, totalCount } = useCardList();
    const { isCalculating } = useRarity();
    const { geoString } = useLocation();
    const [mounted, setMounted] = useState(false);
    const [isDbViewerOpen, setIsDbViewerOpen] = useState(false);
    const [focusedCardId, setFocusedCardId] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleReset = () => {
        setFocusedCardId(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleRandomPick = () => {
        if (cards.length === 0) return;
        const randomIndex = Math.floor(Math.random() * cards.length);
        const randomCard = cards[randomIndex];
        setFocusedCardId(randomCard.id);
    };

    // Keep handleNewCard if we add a FAB later
    const handleNewCard = async () => {
        try {
            await createCard(geoString);
            window.location.reload();
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
                cardCount={cards.length}
                totalCardCount={totalCount}
                onReset={handleReset}
                onRandomPick={handleRandomPick}
                onDbOpen={() => setIsDbViewerOpen(true)}
                isDbLoading={isLoading || isCalculating} // Use isCalculating as proxy for "activity" or isLoading?
            // Spec says DB loading. `isLoading` from useCardList is initial load.
            // `isCalculating` is Rarity.
            // For now use `isLoading || isCalculating`.
            />

            {/* Main Content (Card List) */}
            <div className="flex-1 overflow-hidden relative">
                {isLoading && cards.length === 0 ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                        <div className="w-12 h-12 border-4 border-purple-500/10 border-t-purple-600 rounded-full animate-spin" />
                        <p className="text-slate-400 font-medium animate-pulse">Loading Logs...</p>
                    </div>
                ) : cards.length === 0 ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <p className="text-slate-400 font-medium">表示するカードがありません</p>
                    </div>
                ) : (
                    <CardList
                        cards={cards}
                        focusedId={focusedCardId}
                        onFocusClear={() => setFocusedCardId(null)}
                    />
                )}
            </div>

            {/* DB Viewer Dialog */}
            <DbViewer
                isOpen={isDbViewerOpen}
                onClose={() => setIsDbViewerOpen(false)}
            />
        </main>
    );
}
