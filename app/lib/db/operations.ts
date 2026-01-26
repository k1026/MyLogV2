import { Cell } from '../models/cell';
import { db, type DBCell } from './index';

/**
 * アプリケーションの Cell と DB の形式を相互変換するユーティリティ
 */
const mapper = {
    /**
     * Domain Model -> DB Data
     */
    toDB(cell: Cell): DBCell {
        const obj = cell.toObject();
        return {
            I: obj.id,
            A: obj.attribute,
            N: obj.name,
            V: obj.value,
            G: obj.geo.trim() === '' ? null : obj.geo,
            R: obj.remove.trim() === '' ? null : obj.remove,
        };
    },
    /**
     * DB Data -> Domain Model
     */
    fromDB(dbCell: DBCell): Cell {
        return Cell.fromObject({
            id: dbCell.I,
            attribute: dbCell.A,
            name: dbCell.N,
            value: dbCell.V,
            geo: dbCell.G ?? '',
            remove: dbCell.R ?? '',
        });
    }
};

/**
 * データベース操作を抽象化するリポジトリクラス
 * 仕様書: docs/specs/04_DatabaseSpecification.md
 */
export const CellRepository = {
    /**
     * データベース接続を確立する
     */
    async open(): Promise<void> {
        if (!db.isOpen()) {
            await db.open();
        }
    },

    /**
     * Cell オブジェクトを保存または更新する
     */
    async save(cell: Cell): Promise<void> {
        await db.cells.put(mapper.toDB(cell));
    },

    /**
     * IDを指定して特定のセルを取得する
     */
    async getById(id: string): Promise<Cell | null> {
        const result = await db.cells.get(id);
        return result ? mapper.fromDB(result) : null;
    },

    /**
     * IDの配列を指定して複数のセルを一括取得する
     */
    async getByIds(ids: string[]): Promise<Cell[]> {
        const results = await db.cells.bulkGet(ids);
        // bulkGetの結果は undefined を含みうるが、Dexieの型定義上 undefined をフィルタリングする
        return (results.filter((r): r is DBCell => r !== undefined)).map(mapper.fromDB);
    },

    /**
     * すべてのセルをIDの降順（新しい順）で取得する
     */
    async getAll(): Promise<Cell[]> {
        const results = await db.cells.reverse().toArray();
        return results.map(mapper.fromDB);
    },

    /**
     * IDを指定してセルを物理削除する
     */
    async deleteById(id: string): Promise<void> {
        await db.cells.delete(id);
    },

    /**
     * ストア内の全データを削除する
     */
    async truncate(): Promise<void> {
        await db.cells.clear();
    },

    /**
     * 保存されているセルの総数を取得する
     */
    async getCount(): Promise<number> {
        return await db.cells.count();
    },

    /**
     * 範囲指定で取得する（ID降順）
     */
    async getRange(offset: number, limit: number): Promise<Cell[]> {
        const results = await db.cells.reverse().offset(offset).limit(limit).toArray();
        return results.map(mapper.fromDB);
    },

    /**
     * 全データのキー(ID)のみを取得する
     */
    async getAllKeys(direction: 'next' | 'prev' = 'prev'): Promise<string[]> {
        const collection = direction === 'prev' ? db.cells.reverse() : db.cells.toCollection();
        return await collection.primaryKeys();
    },

    /**
     * 全データをバッチサイズごとに分割して処理する
     * トランザクション内で実行され、途中で失敗した場合はロールバックされる
     */
    async processAllInBatches(
        batchSize: number,
        callback: (cells: Cell[]) => Promise<void>
    ): Promise<void> {
        await db.transaction('rw', db.cells, async () => {
            let offset = 0;
            while (true) {
                const batch = await db.cells.offset(offset).limit(batchSize).toArray();
                if (batch.length === 0) break;
                await callback(batch.map(mapper.fromDB));
                offset += batchSize;
            }
        });
    }
};

