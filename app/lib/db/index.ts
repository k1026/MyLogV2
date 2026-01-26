import { MyLogV2DB } from './schema';

/**
 * Next.jsのホットリロード時にインスタンスが多重生成されるのを防ぐための定義
 */
const globalForDb = globalThis as unknown as {
    db: MyLogV2DB | undefined;
};

// 既存のインスタンスがあればそれを使用し、なければ新規作成
export const db = globalForDb.db ?? new MyLogV2DB();

// 開発環境の場合は globalThis に保存して再利用可能にする
if (process.env.NODE_ENV !== 'production') {
    globalForDb.db = db;
}

export { MyLogV2DB } from './schema';
export type { DBCell } from './schema';
