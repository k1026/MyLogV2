/**
 * @vitest-environment jsdom
 */
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach } from 'vitest';
import { CellRepository } from './operations';
import { Cell, CellAttribute } from '../models/cell';

// Mock data
// Mock data
const mockCell1 = new Cell({
    id: 'cell-001',
    attribute: CellAttribute.Text,
    name: 'Test Cell 1',
    value: 'Value 1',
    geo: null,
    remove: null
});

const mockCell2 = new Cell({
    id: 'cell-002',
    attribute: CellAttribute.Time,
    name: 'Test Cell 2',
    value: 'Value 2 with geo',
    geo: '35.6895,139.6917',
    remove: null
});

const mockCell3 = new Cell({
    id: 'cell-003',
    attribute: CellAttribute.Task,
    name: 'Test Cell 3',
    value: 'Value 3',
    geo: null,
    remove: '2023-01-01T00:00:00.000Z'
});

describe('CellRepository', () => {

    beforeEach(async () => {
        // Need to ensure clean start. 
        // In "fail first" phase, clearAll will throw error, which is fine (matches "fail").
        // But to make test framework run smoothly until expectation failure, we might catch it, 
        // but the rule says "論理的に失敗（Red）" is good.
        // However, if beforeEach fails, tests might not run their assertions. 
        // We want the TEST assertions to fail or the method call to throw "Not Implemented". 
        // "Not implemented" throw is a valid Failure for TDD.
        try {
            await CellRepository.clearAll();
        } catch (e) {
            // Ignore clearAll error in setup phase if it's just "Not implemented" 
            // to allow individual tests to run and fail on their own implementation calls.
            // But if clearAll is vital, then failing here is also "Red".
            // I'll accept failure here.
        }
    });

    describe('Data Mapping', () => {
        it('should correctly map Cell to CellDB and back', () => {
            const dbObj = CellRepository.mapToDB(mockCell1);
            expect(dbObj).toEqual({
                I: mockCell1.id,
                A: mockCell1.attribute,
                N: mockCell1.name,
                V: mockCell1.value,
                G: mockCell1.geo,
                R: mockCell1.remove
            });

            const restored = CellRepository.mapFromDB(dbObj);
            expect(restored).toEqual(mockCell1);
        });

        it('should handle complex values correctly', () => {
            const dbObj = CellRepository.mapToDB(mockCell2);
            expect(dbObj.G).toBe('35.6895,139.6917');
            const restored = CellRepository.mapFromDB(dbObj);
            expect(restored.geo).toBe('35.6895,139.6917');
        });
    });

    describe('Basic CRUD', () => {
        it('should save and retrieve a cell', async () => {
            await CellRepository.save(mockCell1);
            const retrieved = await CellRepository.getById(mockCell1.id);
            expect(retrieved).toEqual(mockCell1);
            expect(retrieved).toBeInstanceOf(Cell);
        });

        it('should return undefined for non-existent cell', async () => {
            const retrieved = await CellRepository.getById('non-existent');
            expect(retrieved).toBeUndefined();
        });

        it('should update an existing cell', async () => {
            await CellRepository.save(mockCell1);
            // new Cell() to ensure it's a valid instance with methods, because spread syntax on class instance returns POJO in JS/TS
            const updated = new Cell({ ...mockCell1, value: "Updated Value" });
            await CellRepository.save(updated);

            const retrieved = await CellRepository.getById(mockCell1.id);
            expect(retrieved).toEqual(updated);
            expect(retrieved).toBeInstanceOf(Cell);

            // Verify count is still 1
            const count = await CellRepository.getCount();
            expect(count).toBe(1);
        });

        it('should delete a cell', async () => {
            await CellRepository.save(mockCell1);
            await CellRepository.delete(mockCell1.id);
            const retrieved = await CellRepository.getById(mockCell1.id);
            expect(retrieved).toBeUndefined();
        });
    });

    describe('Bulk Operations', () => {
        it('should get multiple cells by IDs', async () => {
            await CellRepository.save(mockCell1);
            await CellRepository.save(mockCell2);
            await CellRepository.save(mockCell3);

            const results = await CellRepository.getByIds([mockCell1.id, mockCell3.id]);
            expect(results).toHaveLength(2);
            const ids = results.map(c => c.id);
            expect(ids).toContain(mockCell1.id);
            expect(ids).toContain(mockCell3.id);
        });

        it('should return all cells sorted by ID descending', async () => {
            // IDs are strings. cell-001, cell-002, cell-003. Descending: 003, 002, 001.
            await CellRepository.save(mockCell1);
            await CellRepository.save(mockCell3);
            await CellRepository.save(mockCell2);

            const all = await CellRepository.getAll();
            expect(all).toHaveLength(3);
            expect(all[0].id).toBe(mockCell3.id);
            expect(all[1].id).toBe(mockCell2.id);
            expect(all[2].id).toBe(mockCell1.id);
        });

        it('should clear all cells', async () => {
            await CellRepository.save(mockCell1);
            await CellRepository.save(mockCell2);
            await CellRepository.clearAll();
            const count = await CellRepository.getCount();
            expect(count).toBe(0);
        });
    });

    describe('Advanced Retrieval', () => {
        it('should get cells with pagination (key range)', async () => {
            // Insert 5 cells
            for (let i = 1; i <= 5; i++) {
                await CellRepository.save(new Cell({ ...mockCell1, id: `cell-00${i}`, value: `V${i}` }));
            }
            // Descending order of IDs: 005, 004, 003, 002, 001

            // Offset 0, Limit 2 -> 005, 004
            const page1 = await CellRepository.getRange(0, 2);
            expect(page1).toHaveLength(2);
            expect(page1[0].id).toBe('cell-005');
            expect(page1[1].id).toBe('cell-004');

            // Offset 2, Limit 2 -> 003, 002
            const page2 = await CellRepository.getRange(2, 2);
            expect(page2).toHaveLength(2);
            expect(page2[0].id).toBe('cell-003');
            expect(page2[1].id).toBe('cell-002');

            // Offset 4, Limit 2 -> 001
            const page3 = await CellRepository.getRange(4, 2);
            expect(page3).toHaveLength(1);
            expect(page3[0].id).toBe('cell-001');
        });

        it('should get all keys', async () => {
            await CellRepository.save(mockCell1);
            await CellRepository.save(mockCell2); // 002 > 001

            const keysPrev = await CellRepository.getAllKeys('prev'); // Descending
            expect(keysPrev).toEqual(['cell-002', 'cell-001']);

            const keysNext = await CellRepository.getAllKeys('next'); // Ascending
            expect(keysNext).toEqual(['cell-001', 'cell-002']);
        });
    });

    describe('Batch Processing', () => {
        it('should process all records in batches', async () => {
            // Insert 5 cells
            const cells = [];
            for (let i = 1; i <= 5; i++) {
                const c = new Cell({ ...mockCell1, id: `cell-00${i}`, value: `V${i}` });
                await CellRepository.save(c);
                cells.push(c);
            }

            const processedIds: string[] = [];
            await CellRepository.processAllInBatches(2, async (batch) => {
                batch.forEach(c => processedIds.push(c.id));
            });

            expect(processedIds).toHaveLength(5);
            expect(processedIds.sort()).toEqual(cells.map(c => c.id).sort());
        });
    });
});
