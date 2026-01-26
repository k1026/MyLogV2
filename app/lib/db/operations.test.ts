import { describe, it, expect, beforeEach } from 'vitest';
import { CellRepository } from './operations';
import { Cell } from '../models/cell';
import { db } from './index';

/**
 * 手動でのモックデータ生成
 */
function mockCellData(overrides: Partial<Parameters<typeof Cell.create>[0]> = {}): Cell {
    return Cell.create({
        attribute: 'Text',
        name: 'Mock Name',
        value: 'Mock Value',
        ...overrides
    });
}

describe('CellRepository', () => {
    beforeEach(async () => {
        await db.cells.clear();
        if (!db.isOpen()) {
            await db.open();
        }
    });

    describe('save and get', () => {
        it('should save a cell and retrieve it by id', async () => {
            const cell = mockCellData();
            await CellRepository.save(cell);
            const retrieved = await CellRepository.getById(cell.id);

            expect(retrieved).not.toBeNull();
            expect(retrieved?.id).toBe(cell.id);
            expect(retrieved?.name).toBe(cell.name);
        });

        it('should return null for non-existent id', async () => {
            const retrieved = await CellRepository.getById('non-existent');
            expect(retrieved).toBeNull();
        });

        it('should be idempotent for saving the same cell', async () => {
            const cell = mockCellData();
            await CellRepository.save(cell);
            await CellRepository.save(cell);
            expect(await CellRepository.getCount()).toBe(1);
        });
    });

    describe('bulk operations', () => {
        it('should retrieve multiple cells by ids', async () => {
            const cell1 = mockCellData();
            const cell2 = mockCellData();
            await CellRepository.save(cell1);
            await CellRepository.save(cell2);

            const retrieved = await CellRepository.getByIds([cell1.id, cell2.id]);
            expect(retrieved).toHaveLength(2);
            expect(retrieved.map(c => c.id)).toContain(cell1.id);
            expect(retrieved.map(c => c.id)).toContain(cell2.id);
        });

        it('should handle missing ids in getByIds', async () => {
            const cell = mockCellData();
            await CellRepository.save(cell);
            const retrieved = await CellRepository.getByIds([cell.id, 'ghost-id']);
            expect(retrieved).toHaveLength(1);
            expect(retrieved[0].id).toBe(cell.id);
        });

        it('should return empty array for empty ids list', async () => {
            const retrieved = await CellRepository.getByIds([]);
            expect(retrieved).toHaveLength(0);
        });

        it('should get all cells in descending order of id', async () => {
            const cell1 = mockCellData({ name: 'A' });
            const cell2 = mockCellData({ name: 'B' });
            // IDは timestamp ベースなので、確実に順序をつけるために少し待つか、IDを手動で設定するか
            // 実際の実装では ID は timestamp-random
            await CellRepository.save(cell1);
            await CellRepository.save(cell2);

            const all = await CellRepository.getAll();
            expect(all).toHaveLength(2);
            // IDが大きい（新しい）方が先に来る
            const expectedFirst = cell1.id > cell2.id ? cell1 : cell2;
            expect(all[0].id).toBe(expectedFirst.id);
        });
    });

    describe('delete and count', () => {
        it('should delete a cell by id', async () => {
            const cell = mockCellData();
            await CellRepository.save(cell);
            expect(await CellRepository.getCount()).toBe(1);

            await CellRepository.deleteById(cell.id);
            expect(await CellRepository.getCount()).toBe(0);
        });

        it('should do nothing when deleting non-existent id (idempotency)', async () => {
            await CellRepository.deleteById('non-existent');
            expect(await CellRepository.getCount()).toBe(0);
        });

        it('should truncate all cells', async () => {
            await CellRepository.save(mockCellData());
            await CellRepository.save(mockCellData());
            expect(await CellRepository.getCount()).toBe(2);

            await CellRepository.truncate();
            expect(await CellRepository.getCount()).toBe(0);
        });
    });

    describe('pagination and keys', () => {
        it('should get a range of cells', async () => {
            const cells = [];
            for (let i = 0; i < 5; i++) {
                const c = mockCellData();
                await CellRepository.save(c);
                cells.push(c);
            }
            // ID降順にソート
            cells.sort((a, b) => b.id.localeCompare(a.id));

            const range = await CellRepository.getRange(1, 2);
            expect(range).toHaveLength(2);
            expect(range[0].id).toBe(cells[1].id);
            expect(range[1].id).toBe(cells[2].id);
        });

        it('should handle out of bounds range', async () => {
            await CellRepository.save(mockCellData());
            const range = await CellRepository.getRange(10, 5);
            expect(range).toHaveLength(0);
        });

        it('should get all keys in specified direction', async () => {
            const cell1 = mockCellData();
            const cell2 = mockCellData();
            await CellRepository.save(cell1);
            await CellRepository.save(cell2);

            const sortedIds = [cell1.id, cell2.id].sort();

            const keysNext = await CellRepository.getAllKeys('next');
            expect(keysNext).toEqual(sortedIds);

            const keysPrev = await CellRepository.getAllKeys('prev');
            expect(keysPrev).toEqual([...sortedIds].reverse());
        });
    });

    describe('batch processing', () => {
        it('should process all cells in batches', async () => {
            const count = 5;
            for (let i = 0; i < count; i++) {
                await CellRepository.save(mockCellData());
            }

            let processedCount = 0;
            await CellRepository.processAllInBatches(2, async (batch) => {
                processedCount += batch.length;
            });

            expect(processedCount).toBe(count);
        });

        it('should handle zero cells in batch processing', async () => {
            let callCount = 0;
            await CellRepository.processAllInBatches(10, async () => {
                callCount++;
            });
            expect(callCount).toBe(0);
        });
    });
});

