
import { describe, it, expect } from 'vitest';
import { Cell, CellSchema, CellAttribute, createCellId } from './cell';

describe('Cell Model', () => {
    describe('createCellId', () => {
        it('should generate an ID in the correct format (timestamp-random)', () => {
            const id = createCellId();
            expect(id).toMatch(/^\d{13}-[A-Z0-9]{5}$/);
        });
    });

    describe('Cell Class', () => {
        it('should be instantiated correctly with valid data', () => {
            const data = {
                id: '1700000000000-ABC12',
                attribute: CellAttribute.Card,
                name: 'Test Card',
                value: '',
                geo: null,
                remove: null,
            };
            const cell = new Cell(data);
            expect(cell).toBeInstanceOf(Cell);
            expect(cell.id).toBe(data.id);
            expect(cell.attribute).toBe(CellAttribute.Card);
        });

        it('should support addCellId for Card attribute', () => {
            const data = {
                id: '1700000000000-ABC12',
                attribute: CellAttribute.Card,
                name: 'Card',
                value: 'ID1 ID2',
                geo: null,
                remove: null,
            };
            const cell = new Cell(data);
            cell.addCellId('ID3');

            // Should verify the value is updated
            // Since implementation is empty, this should fail if logic is missing
            expect(cell.value).toBe('ID1 ID2 ID3');
        });

        it('should support removeCellId for Card attribute', () => {
            const data = {
                id: '1700000000000-ABC12',
                attribute: CellAttribute.Card,
                name: 'Card',
                value: 'ID1 ID2 ID3',
                geo: null,
                remove: null,
            };
            const cell = new Cell(data);
            cell.removeCellId('ID2');

            // Should verify the value is updated
            expect(cell.value).toBe('ID1 ID3');
        });

        it('should handle addCellId on empty value', () => {
            const data = {
                id: '1700000000000-ABC12',
                attribute: CellAttribute.Card,
                name: 'Card',
                value: '',
                geo: null,
                remove: null,
            };
            const cell = new Cell(data);
            cell.addCellId('ID1');
            expect(cell.value).toBe('ID1');
        });
    });

    describe('CellSchema Validation (Legacy Support)', () => {
        // ... existing tests essentially ...
        it('should validate a correct Card cell object', () => {
            const validCard = {
                id: '1700000000000-ABC12',
                attribute: CellAttribute.Card,
                name: 'Card',
                value: 'some-child-id',
                geo: null,
                remove: null,
            };
            const result = CellSchema.safeParse(validCard);
            expect(result.success).toBe(true);
        });
    });
});
