'use client';

import React, { useState, useEffect } from 'react';
import { CellRepository } from '@/app/lib/db/operations';
import { Cell } from '@/app/lib/models/cell';
import { Database, X, ChevronLeft, ChevronRight, Trash2, FileUp, FileDown } from 'lucide-react';
import { appendDatabase, exportDatabase } from '@/app/lib/db/fileOperations';

export interface DbViewerProps {
    isOpen: boolean;
    onClose: () => void;
}

const ITEMS_PER_PAGE = 100;

/**
 * DB表示・管理用ダイアログコンポーネント
 * 仕様書: docs/specs/08_DbViewer.md
 */
export function DbViewer({ isOpen, onClose }: DbViewerProps) {
    const [page, setPage] = useState(1);
    const [cells, setCells] = useState<Cell[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [isProcessing, setIsProcessing] = useState<string | null>(null); // 'delete' | 'append' | 'export'
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    // データ読み込み
    const fetchData = React.useCallback(async () => {
        setIsLoading(true);
        const count = await CellRepository.getCount();
        setTotalCount(count);

        const safePage = Math.max(1, Math.min(page, Math.ceil(count / ITEMS_PER_PAGE) || 1));
        if (safePage !== page && count > 0) {
            setPage(safePage);
            return;
        }

        const offset = (safePage - 1) * ITEMS_PER_PAGE;
        const data = await CellRepository.getRange(offset, ITEMS_PER_PAGE);
        setCells(data);
        setIsLoading(false);
    }, [page]);

    useEffect(() => {
        if (isOpen) {
            fetchData();
            setStatusMessage(null); // ダイアログを開くたびにメッセージをリセット
        }
    }, [isOpen, fetchData]);

    const totalPages = Math.max(1, Math.ceil(totalCount / ITEMS_PER_PAGE));

    // ボタンハンドラ
    const handleDeleteDB = async () => {
        if (confirm('データベース内の全てのデータを削除しますか？この操作は取り消せません。')) {
            setIsProcessing('delete');
            await CellRepository.truncate();
            await fetchData();
            setPage(1);
            setIsProcessing(null);
            setStatusMessage('DATABASE TRUNCATED');
        }
    };

    const handleAppend = async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setIsProcessing('append');
            setProgress(0);
            try {
                const content = await file.text();
                const result = await appendDatabase(content, setProgress);
                setStatusMessage(`APPENDED: ${result.added} / SKIPPED: ${result.skipped}`);
                await fetchData();
            } finally {
                setIsProcessing(null);
            }
        };
        input.click();
    };

    const handleExport = async () => {
        setIsProcessing('export');
        setProgress(0);
        try {
            const result = await exportDatabase(setProgress);
            const blob = new Blob([result.content], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mylog_backup_${new Date().toISOString().slice(0, 10)}.json`;
            a.click();
            URL.revokeObjectURL(url);
            setStatusMessage('EXPORT COMPLETED');
        } finally {
            setIsProcessing(null);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            id="db-viewer-dialog"
            data-testid="db-viewer"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300"
        >
            <div className="bg-white border border-slate-200 w-full max-w-6xl h-[90vh] overflow-hidden flex flex-col shadow-[0_30px_60px_-12px_rgba(0,0,0,0.25)] rounded-3xl text-slate-900 ring-1 ring-black/5">
                {/* Header */}
                <header className="px-8 py-8 flex flex-col items-center relative border-b border-slate-100 bg-slate-50/50">
                    <button
                        onClick={onClose}
                        className="absolute top-8 right-8 text-slate-400 hover:text-slate-900 transition-all hover:rotate-90 duration-300"
                        aria-label="Close"
                    >
                        <X size={24} strokeWidth={1.5} />
                    </button>

                    <span className="text-[10px] text-purple-600 font-black tracking-[0.4em] uppercase mb-4">System Storage</span>

                    <div className="flex flex-col items-center gap-3">
                        <div className="bg-gradient-to-br from-indigo-600 to-purple-600 p-3 rounded-2xl shadow-lg shadow-indigo-500/30 mb-1">
                            <Database className="text-white" size={28} />
                        </div>
                        <h2 className="text-2xl font-black tracking-tight text-slate-900">
                            DATABASE <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">VIEWER</span>
                        </h2>
                    </div>
                </header>

                {/* Controls Area */}
                <div className="px-8 py-5 border-b border-slate-100 space-y-4 bg-white">
                    <div className="flex justify-center gap-4">
                        <ActionButton
                            onClick={handleDeleteDB}
                            variant="delete"
                            active={isProcessing === 'delete'}
                            disabled={isLoading || isProcessing !== null}
                        >
                            <Trash2 size={16} /> Delete DB
                        </ActionButton>
                        <ActionButton
                            onClick={handleAppend}
                            variant="purple"
                            active={isProcessing === 'append'}
                            disabled={isLoading || isProcessing !== null}
                        >
                            <FileUp size={16} /> Append
                        </ActionButton>
                        <ActionButton
                            onClick={handleExport}
                            variant="purple"
                            active={isProcessing === 'export'}
                            disabled={isLoading || isProcessing !== null}
                        >
                            <FileDown size={16} /> Export
                        </ActionButton>
                    </div>

                    {isProcessing && (isProcessing === 'append' || isProcessing === 'export') && (
                        <div className="w-full max-w-sm mx-auto space-y-2 py-2">
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 h-full transition-all duration-300 ease-out"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            <div className="text-[9px] text-center text-purple-600 font-black tracking-widest uppercase animate-pulse">
                                {isProcessing} in progress... {Math.round(progress)}%
                            </div>
                        </div>
                    )}

                    {statusMessage && !isProcessing && (
                        <div className="text-center py-1">
                            <span className="bg-indigo-50 text-indigo-600 text-[10px] font-black px-4 py-1.5 rounded-full border border-indigo-100 tracking-wider shadow-sm">
                                {statusMessage}
                            </span>
                        </div>
                    )}
                </div>

                {/* List Info & Pagination */}
                <div className="px-8 py-4 flex items-center justify-between border-b border-slate-50 bg-slate-50/30">
                    <div className="text-[10px] font-black text-slate-400 tracking-widest uppercase">
                        RECORDS: <span className="text-slate-900 ml-1">{totalCount}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            disabled={page === 1 || isLoading}
                            onClick={() => setPage(p => p - 1)}
                            className="text-slate-400 hover:text-indigo-600 disabled:opacity-10 transition-all active:scale-75"
                            aria-label="<"
                        >
                            <ChevronLeft size={28} strokeWidth={2.5} />
                        </button>

                        <div className="flex items-center gap-2 text-sm font-black font-mono">
                            <input
                                type="number"
                                value={page}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value);
                                    const maxPage = Math.ceil(totalCount / ITEMS_PER_PAGE) || 1;
                                    if (!isNaN(val) && val >= 1 && val <= maxPage) setPage(val);
                                }}
                                className="bg-white border border-slate-200 rounded-md w-12 h-8 text-center focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
                            />
                            <span className="text-slate-300">/</span>
                            <span className="text-slate-400">{totalPages}</span>
                        </div>

                        <button
                            disabled={page === totalPages || isLoading}
                            onClick={() => setPage(p => p + 1)}
                            className="text-slate-400 hover:text-indigo-600 disabled:opacity-10 transition-all active:scale-75"
                            aria-label=">"
                        >
                            <ChevronRight size={28} strokeWidth={2.5} />
                        </button>
                    </div>
                    <div className="w-24"></div>
                </div>

                {/* List Table */}
                <div className="flex-1 overflow-auto bg-white">
                    <table className="w-full text-left border-collapse table-fixed min-w-[1000px]">
                        <thead className="sticky top-0 bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 z-10">
                            <tr>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[180px]">ID</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[120px]">GPS</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[110px]">Type</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[200px]">Name</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">Value</th>
                                <th className="py-4 px-6 text-[10px] font-black text-slate-400 uppercase tracking-widest w-[100px]">Remove</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {cells.map(cell => (
                                <tr key={cell.id} className="hover:bg-slate-50/50 transition-colors group">
                                    <td className="py-4 px-6 font-mono text-[11px] text-slate-400 group-hover:text-slate-600">{cell.id}</td>
                                    <td className="py-4 px-6 text-[11px] text-slate-400 truncate">{cell.geo}</td>
                                    <td className="py-4 px-6">
                                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black tracking-tighter uppercase ${getAttrColor(cell.attribute)}`}>
                                            {cell.attribute}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-xs font-bold text-slate-800 truncate">{cell.name}</td>
                                    <td className="py-4 px-6 text-xs text-slate-500 truncate">{cell.value}</td>
                                    <td className="py-4 px-6 text-[11px] text-slate-300">{cell.remove}</td>
                                </tr>
                            ))}
                            {cells.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={6} className="py-32 text-center text-slate-300 font-black text-xs uppercase tracking-[0.3em]">
                                        Empty Storage
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

interface ActionButtonProps {
    children: React.ReactNode;
    onClick: () => void;
    variant: 'delete' | 'purple';
    active: boolean;
    disabled: boolean;
}

function ActionButton({ children, onClick, variant, active, disabled }: ActionButtonProps) {
    const base = "flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-[11px] uppercase tracking-wider border transition-all active:scale-95 shadow-sm";
    const styles = {
        delete: active
            ? "bg-red-500 border-red-500 text-white shadow-md shadow-red-200"
            : "bg-white border-red-100 text-red-500 hover:bg-red-50 hover:border-red-200",
        purple: active
            ? "bg-gradient-to-br from-indigo-600 to-purple-600 border-transparent text-white shadow-md shadow-indigo-200"
            : "bg-white border-slate-200 text-indigo-600 hover:bg-slate-50 hover:border-indigo-200"
    };

    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`${base} ${styles[variant]} disabled:opacity-20 disabled:grayscale disabled:pointer-events-none`}
        >
            {children}
        </button>
    );
}

function getAttrColor(attr: string) {
    switch (attr) {
        case 'Text': return 'bg-blue-50 text-blue-500 border border-blue-100';
        case 'Task': return 'bg-purple-50 text-purple-500 border border-purple-100';
        case 'Time': return 'bg-emerald-50 text-emerald-500 border border-emerald-100';
        default: return 'bg-slate-50 text-slate-400 border border-slate-100';
    }
}
