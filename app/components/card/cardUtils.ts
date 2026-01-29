import { Cell, CellAttribute, createCellId } from '@/app/lib/models/cell';
import { db } from '@/app/lib/db/db';
import { CellRepository } from '@/app/lib/db/operations';

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
    // Spec 5.1.1: Wait 1ms to ensure next ID is greater (using 2ms for safety)
    await sleep(2);

    // 2. Create Time Cell (Spec 5.1.1: Default Child Element)
    const timeId = createCellId();
    await sleep(2);

    // 3. Create Text Cell (Spec 5.1.1: Default Child Element)
    const textId = createCellId();

    const cardCell = new Cell({
        id: cardId,
        attribute: CellAttribute.Card,
        name: 'New Card',
        value: `${timeId} ${textId}`,
        remove: null
    });

    const timeCell = new Cell({
        id: timeId,
        attribute: CellAttribute.Time,
        name: 'Time',
        value: Date.now().toString(), // Current time
        remove: null
    });

    const textCell = new Cell({
        id: textId,
        attribute: CellAttribute.Text,
        name: '', // Empty name
        value: '', // Empty value
        remove: null
    });

    // Save to DB using Repository to ensure consistency
    await CellRepository.save(cardCell);
    await CellRepository.save(timeCell);
    await CellRepository.save(textCell);

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
    // Use Repository to get instances, but lightweight bulkGet from DB is faster for checking properties.
    // However, keeping consistent with "Entity" pattern:
    const childCells = await db.cells.bulkGet(childIds);

    const idsToRemove: string[] = [];
    const idsToKeep: string[] = [];

    childCells.forEach(cellDB => {
        if (!cellDB) return;

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

        // 2. Update Card value using Cell method
        // We need to ensure we work on the existing 'card' instance logic
        // But simply updating the value string is what validation expects.
        // Actually, we can just replace the value property.
        // Or if we use removeCellId iteratively. using join is faster.

        card.value = idsToKeep.join(' ');
        await CellRepository.save(card);
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

    let name = attribute === CellAttribute.Task ? 'New Task' : 'New Text';
    let value = attribute === CellAttribute.Task ? 'not done' : '';

    if (attribute === CellAttribute.Text) {
        name = '';
        value = '';
    }
    if (attribute === CellAttribute.Task) {
        name = '';
        value = 'not done';
    }

    const newCell = new Cell({
        id: newCellId,
        attribute: attribute,
        name: name,
        value: value,
        remove: null
    });

    // 2. Save Cell to DB
    await CellRepository.save(newCell);

    // 3. Update Card Value
    const card = await CellRepository.getById(cardId);
    if (card) {
        card.addCellId(newCellId);
        await CellRepository.save(card);
    }

    return newCell;
}
