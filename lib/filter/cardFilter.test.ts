import { describe, it, expect, beforeEach } from 'vitest';
import { filterCards } from './cardFilter';
import { Cell, CellAttribute } from '../models/cell';
import { DEFAULT_FILTER_SETTINGS, FilterSettings } from '../models/filter';

describe('filterCards', () => {
    let subCellMap: Map<string, Cell>;
    let cards: Cell[];

    beforeEach(() => {
        subCellMap = new Map();
        cards = [];

        // Setup helper: Create a card with sub-cells
        // Card 1: Text cell (today), Task cell (yesterday)
        const card1 = new Cell({
            id: '1738137600000-CARD1', // 2025-01-29 00:00:00 UTC
            attribute: CellAttribute.Card,
            name: 'Card 1',
            value: '1738137600000-TEXT1 1738051200000-TASK1',
            geo: null,
            remove: null,
        });
        const text1 = new Cell({
            id: '1738137600000-TEXT1',
            attribute: CellAttribute.Text,
            name: 'Introduction',
            value: 'Hello world',
            geo: null,
            remove: null,
        });
        const task1 = new Cell({
            id: '1738051200000-TASK1', // 2025-01-28 00:00:00 UTC
            attribute: CellAttribute.Task,
            name: 'Todo',
            value: 'Buy milk',
            geo: null,
            remove: null,
        });

        cards.push(card1);
        subCellMap.set(text1.id, text1);
        subCellMap.set(task1.id, task1);

        // Card 2: Deleted card (Remove set)
        const card2 = new Cell({
            id: '1738137600001-CARD2',
            attribute: CellAttribute.Card,
            name: 'Card 2',
            value: '1738137600001-TEXT2',
            geo: null,
            remove: '1738137601000',
        });
        const text2 = new Cell({
            id: '1738137600001-TEXT2',
            attribute: CellAttribute.Text,
            name: 'Deleted text',
            value: 'Should be hidden by default',
            geo: null,
            remove: null,
        });
        cards.push(card2);
        subCellMap.set(text2.id, text2);

        // Card 3: Card with "Special" keyword in name
        const card3 = new Cell({
            id: '1738137600002-CARD3',
            attribute: CellAttribute.Card,
            name: 'Card 3',
            value: '1738137600002-TEXT3',
            geo: null,
            remove: null,
        });
        const text3 = new Cell({
            id: '1738137600002-TEXT3',
            attribute: CellAttribute.Text,
            name: 'Special Item',
            value: 'This is a secret',
            geo: null,
            remove: null,
        });
        cards.push(card3);
        subCellMap.set(text3.id, text3);
    });

    it('初期状態（デフォルト）では削除済みカードを除外する', () => {
        const result = filterCards(cards, subCellMap, DEFAULT_FILTER_SETTINGS);
        // Card 1 と Card 3 が表示されるはず
        expect(result.length).toBe(2);
        expect(result.some(c => c.id === '1738137600000-CARD1')).toBe(true);
        expect(result.some(c => c.id === '1738137600002-CARD3')).toBe(true);
        expect(result.some(c => c.id === '1738137600001-CARD2')).toBe(false);
    });

    it('Remove属性が有効な場合は削除済みカードも表示する', () => {
        const settings: FilterSettings = {
            ...DEFAULT_FILTER_SETTINGS,
            attributes: ['Text', 'Task', 'Remove'],
        };
        const result = filterCards(cards, subCellMap, settings);
        expect(result.length).toBe(3);
    });

    it('属性フィルタ（Textのみ）でカードを絞り込む', () => {
        // 実際にはCard 1にはTextが含まれるので表示される
        // もしTextのみにしたら、Taskしか持たないカードがあれば除外される
        // テスト用のカードを追加
        const cardOnlyTask = new Cell({
            id: '1738137600003-CARD4',
            attribute: CellAttribute.Card,
            name: 'Task Only',
            value: '1738137600003-TASK4',
            geo: null,
            remove: null,
        });
        const task4 = new Cell({
            id: '1738137600003-TASK4',
            attribute: CellAttribute.Task,
            name: 'Job',
            value: 'Coding',
            geo: null,
            remove: null,
        });
        cards.push(cardOnlyTask);
        subCellMap.set(task4.id, task4);

        const settings: FilterSettings = {
            ...DEFAULT_FILTER_SETTINGS,
            attributes: ['Text'],
        };
        const result = filterCards(cards, subCellMap, settings);
        expect(result.some(c => c.id === '1738137600003-CARD4')).toBe(false);
        expect(result.some(c => c.id === '1738137600000-CARD1')).toBe(true);
    });

    it('キーボード抽出フィルタ（OR検索）で絞り込む', () => {
        const settings: FilterSettings = {
            ...DEFAULT_FILTER_SETTINGS,
            keywords: {
                include: ['Hello', 'Special'],
                exclude: [],
                target: 'both',
            },
        };
        const result = filterCards(cards, subCellMap, settings);
        // Card 1 (Hello) と Card 3 (Special) がヒットするはず
        expect(result.length).toBe(2);
        expect(result.some(c => c.id === '1738137600000-CARD1')).toBe(true);
        expect(result.some(c => c.id === '1738137600002-CARD3')).toBe(true);
    });

    it('キーワード除外フィルタが抽出フィルタより優先される', () => {
        const settings: FilterSettings = {
            ...DEFAULT_FILTER_SETTINGS,
            keywords: {
                include: ['Special'],
                exclude: ['secret'],
                target: 'both',
            },
        };
        const result = filterCards(cards, subCellMap, settings);
        // Card 3 は "Special" でヒットするが "secret" (value) で除外されるはず
        expect(result.length).toBe(0);
    });

    it('期間フィルタで絞り込む', () => {
        const settings: FilterSettings = {
            ...DEFAULT_FILTER_SETTINGS,
            dateRange: {
                from: '2025-01-28',
                to: '2025-01-28',
            },
        };
        const result = filterCards(cards, subCellMap, settings);
        // Card 1 は 子セルに 1738051200000 (2025-01-28) を持つのでヒットする
        // 他のカードは 2025-01-29 なのでヒットしない
        expect(result.length).toBe(1);
        expect(result[0].id).toBe('1738137600000-CARD1');
    });

    it('ターゲット切り替え（名前のみ）でキーワード検索する', () => {
        const settings: FilterSettings = {
            ...DEFAULT_FILTER_SETTINGS,
            keywords: {
                include: ['secret'], // valueに含まれる
                exclude: [],
                target: 'name',
            },
        };
        const result = filterCards(cards, subCellMap, settings);
        // name には 'secret' はないのでヒットしないはず
        expect(result.length).toBe(0);
    });
});
