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

// --- データベースインスタンスのシングルトン化 ---

/**
 * Next.jsのホットリロード時にインスタンスが多重生成されるのを防ぐための定義
 */
const globalForDb = globalThis as unknown as {
    db: OfflineAppDB | undefined;
};

// 既存のインスタンスがあればそれを使用し、なければ新規作成
export const db = globalForDb.db ?? new OfflineAppDB();

// 開発環境の場合は globalThis に保存して再利用可能にする
if (process.env.NODE_ENV !== 'production') {
    globalForDb.db = db;
}
