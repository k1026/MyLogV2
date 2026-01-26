import { describe, it, expect } from 'vitest';
import { db, MyLogV2DB } from './index';

describe('MyLogV2DB (Singleton)', () => {
    it('db インスタンスを複数回参照しても、それらが全く同一のオブジェクトであること', () => {
        const db1 = db;
        const db2 = db;
        expect(db1).toBe(db2);
        expect(db1).toBeInstanceOf(MyLogV2DB);
    });

    it('データベースが正しく初期化できる状態であること', () => {
        expect(db.cells).toBeDefined();
        expect(db.name).toBe('MyLogV2DB');
    });

    it('globalThis を介してインスタンスが共有されていること (擬似的な検証)', () => {
        const globalForDb = globalThis as unknown as { db: MyLogV2DB | undefined };
        expect(globalForDb.db).toBe(db);
    });
});
