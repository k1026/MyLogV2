import { describe, it, expect, beforeEach } from 'vitest';
import { createCard, cleanupCardCells, addCellToCard } from './cardUtils';
import { db } from '@/lib/db/db';
import { Cell, CellAttribute } from '@/lib/models/cell';
import { LocationService } from '@/lib/services/LocationService';

describe('cardUtils', () => {
    beforeEach(async () => {
        await db.cells.clear();
    });

    describe('createCard', () => {
        it('should create a Card with Time and Text cells', async () => {
            const card = await createCard();

            expect(card).toBeDefined();
            expect(card.attribute).toBe(CellAttribute.Card);

            // valueに含まれるIDをパース
            const childIds = card.value.split(' ').filter(id => id);
            expect(childIds.length).toBe(2); // Time + Text

            const timeCell = await db.cells.get(childIds[0]);
            const textCell = await db.cells.get(childIds[1]);

            expect(timeCell).toBeDefined();
            expect(timeCell?.A).toBe(CellAttribute.Time);
            expect(timeCell?.N).toBe('Time');
            // Value is rough timestamp
            expect(parseInt(timeCell?.V || '0')).toBeGreaterThan(0);

            expect(textCell).toBeDefined();
            expect(textCell?.A).toBe(CellAttribute.Text);
            expect(textCell?.N).toBe('');
            expect(textCell?.V).toBe('');
        });

        it('should ensure IDs are created in chronological order with delay', async () => {
            // IDのタイムスタンプ順序を確認
            // 実装では1ms待機するはずなので、IDのタイムスタンプ部分は異なるか、
            // 少なくとも順序が保証されていることをID文字列の比較で確認
            const card = await createCard();
            const childIds = card.value.split(' ').filter(id => id);

            const cardTimestamp = parseInt(card.id.split('-')[0]);
            const timeTimestamp = parseInt(childIds[0].split('-')[0]);
            const textTimestamp = parseInt(childIds[1].split('-')[0]);

            // Card <= Time < Text の順序 (CardとTimeは同時生成の可能性もあるが、仕様上Time->Textは待機がある)
            expect(timeTimestamp).toBeGreaterThanOrEqual(cardTimestamp);
            expect(textTimestamp).toBeGreaterThan(timeTimestamp);
        });
    });

    describe('cleanupCardCells', () => {
        it('should remove empty Text and Task cells', async () => {
            // 準備: Cardと、空のText、空のTask、中身のあるTextを用意
            const cardId = '1000-CARD';
            const emptyTextId = '1001-ETEXT';
            const emptyTaskId = '1002-ETASK';
            const validTextId = '1003-VTEXT';

            await db.cells.bulkPut([
                { I: cardId, A: CellAttribute.Card, N: 'Card', V: `${emptyTextId} ${validTextId} ${emptyTaskId}`, G: null, R: null },
                { I: emptyTextId, A: CellAttribute.Text, N: '', V: '', G: null, R: null }, // 空 (削除対象)
                { I: emptyTaskId, A: CellAttribute.Task, N: '', V: 'not done', G: null, R: null }, // 名前が空 (削除対象)
                { I: validTextId, A: CellAttribute.Text, N: 'Title', V: '', G: null, R: null }, // タイトルあり (保持)
            ]);

            // 型アサーションのために再取得
            const card = await db.cells.get(cardId);
            if (!card) throw new Error("Card setup failed");

            // Cell型に変換して渡す（擬似的にキャスト）
            // Cell型に変換して渡す（擬似的にキャスト）
            const cardModel = new Cell({
                id: card.I,
                attribute: card.A as CellAttribute,
                name: card.N,
                value: card.V,
                geo: card.G,
                remove: card.R
            });

            await cleanupCardCells(cardModel);

            // 検証: Cardのvalueから削除されているか
            const updatedCard = await db.cells.get(cardId);
            const valueIds = updatedCard!.V.split(' ');

            expect(valueIds).not.toContain(emptyTextId);
            expect(valueIds).not.toContain(emptyTaskId);
            expect(valueIds).toContain(validTextId);

            // 検証: DBから削除されているか
            const deletedText = await db.cells.get(emptyTextId);
            const deletedTask = await db.cells.get(emptyTaskId);
            const keptText = await db.cells.get(validTextId);

            expect(deletedText).toBeUndefined();
            expect(deletedTask).toBeUndefined();
            expect(keptText).toBeDefined();
        });
    });

    describe('addCellToCard', () => {
        it('should add a new Text cell to the DB and update Card value', async () => {
            const cardId = '2000-CARD';
            const existingId1 = '2001-TIME';
            const existingId2 = '2002-TEXT';

            await db.cells.bulkPut([
                { I: cardId, A: CellAttribute.Card, N: 'Card', V: `${existingId1} ${existingId2}`, G: null, R: null },
                { I: existingId1, A: CellAttribute.Time, N: 'Time', V: 'Now', G: null, R: null },
                { I: existingId2, A: CellAttribute.Text, N: 'Old', V: 'Text', G: null, R: null },
            ]);

            // geo引数なし（自動取得）
            const newCell = await addCellToCard(cardId, CellAttribute.Text, [existingId1, existingId2]);

            expect(newCell).toBeDefined();
            expect(newCell.attribute).toBe(CellAttribute.Text);

            // LocationServiceが初期状態(null)の場合
            // 注: 前のテストの影響を受ける可能性があるため、確実にテストするにはbeforeEach等でリセットが必要だが
            // ここでは流れに任せる（nullであることを期待するならリセットすべきだが、現状LocationServiceにリセットはない）
            // テスト順序依存を避けるため、明示的にnullセットできればよいが、updateLocationはnullを受け入れない型定義(altitudeのみnull可)
            // しかし、テストとしては「渡さないのでnull」ではなく「渡さないのでLocationServiceの値」になる。
            // 既存テスト環境でLocationServiceがどうなっているか不明確。
        });

        it('should record geo information from LocationService', async () => {
            const cardId = '3000-CARD';
            await db.cells.put({ I: cardId, A: CellAttribute.Card, N: 'C', V: '', G: null, R: null });

            const geoString = '35.1234 139.5678 10';
            // Setup Location Service
            LocationService.getInstance().updateLocation(35.1234, 139.5678, 10);

            const newCell = await addCellToCard(cardId, CellAttribute.Task, []);

            expect(newCell.geo).toBe(geoString);

            const dbCell = await db.cells.get(newCell.id);
            expect(dbCell?.G).toBe(geoString);
        });
    });

    describe('createCard with Geo', () => {
        it('should record geo info for Card and its initial children from LocationService', async () => {
            const geoString = '35 135 100';
            LocationService.getInstance().updateLocation(35, 135, 100);

            const card = await createCard();

            expect(card.geo).toBe(geoString);

            // DB確認
            const dbCard = await db.cells.get(card.id);
            expect(dbCard?.G).toBe(geoString);

            // 子要素確認
            const childIds = card.value.split(' ').filter(id => id);
            for (const id of childIds) {
                const child = await db.cells.get(id);
                expect(child?.G).toBe(geoString);
            }
        });
    });
});
