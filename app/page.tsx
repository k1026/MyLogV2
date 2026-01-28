'use client';

import React, { useState, useEffect } from 'react';
import { Cell } from './lib/models/cell';
import { cn } from './lib/utils';
import { useRarity } from './contexts/RarityContext';
import { Card } from './components/card/Card';
import { createCard } from './components/card/cardUtils';
import { DbViewer } from './components/db-viewer/DbViewer';
import { Database, RefreshCw } from 'lucide-react';

// Initial cell setup is no longer needed in this format

export default function Home() {
    const { isCalculating } = useRarity();
    const [mounted, setMounted] = useState(false);
    const [currentCard, setCurrentCard] = useState<Cell | null>(null);
    const [isDbViewerOpen, setIsDbViewerOpen] = useState(false);

    const handleNewCard = async () => {
        try {
            const newCard = await createCard();
            setCurrentCard(newCard);
        } catch (error) {
            console.error('Failed to create new card:', error);
        }
    };

    useEffect(() => {
        handleNewCard();
        setMounted(true);
    }, []);

    if (!mounted || !currentCard) {
        return <div className="min-h-screen bg-slate-50" />;
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 grid place-items-center p-4 font-sans selection:bg-purple-100 relative">
            {/* DB Viewer Toggle Button */}
            <div className="fixed top-6 right-6 z-40">
                <button
                    onClick={() => setIsDbViewerOpen(true)}
                    className={cn(
                        "w-14 h-14 flex items-center justify-center bg-white rounded-2xl border transition-all hover:scale-110 active:scale-90 shadow-xl group",
                        isCalculating
                            ? "text-purple-600 border-purple-300 shadow-purple-500/20 bg-purple-50 animate-pulse"
                            : "text-slate-600 border-purple-100 shadow-purple-500/10 hover:bg-purple-50"
                    )}
                    aria-label="Database Viewer"
                >
                    <Database size={28} className={cn("transition-transform duration-300", !isCalculating && "group-hover:rotate-12")} />
                </button>
            </div>

            <div className="w-full max-w-xl space-y-8 py-12">
                <header className="flex flex-col items-center mb-12 text-center">
                    <h1 className="text-6xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                        MyLog V2
                    </h1>
                    <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mt-4 mb-2" />
                    <p className="text-slate-400 text-sm font-semibold tracking-widest uppercase">
                        {isCalculating ? 'Calculating Rarity...' : 'Main Screen'}
                    </p>
                </header>

                <section className="relative">
                    <div className="flex flex-col items-center mb-8">
                        <h2 className="text-xs font-bold text-slate-300 uppercase tracking-[0.3em]">Current Session</h2>
                    </div>

                    <div className="space-y-6">
                        <Card cell={currentCard} />
                    </div>

                    <div className="mt-16 flex justify-center">
                        <button
                            onClick={handleNewCard}
                            className="group relative bg-slate-900 hover:bg-slate-800 text-white px-16 py-5 rounded-2xl font-bold transition-all active:scale-95 shadow-2xl shadow-slate-200 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-3 tracking-snug">
                                <RefreshCw size={20} className="group-hover:rotate-180 transition-transform duration-500" />
                                Update Card
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </button>
                    </div>
                </section>
            </div>

            {/* DB Viewer Dialog */}
            <DbViewer
                isOpen={isDbViewerOpen}
                onClose={() => setIsDbViewerOpen(false)}
            />
        </main>
    );
}
