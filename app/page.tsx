'use client';

import React, { useState, useEffect } from 'react';
import { Cell } from './lib/models/cell';
import { cn } from './lib/utils';
import { useRarity } from './contexts/RarityContext';
import { createCard } from './components/card/cardUtils';
import { DbViewer } from './components/db-viewer/DbViewer';
import { useCardList } from './hooks/useCardList';
import { CardList } from './components/CardList/CardList';
import { RefreshCw, Database } from 'lucide-react';

export default function Home() {
    const { cards, isLoading, totalCount } = useCardList();
    const { isCalculating } = useRarity();
    const [mounted, setMounted] = useState(false);
    const [isDbViewerOpen, setIsDbViewerOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleNewCard = async () => {
        try {
            await createCard();
            // useCardList will automatically update? 
            // Actually, we might need a refresh function or rely on Dexie sync if useCardList uses LiveQuery.
            // Currently useCardList is a one-time load with background updates.
            // To make it reactive, we should ideally use useLiveQuery inside useCardList or add a refresh.
            // For now, let's assume it updates or the user manages it.
            window.location.reload(); // Simple way for now if no reactive state
        } catch (error) {
            console.error('Failed to create new card:', error);
        }
    };

    if (!mounted) {
        return <div className="min-h-screen bg-slate-900" />;
    }

    return (
        <main className="h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-purple-100 relative overflow-hidden">
            {/* Header Area */}
            <header className="flex items-center justify-between p-4 bg-white/70 backdrop-blur-md border-b border-slate-200 z-40">
                <div className="flex flex-col">
                    <h1 className="text-xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
                        MyLog V2
                    </h1>
                    <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">
                        {isCalculating ? 'Calculating...' : `Cards: ${cards.length} / Total: ${totalCount}`}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsDbViewerOpen(true)}
                        className={cn(
                            "w-10 h-10 flex items-center justify-center rounded-xl transition-all border",
                            isCalculating
                                ? "text-purple-600 border-purple-500/30 bg-purple-500/10 animate-pulse"
                                : "text-slate-400 border-slate-200 hover:bg-slate-50"
                        )}
                        aria-label="Database Viewer"
                    >
                        <Database size={20} />
                    </button>
                    <button
                        onClick={handleNewCard}
                        className="w-10 h-10 flex items-center justify-center rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all shadow-lg shadow-purple-500/20"
                        aria-label="New Card"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </header>

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
                    <CardList cards={cards} />
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
