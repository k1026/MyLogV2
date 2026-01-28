'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Database, X, ChevronLeft, ChevronRight, Trash2, Loader2 } from 'lucide-react';
import { CellRepository, ImportResult } from '@/app/lib/db/operations';
import { Cell } from '@/app/lib/models/cell';
import { cn } from '@/app/lib/utils';

interface DbViewerProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * データベース閲覧・管理ダイアログ
 */
export const DbViewer: React.FC<DbViewerProps> = ({ isOpen, onClose }) => {
    const [cells, setCells] = useState<Cell[]>([]);
    const [totalCount, setTotalCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [processingAction, setProcessingAction] = useState<'delete' | 'append' | 'export' | null>(null);
    const [progress, setProgress] = useState(0);
    const itemsPerPage = 100;

    const [isEditingPage, setIsEditingPage] = useState(false);
    const pageInputRef = useRef<HTMLInputElement>(null);

    // データ取得
    const fetchData = async (page: number) => {
        setIsLoading(true);
        try {
            const count = await CellRepository.getCount();
            setTotalCount(count);

            const offset = (page - 1) * itemsPerPage;
            const data = await CellRepository.getRange(offset, itemsPerPage);
            setCells(data);
        } catch (error) {
            console.error('Failed to fetch DB data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (isOpen) {
            fetchData(currentPage);
        }
    }, [isOpen, currentPage]);

    useEffect(() => {
        if (isEditingPage) {
            pageInputRef.current?.focus();
            pageInputRef.current?.select();
        }
    }, [isEditingPage]);

    if (!isOpen) return null;

    const totalPages = Math.max(1, Math.ceil(totalCount / itemsPerPage));

    const handleDeleteDB = async () => {
        if (confirm('データベースを全削除します。よろしいですか？')) {
            setProcessingAction('delete');
            try {
                await CellRepository.clearAll();
                await fetchData(1);
                setCurrentPage(1);
            } finally {
                setProcessingAction(null);
            }
        }
    };

    const handleRemoveCell = async (id: string) => {
        try {
            await CellRepository.delete(id);
            await fetchData(currentPage);
        } catch (error) {
            console.error('Failed to delete cell:', error);
        }
    };

    const handleExport = async () => {
        setProcessingAction('export');
        setProgress(10); // Start
        try {
            const jsonl = await CellRepository.exportAsJSONL();
            setProgress(80);
            const blob = new Blob([jsonl], { type: 'application/x-jsonlines' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `mylog_export_${new Date().toISOString().split('T')[0]}.jsonl`;
            a.click();
            URL.revokeObjectURL(url);
            setProgress(100);
            alert(`エクスポート完了: ${totalCount}件を出力しました`);
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setTimeout(() => {
                setProcessingAction(null);
                setProgress(0);
            }, 500);
        }
    };

    const handleAppend = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.jsonl';
        input.onchange = async (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (!file) return;

            setProcessingAction('append');
            setProgress(20);
            const reader = new FileReader();
            reader.onload = async (event) => {
                try {
                    const content = event.target?.result as string;
                    setProgress(50);
                    const result: ImportResult = await CellRepository.importFromJSONL(content);
                    setProgress(100);
                    alert(`追加完了: 成功:${result.successCount}件, 失敗:${result.failureCount}件`);
                    fetchData(currentPage);
                } catch (error) {
                    console.error('Import failed:', error);
                } finally {
                    setProcessingAction(null);
                    setProgress(0);
                }
            };
            reader.readAsText(file);
        };
        input.click();
    };

    const handlePageSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const next = parseInt(pageInputRef.current?.value || '1');
        if (!isNaN(next) && next >= 1 && next <= totalPages) {
            setCurrentPage(next);
        }
        setIsEditingPage(false);
    };

    return (
        <div
            data-testid="db-viewer-overlay"
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-in fade-in duration-300"
        >
            <div className="relative w-full max-w-6xl h-[92vh] bg-white rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-500 border border-slate-200">
                {/* 閉じるボタン */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 w-12 h-12 flex items-center justify-center bg-white rounded-2xl text-purple-400 hover:text-purple-600 border border-purple-100 shadow-lg shadow-purple-500/10 transition-all hover:scale-110 active:scale-90 z-20"
                    aria-label="閉じる"
                >
                    <X size={28} />
                </button>

                {/* ヘッダーセクション */}
                <div className="flex flex-col items-center pt-10 pb-6 bg-gradient-to-b from-slate-50 to-white">
                    <div className="flex items-center gap-4 group">
                        <div className="p-4 bg-purple-100/50 rounded-3xl text-purple-600 shadow-inner group-hover:scale-110 transition-transform duration-500">
                            <Database size={40} />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xs font-black text-purple-400 tracking-[0.3em] leading-none mb-1">LOCAL</span>
                            <h2 className="text-3xl font-black text-slate-800 tracking-tight leading-none italic">Database</h2>
                        </div>
                    </div>

                    {/* 操作ボタン */}
                    <div className="flex gap-6 mt-10">
                        <button
                            onClick={handleDeleteDB}
                            disabled={!!processingAction || isLoading}
                            className={cn(
                                "px-8 py-3 border-2 border-red-200 text-red-500 rounded-2xl font-black tracking-wider transition-all shadow-lg shadow-red-500/5",
                                processingAction === 'delete'
                                    ? "bg-red-500 text-white border-red-500 scale-95"
                                    : "hover:bg-red-500 hover:text-white hover:border-red-500 hover:-translate-y-1 active:scale-95",
                                (!!processingAction && processingAction !== 'delete') && "opacity-30 grayscale cursor-not-allowed"
                            )}
                        >
                            {processingAction === 'delete' ? <Loader2 className="animate-spin inline mr-2" /> : null}
                            DELETE DB
                        </button>
                        <button
                            onClick={handleAppend}
                            disabled={!!processingAction || isLoading}
                            className={cn(
                                "px-8 py-3 border-2 border-purple-200 text-purple-500 rounded-2xl font-black tracking-wider transition-all shadow-lg shadow-purple-500/5",
                                processingAction === 'append'
                                    ? "bg-purple-500 text-white border-purple-500 scale-95"
                                    : "hover:bg-purple-500 hover:text-white hover:border-purple-500 hover:-translate-y-1 active:scale-95",
                                (!!processingAction && processingAction !== 'append') && "opacity-30 grayscale cursor-not-allowed"
                            )}
                        >
                            {processingAction === 'append' ? <Loader2 className="animate-spin inline mr-2" /> : null}
                            APPEND
                        </button>
                        <button
                            onClick={handleExport}
                            disabled={!!processingAction || isLoading}
                            className={cn(
                                "px-8 py-3 border-2 border-purple-200 text-purple-500 rounded-2xl font-black tracking-wider transition-all shadow-lg shadow-purple-500/5",
                                processingAction === 'export'
                                    ? "bg-purple-500 text-white border-purple-500 scale-95"
                                    : "hover:bg-purple-500 hover:text-white hover:border-purple-500 hover:-translate-y-1 active:scale-95",
                                (!!processingAction && processingAction !== 'export') && "opacity-30 grayscale cursor-not-allowed"
                            )}
                        >
                            {processingAction === 'export' ? <Loader2 className="animate-spin inline mr-2" /> : null}
                            EXPORT
                        </button>
                    </div>

                    {/* プログレスバー */}
                    {processingAction && (
                        <div className="w-96 h-1.5 bg-slate-100 rounded-full mt-6 overflow-hidden">
                            <div
                                className="h-full bg-purple-500 transition-all duration-300 ease-out"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    )}
                </div>

                {/* リストコントロール */}
                <div className="px-10 py-4 flex items-center justify-between border-b border-slate-100 bg-white sticky top-0 z-30">
                    <div className="text-sm font-bold text-slate-400">
                        アイテム数: <span className="text-slate-800 text-lg ml-2 font-black">{totalCount}</span>
                    </div>

                    <div className="flex items-center gap-6">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1 || !!processingAction || isLoading}
                            className="p-2 text-purple-500 hover:bg-purple-50 rounded-2xl disabled:text-slate-200 transition-all hover:scale-110 active:scale-90"
                            aria-label="<"
                        >
                            <ChevronLeft size={32} />
                        </button>

                        <div className="text-xl font-black text-slate-800 flex items-center gap-2">
                            {isEditingPage ? (
                                <form onSubmit={handlePageSubmit}>
                                    <input
                                        ref={pageInputRef}
                                        type="number"
                                        defaultValue={currentPage}
                                        className="w-16 h-10 text-center border-2 border-purple-200 rounded-xl outline-none focus:border-purple-500"
                                        onBlur={() => setIsEditingPage(false)}
                                    />
                                </form>
                            ) : (
                                <span
                                    onClick={() => setIsEditingPage(true)}
                                    className="cursor-pointer hover:text-purple-600 transition-colors border-b-4 border-purple-100 h-8 flex items-center px-2"
                                >
                                    {currentPage}
                                </span>
                            )}
                            <span className="text-slate-300 font-light text-2xl">/</span>
                            <span className="text-slate-400">{totalPages}</span>
                        </div>

                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages || !!processingAction || isLoading}
                            className="p-2 text-purple-500 hover:bg-purple-50 rounded-2xl disabled:text-slate-200 transition-all hover:scale-110 active:scale-90"
                            aria-label=">"
                        >
                            <ChevronRight size={32} />
                        </button>
                    </div>

                    <div className="w-32"></div> {/* バランス用 */}
                </div>

                {/* データテーブル */}
                <div className="flex-1 overflow-auto bg-slate-50/50 scrollbar-thin scrollbar-thumb-slate-200">
                    <table className="w-full border-separate border-spacing-0">
                        <thead className="sticky top-0 bg-white/80 backdrop-blur-md z-20">
                            <tr>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-left border-b border-slate-100">ID</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-left border-b border-slate-100">GPS</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-left border-b border-slate-100">ATTRIBUTE</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-left border-b border-slate-100">NAME</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-left border-b border-slate-100">VALUE</th>
                                <th className="px-6 py-4 text-xs font-black text-slate-400 uppercase tracking-widest text-center border-b border-slate-100">REMOVE</th>
                            </tr>
                        </thead>
                        <tbody>
                            {cells.length > 0 ? (
                                cells.map(cell => (
                                    <tr key={cell.id} className="group hover:bg-white transition-all duration-300">
                                        <td className="px-6 py-4 border-b border-slate-50">
                                            <span className="font-mono text-[10px] text-slate-300 group-hover:text-slate-800 transition-colors uppercase">{cell.id}</span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-slate-50 text-slate-500 font-medium">
                                            {cell.geo || <span className="text-slate-200">—</span>}
                                        </td>
                                        <td className="px-6 py-4 border-b border-slate-50">
                                            <span className="inline-flex items-center px-3 py-1 bg-indigo-50 text-indigo-500 rounded-lg text-[9px] font-black uppercase tracking-wider group-hover:bg-indigo-500 group-hover:text-white transition-all">
                                                {cell.attribute}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 border-b border-slate-50 font-bold text-slate-700 tracking-tight">{cell.name}</td>
                                        <td className="px-6 py-4 border-b border-slate-50 text-slate-500 truncate max-w-[200px]">{cell.value}</td>
                                        <td className="px-6 py-4 border-b border-slate-50 text-center">
                                            <button
                                                onClick={() => handleRemoveCell(cell.id)}
                                                className="p-3 text-slate-200 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all hover:scale-110"
                                                aria-label="Remove"
                                            >
                                                <Trash2 size={20} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-32 text-center">
                                        {isLoading ? (
                                            <div className="flex flex-col items-center gap-4">
                                                <Loader2 className="animate-spin text-purple-200" size={48} />
                                                <span className="text-slate-300 font-black tracking-widest text-xs">LOADING DATABASE...</span>
                                            </div>
                                        ) : (
                                            <span className="text-slate-300 font-black italic tracking-widest">NO DATA FOUND</span>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
