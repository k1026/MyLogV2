import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { mockValid } from 'zod-mocking';
import { Cell, CellSchema } from './cell';
import type { z } from 'zod';

/**
 * generateMock関数の型定義
 */
type GenerateMock = <T extends z.ZodTypeAny>(schema: T) => z.infer<T>;

/**
 * zod-mocking の型不整合を吸収し、Strictな型を返すヘルパー
 */
const generateMock: GenerateMock = (schema) => {
    const mocks = mockValid(schema as unknown as Parameters<typeof mockValid>[0]);
    const result = mocks.DEFAULT;

    if (typeof result !== 'object' || result === null) {
        return {
            id: '1234567890-ABCDE',
            attribute: 'Text',
            name: '',
            value: '',
            geo: '',
            remove: ''
        } as z.infer<typeof schema>;
    }

    return JSON.parse(JSON.stringify(result)) as z.infer<typeof schema>;
};

describe('Cell Class', () => {
    const MOCK_NOW = 1700000000000;

    beforeEach(() => {
        vi.useFakeTimers();
        vi.setSystemTime(MOCK_NOW);
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    describe('Static Methods', () => {
        it('generateId() が [timestamp]-[5桁英数字] の形式でIDを生成すること', () => {
            const id = Cell.generateId();
            expect(id).toMatch(/^\d+-[A-Z0-9]{5}$/);
            expect(id.startsWith(MOCK_NOW.toString())).toBe(true);
        });

        it('generateId() が短時間に複数回呼ばれても、ランダム部分により異なるIDを生成すること', () => {
            const ids = new Set(Array.from({ length: 100 }, () => Cell.generateId()));
            expect(ids.size).toBe(100);
        });

        describe('create() defaults', () => {
            it('Card属性: name="Card", value=""', () => {
                const cell = Cell.create({ attribute: 'Card' });
                expect(cell.attribute).toBe('Card');
                expect(cell.name).toBe('Card');
                expect(cell.value).toBe('');
            });

            it('Time属性: name="Time", value=現在時刻', () => {
                const cell = Cell.create({ attribute: 'Time' });
                expect(cell.attribute).toBe('Time');
                expect(cell.name).toBe('Time');
                expect(cell.value).toBe(MOCK_NOW.toString());
            });

            it('Text属性: name="", value=""', () => {
                const cell = Cell.create({ attribute: 'Text' });
                expect(cell.attribute).toBe('Text');
                expect(cell.name).toBe('');
                expect(cell.value).toBe('');
            });

            it('Task属性: name="", value="" (未完了)', () => {
                const cell = Cell.create({ attribute: 'Task' });
                expect(cell.attribute).toBe('Task');
                expect(cell.name).toBe('');
                expect(cell.value).toBe('');
            });

            it('引数で指定された値が優先されること', () => {
                const cell = Cell.create({
                    attribute: 'Card',
                    name: 'Custom Name',
                    geo: '135,35'
                });
                expect(cell.name).toBe('Custom Name');
                expect(cell.geo).toBe('135,35');
            });
        });
    });

    describe('Instance Properties & Getters', () => {
        it('createdAt が ID の前半部分から正しく時刻を抽出すること', () => {
            const timestamp = 1600000000000;
            const data = generateMock(CellSchema);
            data.id = `${timestamp}-ABCDE`;

            const cell = new Cell(data);
            expect(cell.createdAt).toBe(timestamp);
        });
    });

    describe('Card Management Methods', () => {
        let cardCell: Cell;

        beforeEach(() => {
            cardCell = Cell.create({ attribute: 'Card' });
        });

        describe('Card Management Methods', () => {
            let cardCell: Cell;

            beforeEach(() => {
                cardCell = Cell.create({ attribute: 'Card' });
            });

            describe('addCellId()', () => {
                const validId1 = '1700000000000-AAAAA';
                const validId2 = '1700000000000-BBBBB';
                const validId3 = '1700000000000-CCCCC';

                it('ID がスペース区切りで追加され、べき等性が保たれること', () => {
                    cardCell.addCellId(validId1);
                    expect(cardCell.value).toBe(validId1);

                    // 重複追加の防止（べき等性：同じ操作を2回繰り返しても副作用がない）
                    cardCell.addCellId(validId1);
                    expect(cardCell.value).toBe(validId1);

                    cardCell.addCellId(validId2);
                    expect(cardCell.value).toBe(`${validId1} ${validId2}`);
                });

                it('境界値テスト: 多数のIDを追加しても正しく保持されること', () => {
                    const ids = [validId1, validId2, validId3];
                    ids.forEach(id => cardCell.addCellId(id));
                    expect(cardCell.value).toBe(ids.join(' '));
                });

                it('既存の値に余計なスペースがあっても、追加時に正規化されること', () => {
                    cardCell.value = `  ${validId1}   `;
                    cardCell.addCellId(validId2);
                    expect(cardCell.value).toBe(`${validId1} ${validId2}`);
                });

                it('Zero/Empty Case: 空文字や無効なIDは追加されないこと', () => {
                    cardCell.addCellId('');
                    expect(cardCell.value).toBe('');

                    cardCell.addCellId('   ');
                    expect(cardCell.value).toBe('');

                    cardCell.addCellId('invalid-id');
                    expect(cardCell.value).toBe('');
                });

                it('ID形式の境界値: フォーマットが1文字でも異なれば追加されないこと', () => {
                    const invalidIds = [
                        '1700000000000-AAAA',  // 4文字 (n-1)
                        '1700000000000-AAAAAA', // 6文字 (n+1)
                        '1700000000000-aaaaa',  // 小文字
                        'A700000000000-AAAAA',  // タイムスタンプ部分に非数字
                    ];
                    invalidIds.forEach(id => {
                        cardCell.addCellId(id);
                        expect(cardCell.value).toBe('');
                    });
                });
            });

            describe('removeCellId()', () => {
                const id1 = '1700000000000-AAAAA';
                const id2 = '1700000000000-BBBBB';
                const id3 = '1700000000000-CCCCC';

                beforeEach(() => {
                    cardCell.value = `${id1} ${id2} ${id3}`;
                });

                it('中間、最初、最後の ID が正しく削除されること', () => {
                    // 中間
                    cardCell.removeCellId(id2);
                    expect(cardCell.value).toBe(`${id1} ${id3}`);

                    // 最初
                    cardCell.removeCellId(id1);
                    expect(cardCell.value).toBe(id3);

                    // 最後 (かつ最後の一つ)
                    cardCell.removeCellId(id3);
                    expect(cardCell.value).toBe('');
                });

                it('存在しない ID を削除しようとしても変化がないこと (べき等性)', () => {
                    const originalValue = cardCell.value;
                    cardCell.removeCellId('1700000000000-ZZZZZ');
                    expect(cardCell.value).toBe(originalValue);
                });

                it('Zero/Empty Case: 空の状態からの削除でエラーにならないこと', () => {
                    cardCell.value = '';
                    expect(() => cardCell.removeCellId('some-id')).not.toThrow();
                    expect(cardCell.value).toBe('');
                });

                it('スペースが含まれる既存のIDリストから正しく削除され、余計なスペースが残らず正規化されること', () => {
                    cardCell.value = ` ${id1}  ${id2}   ${id3} `;
                    cardCell.removeCellId(id2);
                    expect(cardCell.value).toBe(`${id1} ${id3}`);
                });
            });

            it('Attribute が Card 以外の場合、メソッドが副作用を持たないこと (Implementation Agnostic)', () => {
                const validId = '1700000000000-AAAAA';

                // Text属性
                const textCell = Cell.create({ attribute: 'Text', value: 'original' });
                textCell.addCellId(validId);
                expect(textCell.value).toBe('original');
                textCell.removeCellId(validId);
                expect(textCell.value).toBe('original');

                // Time属性 (value は providedValue があればそれが優先される)
                const timeCell = Cell.create({ attribute: 'Time', value: 'original' });
                expect(timeCell.value).toBe('original');
                timeCell.addCellId(validId);
                expect(timeCell.value).toBe('original');
                timeCell.removeCellId(validId);
                expect(timeCell.value).toBe('original');

                // Task属性
                const taskCell = Cell.create({ attribute: 'Task', value: 'original' });
                taskCell.addCellId(validId);
                expect(taskCell.value).toBe('original');
                taskCell.removeCellId(validId);
                expect(taskCell.value).toBe('original');
            });
        });

        describe('Instance Property: createdAt', () => {
            it('ID の形式に応じて正しいタイムスタンプを返し、不正な場合は 0 を返すこと', () => {
                const data = (id: string) => ({
                    id,
                    attribute: 'Text' as const,
                    name: '',
                    value: '',
                    geo: '',
                    remove: ''
                });

                expect(new Cell(data('12345-ABCDE')).createdAt).toBe(12345);
                expect(new Cell(data('invalid-ABCDE')).createdAt).toBe(0);
                expect(new Cell(data('-ABCDE')).createdAt).toBe(0);
            });
        });
        it('toObject() と fromObject() でデータが整合すること', () => {
            const cell = Cell.create({ attribute: 'Task', name: 'Test Task' });
            const obj = cell.toObject();
            const restored = Cell.fromObject(obj);

            expect(restored.id).toBe(cell.id);
            expect(restored.attribute).toBe(cell.attribute);
            expect(restored.name).toBe(cell.name);
        });

        describe('fromObject() バリデーション', () => {
            it('不正な attribute で例外を投げること', () => {
                const invalidData = {
                    id: '1234567890-ABCDE',
                    attribute: 'INVALID',
                    name: 'name',
                    value: 'value',
                    geo: '',
                    remove: ''
                };
                expect(() => Cell.fromObject(invalidData)).toThrow();
            });

            it('必須フィールド (id) が欠落している場合に例外を投げること', () => {
                const invalidData = {
                    attribute: 'Text',
                    name: '',
                    value: '',
                    geo: '',
                    remove: ''
                };
                expect(() => Cell.fromObject(invalidData)).toThrow();
            });

            it('IDの形式が不正な場合に例外を投げること', () => {
                const data = generateMock(CellSchema);
                data.id = 'invalid-id-format';
                expect(() => Cell.fromObject(data)).toThrow();
            });
        });
    });
});
