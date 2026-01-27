import { describe, it, expect, beforeEach, vi } from 'vitest';
import { exportDatabase, appendDatabase } from './fileOperations';
import { CellRepository } from './operations';
import { Cell } from '../models/cell';

describe('fileOperations', () => {
    beforeEach(async () => {
        await CellRepository.truncate();
    });

    describe('exportDatabase', () => {
        it('exports all cells as JSON string', async () => {
            const cell1 = Cell.create({ attribute: 'Text', name: 'N1', value: 'V1' });
            const cell2 = Cell.create({ attribute: 'Task', name: 'N2', value: '' });
            await CellRepository.save(cell1);
            await CellRepository.save(cell2);

            const result = await exportDatabase();
            expect(result.count).toBe(2);
        });
    });

    describe('appendDatabase', () => {
        it('appends cells from JSON string', async () => {
            const cells = [
                { id: '1-ABCDE', attribute: 'Text', name: 'T1', value: 'V1', geo: '', remove: '' },
                { id: '2-FGHIJ', attribute: 'Text', name: 'T2', value: 'V2', geo: '', remove: '' }
            ];
            const content = JSON.stringify(cells);

            const result = await appendDatabase(content);
            expect(result.added).toBe(2);

            const count = await CellRepository.getCount();
            expect(count).toBe(2);
        });

        it('skips existing IDs', async () => {
            const cell = Cell.create({ attribute: 'Text', name: 'Exist', value: 'Old' });
            await CellRepository.save(cell);

            const cells = [
                { ...cell.toObject(), value: 'New' }, // Same ID
                { id: '3-KLMNO', attribute: 'Text', name: 'New', value: 'New', geo: '', remove: '' }
            ];
            const content = JSON.stringify(cells);

            const result = await appendDatabase(content);
            expect(result.added).toBe(1);
            expect(result.skipped).toBe(1);
        });
    });
});
