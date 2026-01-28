
import { CellRepository } from './operations';
import { db } from './db';
import { Cell, CellAttribute } from '../models/cell';
import { afterEach, describe, expect, it, beforeEach } from 'vitest';

describe('CellRepository File I/O', () => {

    beforeEach(async () => {
        await db.cells.clear();
    });

    afterEach(async () => {
        await db.cells.clear();
    });

    const createSampleCells = (): Cell[] => [
        { id: '1700000000001-TEST1', attribute: CellAttribute.Time, name: 'Task 1', value: '10:00', geo: null, remove: null },
        { id: '1700000000002-TEST2', attribute: CellAttribute.Text, name: 'Note 1', value: 'Some text', geo: null, remove: null },
        { id: '1700000000003-TEST3', attribute: CellAttribute.Task, name: 'Todo 1', value: '0', geo: 'loc', remove: 'deleted' },
    ];

    describe('exportAsJSONL', () => {
        it('should export all cells to JSONL string', async () => {
            const cells = createSampleCells();
            for (const cell of cells) {
                await CellRepository.save(cell);
            }

            const jsonl = await CellRepository.exportAsJSONL();
            const lines = jsonl.trim().split('\n');

            expect(lines.length).toBe(3);

            // Parse back and verify content (using raw JSON check to ensure keys are short)
            const parsed = lines.map(line => JSON.parse(line));
            expect(parsed).toEqual(expect.arrayContaining([
                expect.objectContaining({ I: '1700000000001-TEST1', A: 'Time', N: 'Task 1' }),
                expect.objectContaining({ I: '1700000000002-TEST2', A: 'Text', V: 'Some text' }),
                expect.objectContaining({ I: '1700000000003-TEST3', G: 'loc', R: 'deleted' })
            ]));
        });

        it('should return empty string if db is empty', async () => {
            const jsonl = await CellRepository.exportAsJSONL();
            expect(jsonl).toBe('');
        });
    });

    describe('importFromJSONL', () => {
        it('should import valid JSONL data', async () => {
            const jsonl = `
{"I":"1700000000010-IMPTA","A":"Time","N":"Imported Task","V":"12:00","G":null,"R":null}
{"I":"1700000000020-IMPTE","A":"Text","N":"Imported Note","V":"Details","G":null,"R":null}
`.trim();

            const result = await CellRepository.importFromJSONL(jsonl);

            expect(result.successCount).toBe(2);
            expect(result.failureCount).toBe(0);
            expect(result.errors).toHaveLength(0);

            const all = await CellRepository.getAll();
            expect(all).toHaveLength(2);
            expect(all).toEqual(expect.arrayContaining([
                expect.objectContaining({ id: '1700000000010-IMPTA', name: 'Imported Task' }),
                expect.objectContaining({ id: '1700000000020-IMPTE', name: 'Imported Note' })
            ]));
        });

        it('should handle upsert (overwrite existing)', async () => {
            await CellRepository.save({ id: '1700000000010-IMPTA', attribute: CellAttribute.Time, name: 'Old Name', value: '10:00', geo: null, remove: null });

            const jsonl = `{"I":"1700000000010-IMPTA","A":"Time","N":"New Name","V":"10:00","G":null,"R":null}`;
            const result = await CellRepository.importFromJSONL(jsonl);

            expect(result.successCount).toBe(1);
            const cell = await CellRepository.getById('1700000000010-IMPTA');
            expect(cell?.name).toBe('New Name');
        });

        it('should skip invalid JSON lines', async () => {
            const jsonl = `
{"I":"1700000000001-GOOD1","A":"Time","N":"Good","V":"1","G":null,"R":null}
Invalid JSON Line
{"I":"1700000000002-GOOD2","A":"Text","N":"Also Good","V":"2","G":null,"R":null}
`.trim();
            const result = await CellRepository.importFromJSONL(jsonl);
            expect(result.successCount).toBe(2);
            expect(result.failureCount).toBe(1);
            expect(result.errors[0]).toEqual(expect.stringContaining('Unexpected token'));
        });

        it('should skip lines that fail validation', async () => {
            // Missing required 'A' (attribute) which maps to 'attribute' in Cell
            // Or let's say 'A' has invalid value 'InvalidType'
            const jsonl = `
{"I":"1700000000001-INVAL","A":"InvalidType","N":"Bad Attribute","V":"Val","G":null,"R":null}
`.trim();
            const result = await CellRepository.importFromJSONL(jsonl);
            expect(result.successCount).toBe(0);
            expect(result.failureCount).toBe(1);
            expect(result.errors[0]).toContain('Validation error');
        });

        it('should skip data with missing keys mandatory for mapping', async () => {
            // Missing 'I'
            const jsonl = `{"A":"Time","N":"No ID","V":"Val"}`;
            const result = await CellRepository.importFromJSONL(jsonl);
            expect(result.successCount).toBe(0);
            expect(result.failureCount).toBe(1); // Should fail at Zod validation or mapping
        });
    });
});
