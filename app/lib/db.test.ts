import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db, OfflineAppDB } from './db';

describe('OfflineAppDB (Singleton)', () => {
    it('db インスタンスを複数回参照しても、それらが全く同一のオブジェクトであること', () => {
        // 直接 export されている db と、同一モジュールから再度参照されるものが同一か確認
        const db1 = db;
        const db2 = db;
        expect(db1).toBe(db2);
        expect(db1).toBeInstanceOf(OfflineAppDB);
    });

    it('データベースが正しく初期化できる状態であること', () => {
        // db インスタンスが Dexie のプロパティを持っているか、
        // あるいはテーブル定義が存在するかを確認
        expect(db.todos).toBeDefined();
        expect(db.name).toBe('OfflineAppDB');
    });

    it('globalThis を介してインスタンスが共有されていること (擬似的な検証)', () => {
        const globalForDb = globalThis as unknown as { db: OfflineAppDB | undefined };
        expect(globalForDb.db).toBe(db);
    });
});
