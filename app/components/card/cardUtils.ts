import { Cell, CellAttribute, createCellId } from '@/app/lib/models/cell';
import { db } from '@/app/lib/db/db';

/**
 * Helper to sleep for ms
 */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * 新しいCardを作成し、初期セル（Time, Text）を自動生成してDBに保存する
 * @returns 作成されたCardセル
 */
export async function createCard(): Promise<Cell> {
    // 1. Create Card Cell
    const cardId = createCellId();
    // Wait 1ms to ensure next ID is greater
    await sleep(2);

    // 2. Create Time Cell
    const timeId = createCellId();
    await sleep(2);

    // 3. Create Text Cell
    const textId = createCellId();

    const cardCell: Cell = {
        id: cardId,
        attribute: CellAttribute.Card,
        name: 'New Card',
        value: `${timeId} ${textId}`,
        geo: null,
        remove: null
    };

    const timeCell: Cell = {
        id: timeId,
        attribute: CellAttribute.Time,
        name: 'Time',
        value: Date.now().toString(), // Current time
        geo: null,
        remove: null
    };

    const textCell: Cell = {
        id: textId,
        attribute: CellAttribute.Text,
        name: '', // Empty name
        value: '', // Empty value
        geo: null,
        remove: null
    };

    // Save to DB
    await db.cells.bulkPut([
        { I: cardCell.id, A: cardCell.attribute, N: cardCell.name, V: cardCell.value, G: cardCell.geo, R: cardCell.remove },
        { I: timeCell.id, A: timeCell.attribute, N: timeCell.name, V: timeCell.value, G: timeCell.geo, R: timeCell.remove },
        { I: textCell.id, A: textCell.attribute, N: textCell.name, V: textCell.value, G: textCell.geo, R: textCell.remove }
    ]);

    return cardCell;
}

/**
 * Cardに含まれる不要な空セル（Task, Text）を削除し、Cardのvalueを更新する
 * @param card 対象のCardセル
 */
export async function cleanupCardCells(card: Cell): Promise<void> {
    if (!card.value) return;

    const childIds = card.value.split(' ').filter(id => id.trim() !== '');
    if (childIds.length === 0) return;

    // Fetch all child cells
    const childCells = await db.cells.bulkGet(childIds);

    const idsToRemove: string[] = [];
    const idsToKeep: string[] = [];

    childCells.forEach(cellDB => {
        if (!cellDB) return; // Should not happen usually

        const shouldRemove =
            (cellDB.A === CellAttribute.Text && cellDB.N === '' && cellDB.V === '') ||
            (cellDB.A === CellAttribute.Task && cellDB.N === '');

        if (shouldRemove) {
            idsToRemove.push(cellDB.I);
        } else {
            idsToKeep.push(cellDB.I);
        }
    });

    if (idsToRemove.length > 0) {
        // 1. Delete from DB
        await db.cells.bulkDelete(idsToRemove);

        // 2. Update Card value
        await db.cells.update(card.id, {
            V: idsToKeep.join(' ')
        });
    }
}

/**
 * Cardに新しいセルを追加する
 * @param cardId 対象Card ID
 * @param attribute 追加する属性 (Text | Task)
 * @param currentIds 現在の並び順（表示されているIDリスト）- 挿入位置決定に使用
 */
export async function addCellToCard(cardId: string, attribute: CellAttribute, currentIds: string[]): Promise<Cell> {
    // 1. Create New Cell
    const newCellId = createCellId();
    // Wait a bit to ensure unique timestamp if called rapidly
    await sleep(2);

    const newCell: Cell = {
        id: newCellId,
        attribute: attribute,
        name: attribute === CellAttribute.Task ? 'New Task' : 'New Text', // Default names? Spec: "推定されたセルタイトルが自動入力される" -> "New Task" etc for now
        value: attribute === CellAttribute.Task ? 'not done' : '',
        geo: null,
        remove: null
    };

    if (attribute === CellAttribute.Text) {
        newCell.name = '';
        newCell.value = '';
    }
    if (attribute === CellAttribute.Task) {
        newCell.name = '';
        newCell.value = 'not done';
    }

    // 2. Save Cell to DB
    await db.cells.put({
        I: newCell.id,
        A: newCell.attribute,
        N: newCell.name,
        V: newCell.value,
        G: newCell.geo,
        R: newCell.remove
    });

    // 3. Update Card Value
    // We need to fetch the LATEST card value from DB to be safe, 
    // but we also need to respect the 'insertion position' if logic dictates.
    // Spec: "手動並べ替え機能が無効かつ...Cardセルのvalueに記録されている順序の位置に従い追加する"
    // Usually means append.

    // For now, always append to the end of the DB list.
    const card = await db.cells.get(cardId);
    if (card) {
        const currentDbIds = card.V.split(' ').filter(id => id.trim() !== '');
        currentDbIds.push(newCellId);

        await db.cells.update(cardId, {
            V: currentDbIds.join(' ')
        });
    }

    return newCell;
}
