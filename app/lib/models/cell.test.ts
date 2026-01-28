
import { describe, it, expect } from 'vitest';
import { CellSchema, CellAttribute, createCellId } from './cell';

describe('Cell Model', () => {
    describe('createCellId', () => {
        it('should generate an ID in the correct format (timestamp-random)', () => {
            const id = createCellId();
            // Format: 13 digits - 5 uppercase alphanumeric
            // e.g. 1700000000000-ABC12
            expect(id).toMatch(/^\d{13}-[A-Z0-9]{5}$/);
        });
    });

    describe('CellSchema Validation', () => {
        it('should validate a correct Card cell', () => {
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

        it('should validate a correct Time cell', () => {
            const validTime = {
                id: '1700000000000-ABC12',
                attribute: CellAttribute.Time,
                name: 'Time',
                value: '1700000000000',
                geo: '35.6895 139.6917 10.0',
                remove: null,
            };
            const result = CellSchema.safeParse(validTime);
            expect(result.success).toBe(true);
        });

        it('should fail for invalid ID format', () => {
            const invalidIdCell = {
                id: 'invalid-id',
                attribute: CellAttribute.Text,
                name: 'Test',
                value: 'Test Value',
                geo: null,
                remove: null,
            };
            const result = CellSchema.safeParse(invalidIdCell);
            // Expect failure because Schema should enforce strict regex
            expect(result.success).toBe(false);
        });

        it('should fail for invalid Attribute', () => {
            const invalidAttrCell = {
                id: '1700000000000-ABC12',
                attribute: 'InvalidAttribute',
                name: 'Test',
                value: 'Test Value',
                geo: null,
                remove: null,
            };
            const result = CellSchema.safeParse(invalidAttrCell);
            expect(result.success).toBe(false);
        });

        it('should allow nullable geo', () => {
            const data = {
                id: '1700000000000-ABC12',
                attribute: CellAttribute.Text,
                name: '',
                value: '',
                geo: null,
                remove: null
            };
            expect(CellSchema.safeParse(data).success).toBe(true);
        });

        it('should allow string geo', () => {
            const data = {
                id: '1700000000000-ABC12',
                attribute: CellAttribute.Text,
                name: '',
                value: '',
                geo: "35.0 135.0",
                remove: null
            };
            expect(CellSchema.safeParse(data).success).toBe(true);
        });

        it('should allow nullable remove', () => {
            const data = {
                id: '1700000000000-ABC12',
                attribute: CellAttribute.Text,
                name: '',
                value: '',
                geo: null,
                remove: null
            };
            expect(CellSchema.safeParse(data).success).toBe(true);
        });

        it('should allow string remove (timestamp)', () => {
            const data = {
                id: '1700000000000-ABC12',
                attribute: CellAttribute.Text,
                name: '',
                value: '',
                geo: null,
                remove: "1700000000000"
            };
            expect(CellSchema.safeParse(data).success).toBe(true);
        });
    });
});
