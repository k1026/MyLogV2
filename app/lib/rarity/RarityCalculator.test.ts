import { describe, it, expect } from 'vitest';
import { RarityCalculator } from './RarityCalculator';
import { Cell, CellAttribute } from '../models/cell';

describe('RarityCalculator', () => {
    const createMockCell = (id: string, name: string, attribute: CellAttribute): Cell => new Cell({
        id: `${id}-XXXXX`,
        name,
        attribute,
        value: '',
        geo: null,
        remove: null,
    });

    it('初回出現の単語はレア度1.0であること', () => {
        const cells = [
            createMockCell('1', 'Apple', CellAttribute.Text),
        ];
        const result = RarityCalculator.calculateRarity(cells);
        expect(result.get('Apple')).toBe(1.0);
    });

    it('出現するたびにレア度が0.97倍に減衰すること', () => {
        const cells = [
            createMockCell('3', 'Apple', CellAttribute.Text), // 3回目 (最新)
            createMockCell('2', 'Apple', CellAttribute.Text), // 2回目
            createMockCell('1', 'Apple', CellAttribute.Text), // 1回目 (最旧)
        ];
        // 1.0 -> 0.97 -> 0.9409
        const result = RarityCalculator.calculateRarity(cells);
        expect(result.get('Apple')).toBeCloseTo(0.9409, 4);
    });

    it('CardとTime属性のセルは計算対象外であること', () => {
        const cells = [
            createMockCell('3', 'Apple', CellAttribute.Text),
            createMockCell('2', 'CardTitle', CellAttribute.Card),
            createMockCell('1', '12:00', CellAttribute.Time),
        ];
        const result = RarityCalculator.calculateRarity(cells);
        expect(result.has('Apple')).toBe(true);
        expect(result.has('CardTitle')).toBe(false);
        expect(result.has('12:00')).toBe(false);
    });

    it('空のリストの場合は空のMapを返すこと', () => {
        const result = RarityCalculator.calculateRarity([]);
        expect(result.size).toBe(0);
    });

    it('最新から3000件という制約は呼び出し側で制御されるが、渡された全データを正しく処理すること', () => {
        const cells: Cell[] = [];
        for (let i = 0; i < 100; i++) {
            cells.push(createMockCell(i.toString(), 'Repeat', CellAttribute.Text));
        }
        const result = RarityCalculator.calculateRarity(cells);
        // 1.0 * (0.97 ^ 99)
        const expected = Math.pow(0.97, 99);
        expect(result.get('Repeat')).toBeCloseTo(expected, 4);
    });
});
