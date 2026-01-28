import { describe, it, expect, beforeEach } from 'vitest';
import { createCard, cleanupCardCells, addCellToCard } from './cardUtils';
import { db } from '@/app/lib/db/db';
import { CellAttribute } from '@/app/lib/models/cell';

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
            const cardModel = {
                id: card.I,
                attribute: card.A as CellAttribute,
                name: card.N,
                value: card.V,
                geo: card.G,
                remove: card.R
            };

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

            const newCell = await addCellToCard(cardId, CellAttribute.Text, [existingId1, existingId2, 'temp-id']);
            // 'temp-id' assumes optimistic UI update might pass it, but function should probably use DB state + insertion logic
            // Spec says: "Cardセルのvalueに記録されている順序の位置に従い追加する" or follows sort.
            // But Card.value stores the MASTER order.
            // If we use sorting, the UI list is separated from DB storage order until manually reordered.
            // However, spec 5.3.2.4.1 says: "セルUIの追加位置はその時点のソート条件に依存する"
            // And if Manual/Default, it follows Card.value order.

            // The function implementation should essentially:
            // 1. Create new cell
            // 2. Add to DB
            // 3. Append to Card.value (Simple implementation first, or complex insertion?)
            // Spec says: "手動並べ替え機能が無効かつ、生成時間順のソートが無効...Cardセルのvalueに記録されている順序の位置に従い追加する"
            // Usually this means Append to end.

            expect(newCell).toBeDefined();
            expect(newCell.attribute).toBe(CellAttribute.Text);

            // Verify DB update
            const card = await db.cells.get(cardId);
            expect(card?.V).toContain(newCell.id);
            expect(card?.V.endsWith(newCell.id)).toBe(true); // Should append by default if no index specified?

            const addedCell = await db.cells.get(newCell.id);
            expect(addedCell).toBeDefined();
        });
    });
});
