'use client';

import React, { useState, useEffect } from 'react';
import { CellContainer } from './components/cell/CellContainer';
import { CellAttribute, Cell, createCellId } from './lib/models/cell';
import { CellRepository } from './lib/db/operations';

const createInitialCells = () => ({
    time: {
        id: createCellId(),
        attribute: CellAttribute.Time,
        name: '',
        value: new Date().toISOString(),
        geo: null,
        remove: null,
    },
    text: {
        id: createCellId(),
        attribute: CellAttribute.Text,
        name: '',
        value: '',
        geo: null,
        remove: null,
    },
    task: {
        id: createCellId(),
        attribute: CellAttribute.Task,
        name: '',
        value: 'false',
        geo: null,
        remove: null,
    },
});

export default function Home() {
    const [mounted, setMounted] = useState(false);
    const [cells, setCells] = useState<ReturnType<typeof createInitialCells> | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        setCells(createInitialCells());
        setMounted(true);
    }, []);

    const handleUpdate = (attr: keyof ReturnType<typeof createInitialCells>) => (updatedCell: Cell) => {
        setCells(prev => {
            if (!prev) return null;
            return {
                ...prev,
                [attr]: updatedCell
            };
        });
    };

    const handleSave = async () => {
        if (!cells) return;
        const toSave: Cell[] = [];

        // 値が入力されているものを抽出 (簡易バリデーション)
        if (cells.time.name || cells.time.value) toSave.push(cells.time);
        if (cells.text.name || cells.text.value) toSave.push(cells.text);
        if (cells.task.name) toSave.push(cells.task);

        if (toSave.length === 0) return;

        try {
            await Promise.all(toSave.map(cell => CellRepository.save(cell)));
            // 保存後リセット
            setCells(createInitialCells());
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 3000);
        } catch (error) {
            console.error('Failed to save cells:', error);
        }
    };

    if (!mounted || !cells) {
        return <div className="min-h-screen bg-slate-50" />;
    }

    return (
        <main className="min-h-screen bg-slate-50 text-slate-900 grid place-items-center p-4 font-sans selection:bg-purple-100">
            <div className="w-full max-w-xl space-y-8 py-12">
                <header className="flex flex-col items-center mb-12 text-center">
                    <h1 className="text-6xl font-black bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent drop-shadow-sm">
                        MyLog V2
                    </h1>
                    <div className="h-1 w-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full mt-4 mb-2" />
                    <p className="text-slate-400 text-sm font-semibold tracking-widest uppercase">Main Screen</p>
                </header>

                <section className="relative">
                    <div className="flex flex-col items-center mb-8">
                        {showSuccess ? (
                            <span className="text-xs font-bold text-green-600 bg-green-50 px-3 py-1 rounded-full border border-green-100 animate-bounce">
                                ✓ Saved Successfully
                            </span>
                        ) : (
                            <h2 className="text-xs font-bold text-slate-300 uppercase tracking-[0.3em]">New Entry</h2>
                        )}
                    </div>

                    <div className="space-y-6">
                        <CellContainer cell={cells.time} onSave={handleUpdate('time')} />
                        <CellContainer cell={cells.text} onSave={handleUpdate('text')} />
                        <CellContainer cell={cells.task} onSave={handleUpdate('task')} />
                    </div>

                    <div className="mt-16 flex justify-center">
                        <button
                            onClick={handleSave}
                            className="group relative bg-slate-900 hover:bg-slate-800 text-white px-20 py-5 rounded-2xl font-bold transition-all active:scale-95 shadow-2xl shadow-slate-200 overflow-hidden"
                        >
                            <span className="relative z-10 flex items-center gap-2 tracking-tight">
                                Save Entry
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                        </button>
                    </div>
                </section>
            </div>
        </main>
    );
}
