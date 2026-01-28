
import { z } from 'zod';

// Cellの属性定義
export enum CellAttribute {
    Card = 'Card',
    Time = 'Time',
    Text = 'Text',
    Task = 'Task',
}

// Zodスキーマ定義
export const CellSchema = z.object({
    id: z.string().regex(/^\d{13}-[A-Z0-9]{5}$/, "不正なCell IDフォーマットです"),
    attribute: z.nativeEnum(CellAttribute),
    name: z.string(),
    value: z.string(),
    // 緯度 経度 高度 (スペース区切り)。非存在時は null
    geo: z.string().nullable(),
    // 削除時はTimestamp文字列。未削除時は null
    remove: z.string().nullable(),
});

// TypeScript型定義
export type Cell = z.infer<typeof CellSchema>;

// Cell ID生成関数
// フォーマット: [Unix timestamp in ms]-[5-digit random uppercase alphanumeric]
export function createCellId(): string {
    const timestamp = Date.now().toString();
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 5; i++) {
        randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${timestamp}-${randomPart}`;
}
