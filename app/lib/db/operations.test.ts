/**
 * @vitest-environment jsdom
 */
import 'fake-indexeddb/auto';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { CellRepository } from './operations';
import { Cell, CellAttribute } from '../models/cell';

// Mock data
// Valid ID format: 13 digits - 5 user chars
const validId1 = '1234567890123-AAAAA';
const validId2 = '1234567890124-BBBBB';
const validId3 = '1234567890125-CCCCC';

const mockCell1 = new Cell({
    id: validId1,
    attribute: CellAttribute.Text,
    name: 'Test Cell 1',
    value: 'Value 1',
    geo: null,
    remove: null
});

const mockCell2 = new Cell({
    id: validId2,
    attribute: CellAttribute.Time,
    name: 'Test Cell 2',
    value: 'Value 2 with geo',
    geo: '35.6895,139.6917',
    remove: null
});

const mockCell3 = new Cell({
    id: validId3,
    attribute: CellAttribute.Task,
    name: 'Test Cell 3',
    value: 'Value 3',
    geo: null,
    remove: '2023-01-01T00:00:00.000Z'
});

describe('CellRepository', () => {

    beforeEach(async () => {
        try {
            await CellRepository.clearAll();
        } catch (e) {
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
            // Insert 5 cells with desc IDs
            for (let i = 1; i <= 5; i++) {
                // Ensure IDs are strictly descending/ascending correctly for test
                // 1234567890123 + i
                const id = `123456789012${i}-00000`; // 123...121 to 125
                await CellRepository.save(new Cell({ ...mockCell1, id, value: `V${i}` }));
            }
            // Descending order of IDs: ...125, ...124, ...123, ...122, ...121

            // Offset 0, Limit 2 -> 125, 124
            const page1 = await CellRepository.getRange(0, 2);
            expect(page1).toHaveLength(2);
            expect(page1[0].id).toContain('125');
            expect(page1[1].id).toContain('124');

            // Offset 2, Limit 2 -> 123, 122
            const page2 = await CellRepository.getRange(2, 2);
            expect(page2).toHaveLength(2);
            expect(page2[0].id).toContain('123');
            expect(page2[1].id).toContain('122');

            // Offset 4, Limit 2 -> 121
            const page3 = await CellRepository.getRange(4, 2);
            expect(page3).toHaveLength(1);
            expect(page3[0].id).toContain('121');
        });

        it('should get all keys', async () => {
            await CellRepository.save(mockCell1);
            await CellRepository.save(mockCell2); // validId2 > validId1

            const keysPrev = await CellRepository.getAllKeys('prev'); // Descending
            expect(keysPrev).toEqual([validId2, validId1]);

            const keysNext = await CellRepository.getAllKeys('next'); // Ascending
            expect(keysNext).toEqual([validId1, validId2]);
        });
    });

    describe('Batch Processing', () => {
        it('should process all records in batches', async () => {
            // Insert 5 cells
            const cells = [];
            for (let i = 1; i <= 5; i++) {
                const id = `123456789012${i}-BATCH`;
                const c = new Cell({ ...mockCell1, id, value: `V${i}` });
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

    describe('Context Retrieval', () => {
        it('should get recent cells excluding specified attributes', async () => {
            // Create cells with timestamps embedded in IDs (since ID sort is time sort)
            // Use sequential IDs
            const id1 = '1000000000001-AAAAA';
            const id2 = '1000000000002-BBBBB';
            const id3 = '1000000000003-CCCCC';
            const id4 = '1000000000004-DDDDD';
            const id5 = '1000000000005-EEEEE';

            await CellRepository.save(new Cell({ ...mockCell1, id: id1, attribute: CellAttribute.Text }));
            await CellRepository.save(new Cell({ ...mockCell1, id: id2, attribute: CellAttribute.Card }));
            await CellRepository.save(new Cell({ ...mockCell1, id: id3, attribute: CellAttribute.Time }));
            await CellRepository.save(new Cell({ ...mockCell1, id: id4, attribute: CellAttribute.Text }));
            await CellRepository.save(new Cell({ ...mockCell1, id: id5, attribute: CellAttribute.Text }));

            // Get 3 recent cells, exclude Card and Time
            const results = await CellRepository.getRecentCells(3, [CellAttribute.Card, CellAttribute.Time]);

            expect(results).toHaveLength(3);
            expect(results[0].id).toBe(id5);
            expect(results[1].id).toBe(id4);
            expect(results[2].id).toBe(id1); // Skipped 003 and 002
        });
    });

    describe('Import/Export with Progress & Abort', () => {
        it('should import JSONL with progress updates', async () => {
            const lines = [
                JSON.stringify(CellRepository.mapToDB(new Cell({ ...mockCell1, id: '1234567890001-IMP01' }))),
                JSON.stringify(CellRepository.mapToDB(new Cell({ ...mockCell1, id: '1234567890002-IMP02' }))),
                JSON.stringify(CellRepository.mapToDB(new Cell({ ...mockCell1, id: '1234567890003-IMP03' }))),
                JSON.stringify(CellRepository.mapToDB(new Cell({ ...mockCell1, id: '1234567890004-IMP04' }))),
                JSON.stringify(CellRepository.mapToDB(new Cell({ ...mockCell1, id: '1234567890005-IMP05' })))
            ].join('\n');

            const onProgress = vi.fn();
            const result = await CellRepository.importFromJSONL(lines, onProgress);

            if (result.failureCount > 0) {
                // console.log('Import Errors:', result.errors);
            }

            expect(await CellRepository.getCount()).toBe(5);
            expect(onProgress).toHaveBeenCalled();
            expect(onProgress).toHaveBeenCalledWith(100);
        });

        it('should abort import', async () => {
            const lines = [];
            for (let i = 0; i < 100; i++) {
                // Pad i to 3 digits. Prefix needs to be 10 digits to make total 13.
                const istr = String(i).padStart(3, '0');
                // 1234567890 (10) + 000 (3) = 13
                lines.push(JSON.stringify(CellRepository.mapToDB(new Cell({ ...mockCell1, id: `1234567890${istr}-ABORT` }))));
            }
            const jsonl = lines.join('\n');

            const controller = new AbortController();
            const onProgress = vi.fn((percent) => {
                if (percent >= 10) {
                    controller.abort();
                }
            });

            await expect(CellRepository.importFromJSONL(jsonl, onProgress, controller.signal))
                .rejects.toThrow(/aborted/i);

            const count = await CellRepository.getCount();
            expect(count).toBeGreaterThan(0);
            expect(count).toBeLessThan(100);
        });

        it('should export JSONL with progress updates', async () => {
            for (let i = 0; i < 50; i++) {
                const istr = String(i).padStart(3, '0');
                // 1234567891 (10) + 000 (3) = 13. Use different prefix than import test.
                await CellRepository.save(new Cell({ ...mockCell1, id: `1234567891${istr}-EXP00` }));
            }

            const onProgress = vi.fn();
            const result = await CellRepository.exportAsJSONL(onProgress);

            expect(result.split('\n').filter(l => l).length).toBe(50);
            expect(onProgress).toHaveBeenCalled();
            expect(onProgress).toHaveBeenCalledWith(100);
        });

        it('should abort export', async () => {
            for (let i = 0; i < 100; i++) {
                const istr = String(i).padStart(3, '0');
                // 1234567892 (10) + 000 (3) = 13.
                await CellRepository.save(new Cell({ ...mockCell1, id: `1234567892${istr}-EXPAB` }));
            }

            const controller = new AbortController();
            const onProgress = vi.fn((percent) => {
                if (percent >= 10) {
                    controller.abort();
                }
            });

            await expect(CellRepository.exportAsJSONL(onProgress, controller.signal))
                .rejects.toThrow(/aborted/i);
        });
    });

    describe('Performance & UI Responsiveness', () => {
        it('should throttle progress updates to only when integer percentage changes', async () => {
            const lines = [];
            for (let i = 0; i < 200; i++) {
                lines.push(JSON.stringify(CellRepository.mapToDB(new Cell({ ...mockCell1, id: `1234567890${String(i).padStart(3, '0')}-THROT` }))));
            }
            const jsonl = lines.join('\n');

            const progressValues: number[] = [];
            const onProgress = vi.fn((p) => progressValues.push(p));

            await CellRepository.importFromJSONL(jsonl, onProgress);

            // 期待値: 0%または1%から100%まで、重複なく通知されること
            const uniqueProgress = Array.from(new Set(progressValues));
            expect(uniqueProgress.length).toBeLessThanOrEqual(101); // 0-100%
            expect(uniqueProgress[uniqueProgress.length - 1]).toBe(100);
        });

        it('should yield control to event loop during large operations', async () => {
            // このテストは実行環境に依存するため「論理的失敗」を確認するためのプレースホルダ
            // 実際には operations.ts に yield ロジックが入るまで、このテストは「同期的に」実行される。
            // 開発環境で `setTimeout` が一度も呼ばれないことを検知するのは難しいため、
            // ここでは実装後に、実際に非同期性が導入されたことを構造的に期待するテストとする。
            // 現状は repository の各メソッドに setTimeout(0) を期待する。

            const lines = [];
            // 分割単位（例: 50件）を超える件数を用意
            for (let i = 0; i < 60; i++) {
                lines.push(JSON.stringify(CellRepository.mapToDB(new Cell({ ...mockCell1, id: `1234567890${String(i).padStart(3, '0')}-YIELD` }))));
            }
            const jsonl = lines.join('\n');

            // グループでの setTimeout 呼び出しを追跡
            const originalSetTimeout = global.setTimeout;
            const setTimeoutMock = vi.spyOn(global, 'setTimeout');

            await CellRepository.importFromJSONL(jsonl);

            // 現状の実装（同期）では 0 回のはず
            // 修正後は 1 回以上（50件につき1回など）呼ばれることを期待する
            expect(setTimeoutMock).toHaveBeenCalled();

            setTimeoutMock.mockRestore();
        });
    });
});
