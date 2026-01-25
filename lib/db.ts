import Dexie, { type Table } from 'dexie';
import { z } from 'zod';

// --- Zod スキーマ定義 ---

/**
 * Todoアイテムのバリデーションスキーマ
 * titleは必須で1文字以上である必要があります。
 */
export const TodoSchema = z.object({
    id: z.number().optional(), // IndexedDBの自動増分ID
    title: z.string().min(1, { message: "タイトルは1文字以上入力してください" }),
    done: z.boolean().default(false),
    createdAt: z.date().default(() => new Date()),
});

// Zodスキーマから型を抽出
export type Todo = z.infer<typeof TodoSchema>;

// --- Dexie データベース定義 ---

/**
 * オフライン用データベースクラス
 */
export class OfflineAppDB extends Dexie {
    // 'todos' テーブルの定義
    todos!: Table<Todo>;

    constructor() {
        super('OfflineAppDB');

        // ストアの定義
        // id: プライマリキー (自動増分)
        // title, done, createdAt: インデックスを追加
        this.version(1).stores({
            todos: '++id, title, done, createdAt'
        });
    }
}

// データベースインスタンスの作成とエクスポート
export const db = new OfflineAppDB();
