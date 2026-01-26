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

        describe('addCellId()', () => {
            const validId1 = '1700000000000-AAAAA';
            const validId2 = '1700000000000-BBBBB';

            it('ID がスペース区切りで追加され、べき等性が保たれること', () => {
                cardCell.addCellId(validId1);
                expect(cardCell.value).toBe(validId1);

                // 重複追加の防止（べき等性）
                cardCell.addCellId(validId1);
                expect(cardCell.value).toBe(validId1);

                cardCell.addCellId(validId2);
                expect(cardCell.value).toBe(`${validId1} ${validId2}`);
            });

            it('空文字は追加されないこと', () => {
                cardCell.addCellId('');
                expect(cardCell.value).toBe('');
            });

            it('スペースのみの文字列は追加されないこと', () => {
                cardCell.addCellId('   ');
                expect(cardCell.value).toBe('');
            });

            it('IDの形式が不正な場合でも追加されないこと (ロジック保護)', () => {
                // 仕様上、IDは [timestamp]-[random] だが、addCellIdがそれをバリデーションするか
                // 今回は実装側でバリデーションを強化することを想定し、不正形式は弾くテストを追加
                cardCell.addCellId('invalid-id');
                expect(cardCell.value).toBe('');
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

            it('空の状態からの削除でエラーにならないこと', () => {
                cardCell.value = '';
                expect(() => cardCell.removeCellId('some-id')).not.toThrow();
                expect(cardCell.value).toBe('');
            });

            it('スペースが含まれる既存のIDリストから正しく削除され、余計なスペースが残らないこと', () => {
                const id1 = '1700000000000-AAAAA';
                const id2 = '1700000000000-BBBBB';
                const id3 = '1700000000000-CCCCC';
                cardCell.value = ` ${id1}  ${id2}   ${id3} `;
                cardCell.removeCellId(id2);
                expect(cardCell.value).toBe(`${id1} ${id3}`);
            });
        });

        it('Attribute が Card 以外の場合、メソッドが副作用を持たないこと', () => {
            const textCell = Cell.create({ attribute: 'Text', value: 'original' });
            const validId = '1700000000000-AAAAA';

            textCell.addCellId(validId);
            expect(textCell.value).toBe('original');

            textCell.removeCellId(validId);
            expect(textCell.value).toBe('original');
        });

        it('値を操作した後も、attribute に応じた不変条件が維持されること', () => {
            const taskCell = Cell.create({ attribute: 'Task' });
            // Taskセルのvalueは完了時刻か空文字であるべき
            taskCell.addCellId('some-id');
            expect(taskCell.value).toBe(''); // Card以外なので追加されないはず
        });
    });

    describe('Serialization & Validation', () => {
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
