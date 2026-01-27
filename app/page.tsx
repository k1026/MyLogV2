"use client";

import { useState, useCallback } from "react";
import { Cell } from "./lib/models/cell";
import { CellUI } from "@/components/cell/CellUI";
import { CellRepository } from "./lib/db/operations";
import { DbViewer } from "@/components/db/DbViewer";
import { Database } from "lucide-react";

/**
 * メイン画面コンポーネント
 * 仕様書: docs/specs/01_ProjectOverview.md
 */
export default function Home() {
  // 入力中のセルを保持するステート
  const [cell, setCell] = useState(() => Cell.create({ attribute: "Text" }));
  const [isSaving, setIsSaving] = useState(false);
  const [isDbViewerOpen, setIsDbViewerOpen] = useState(false);

  /**
   * セルの内容が更新されたときのハンドラ
   */
  const handleUpdate = useCallback(async (updatedCell: Cell) => {
    setCell(updatedCell);
  }, []);

  /**
   * 保存ボタンクリック時のハンドラ
   */
  const handleSave = async () => {
    try {
      setIsSaving(true);
      // データベースに保存
      await CellRepository.save(cell);
      // 新しい入力に備えてリセット（新しいTextセルを作成）
      setCell(Cell.create({ attribute: "Text" }));
    } catch (error) {
      console.error("Failed to save cell:", error);
      alert("保存に失敗しました。");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-4 space-y-8 bg-white text-slate-900 selection:bg-purple-100 italic-selection">
      {/* 画面右上のDBアイコンボタン */}
      <button
        onClick={() => setIsDbViewerOpen(true)}
        className="absolute top-6 right-6 p-3 rounded-full bg-white border border-slate-200 text-purple-600 hover:text-purple-700 hover:bg-slate-50 hover:border-purple-200 transition-all active:scale-90 shadow-sm"
        aria-label="Open Database Viewer"
      >
        <Database size={24} />
      </button>

      <main className="w-full max-w-2xl space-y-8">
        <h1 className="text-4xl font-black text-center tracking-tighter">
          <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">MY</span>
          <span className="text-slate-950">LOG</span>
        </h1>

        {/* 入力エリア: セルUIを一つ表示 */}
        <section className="w-full bg-slate-50/50 p-2 rounded-3xl border border-slate-100 shadow-sm">
          <CellUI key={cell.id} cell={cell} onUpdate={handleUpdate} autoFocus />
        </section>

        {/* 操作エリア: 保存ボタン */}
        <footer className="flex justify-center">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full max-w-xs rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 font-black text-white shadow-[0_10px_25px_-5px_rgba(99,102,241,0.4)] hover:shadow-[0_15px_30px_-5px_rgba(99,102,241,0.5)] active:scale-95 disabled:opacity-50 disabled:pointer-events-none transition-all duration-300"
          >
            {isSaving ? "SAVING..." : "SAVE LOG"}
          </button>
        </footer>
      </main>

      {/* DBビューアーダイアログ */}
      <DbViewer isOpen={isDbViewerOpen} onClose={() => setIsDbViewerOpen(false)} />
    </div>
  );
}
