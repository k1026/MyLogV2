import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TextCell } from './TextCell';
import { CellAttribute, Cell } from '@/app/lib/models/cell';
import { useCellTitleEstimation } from '@/app/lib/hooks/useCellTitleEstimation';

// Mock the hook
vi.mock('@/app/lib/hooks/useCellTitleEstimation', () => ({
    useCellTitleEstimation: vi.fn(),
}));

describe('TextCell', () => {
    const baseCell = new Cell({
        id: '1234567890123-ABCDE',
        attribute: CellAttribute.Text,
        name: 'Initial Name',
        value: 'Initial Value',
        geo: null,
        remove: null,
    });

    const mockEstimate = vi.fn();
    const mockLearn = vi.fn();
    const mockSave = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        (useCellTitleEstimation as any).mockReturnValue({
            estimate: mockEstimate.mockResolvedValue([
                { title: 'Est 1', score: 10, details: {} },
                { title: 'Est 2', score: 8, details: {} },
            ]),
            learn: mockLearn,
        });
    });

    it('初期表示: name と value が正しく表示されること', () => {
        render(<TextCell cell={baseCell} onSave={mockSave} />);
        const nameInput = screen.getByDisplayValue('Initial Name');
        const valueInput = screen.getByDisplayValue('Initial Value');
        expect(nameInput).toBeInTheDocument();
        expect(valueInput).toBeInTheDocument();
    });

    it('自動保存: nameを変更してblurするとonSaveが呼ばれること', () => {
        render(<TextCell cell={baseCell} onSave={mockSave} />);
        const nameInput = screen.getByDisplayValue('Initial Name');
        fireEvent.change(nameInput, { target: { value: 'Updated Name' } });
        fireEvent.blur(nameInput);
        expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ name: 'Updated Name' }));
    });

    it('自動保存: valueを変更してblurするとonSaveが呼ばれること', () => {
        render(<TextCell cell={baseCell} onSave={mockSave} />);
        const valueInput = screen.getByDisplayValue('Initial Value');
        fireEvent.change(valueInput, { target: { value: 'Updated Value' } });
        fireEvent.blur(valueInput);
        expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({ value: 'Updated Value' }));
    });

    it('Enterキー操作: name フィールドで Enter を押すと value フィールドへ移動すること', async () => {
        render(<TextCell cell={baseCell} onSave={mockSave} />);
        const nameInput = screen.getByDisplayValue('Initial Name');
        const valueInput = screen.getByDisplayValue('Initial Value');

        // focus name
        act(() => {
            nameInput.focus();
        });
        expect(nameInput).toHaveFocus();

        // press Enter
        act(() => {
            fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });
        });

        await waitFor(() => {
            expect(valueInput).toHaveFocus();
        });
    });

    describe('フォーカス制御 (仕様 4.2.2)', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('初期フォーカス: 両方空の場合は name にフォーカス', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: '' });
            render(<TextCell cell={cell} onSave={mockSave} />);

            // TextCellのコンテナをクリックしてフォーカス制御を発動させる
            fireEvent.click(screen.getByTestId('text-cell'));

            act(() => {
                vi.runAllTimers();
            });
            await act(async () => { await Promise.resolve(); });

            const nameInput = screen.getByPlaceholderText('Title');
            expect(nameInput).toHaveFocus();
        });

        it('初期フォーカス: nameのみある場合は value にフォーカス', async () => {
            const cell = new Cell({ ...baseCell, name: 'Title Only', value: '' });
            render(<TextCell cell={cell} onSave={mockSave} />);

            fireEvent.click(screen.getByTestId('text-cell'));
            act(() => {
                vi.runAllTimers();
            });
            await act(async () => { await Promise.resolve(); });

            const valueInput = screen.getByPlaceholderText('Description...');
            expect(valueInput).toHaveFocus();
        });

        it('初期フォーカス: valueのみある場合は name にフォーカス', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: 'Content Only' });
            render(<TextCell cell={cell} onSave={mockSave} />);

            fireEvent.click(screen.getByTestId('text-cell'));
            act(() => {
                vi.runAllTimers();
            });
            await act(async () => { await Promise.resolve(); });

            const nameInput = screen.getByPlaceholderText('Title');
            expect(nameInput).toHaveFocus();
        });

        it('初期フォーカス: 両方ある場合は value にフォーカス', async () => {
            const cell = new Cell({ ...baseCell, name: 'Title', value: 'Content' });
            render(<TextCell cell={cell} onSave={mockSave} />);

            fireEvent.click(screen.getByTestId('text-cell'));
            act(() => {
                vi.runAllTimers();
            });
            await act(async () => { await Promise.resolve(); });

            const valueInput = screen.getByPlaceholderText('Description...');
            expect(valueInput).toHaveFocus();
        });

        it('過剰なフォーカス奪取の防止: isNew=trueでも、一度フォーカスが外れたら再取得しないこと', async () => {
            // 推定が走らないように、id以外（例えばname）で区別するか、あるいは推定結果が空になるようにする
            // ここでは Cell に初期値を詰めて推定条件 (!name) を外す
            const cell = new Cell({ ...baseCell, name: 'Sample', value: '', id: 'new-cell-1' });
            // 初回レンダリング (isNew=true)
            const { rerender } = render(<TextCell cell={cell} onSave={mockSave} isNew={true} />);

            act(() => {
                vi.runAllTimers();
            });
            await act(async () => { await Promise.resolve(); });
            const nameInput = screen.getByDisplayValue('Sample');
            expect(nameInput).toHaveFocus();

            // ユーザーが別の要素 (bodyなど) にフォーカスを移動
            act(() => {
                nameInput.blur();
            });
            expect(nameInput).not.toHaveFocus();

            // 何らかの理由で再レンダリングが発生 (propsは変わらず isNew=true のまま)
            rerender(<TextCell cell={cell} onSave={mockSave} isNew={true} />);
            act(() => {
                vi.runAllTimers();
            });
            await act(async () => { await Promise.resolve(); });

            // それでもフォーカスは戻らないこと
            expect(nameInput).not.toHaveFocus();
        });
    });

    it('表示制御: フォーカスが外れた状態で空のフィールドが非表示になること (仕様 4.2.2)', () => {
        const cell = new Cell({ ...baseCell, name: '', value: '' });
        render(<TextCell cell={cell} onSave={mockSave} />);

        // 両方空かつ非フォーカス時は、プレースホルダーも見えないはず（input/textareaがレンダリングされないため）
        expect(screen.queryByPlaceholderText('Title')).not.toBeInTheDocument();
        expect(screen.queryByPlaceholderText('Description...')).not.toBeInTheDocument();
    });

    describe('推定機能 (Estimation)', () => {
        it('新規セル追加時に自動で推定結果の1位がセットされること', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: '', id: '999-new' });
            render(<TextCell cell={cell} onSave={mockSave} isNew={true} />);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Est 1')).toBeInTheDocument();
            });
        });

        it('新規セル追加時に候補チップが表示されないこと', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: '', id: '999-new' });
            render(<TextCell cell={cell} onSave={mockSave} isNew={true} />);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Est 1')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('title-candidates')).not.toBeInTheDocument();
        });

        it('推定値がセットされた後、タイトルが全選択されていること', async () => {
            vi.useFakeTimers();
            const cell = new Cell({ ...baseCell, name: '', value: '', id: '999-selection' });
            render(<TextCell cell={cell} onSave={mockSave} isNew={true} />);

            // estimate() の Promise を解決
            await act(async () => {
                vi.advanceTimersByTime(0);
            });

            // setName 等の更新を待つ
            const input = screen.getByDisplayValue('Est 1') as HTMLInputElement;

            // setTimeout(select) を実行
            act(() => {
                vi.advanceTimersByTime(100);
            });

            expect(input.selectionStart).toBe(0);
            expect(input.selectionEnd).toBe(input.value.length);
            vi.useRealTimers();
        });

        it('一度推定された後、タイトルを空にしても再推定されないこと', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: '', id: '999-no-retry' });
            const { rerender } = render(<TextCell cell={cell} onSave={mockSave} isNew={true} />);

            await waitFor(() => expect(screen.getByDisplayValue('Est 1')).toBeInTheDocument());

            // ユーザーが空文字にする
            const input = screen.getByDisplayValue('Est 1');
            fireEvent.change(input, { target: { value: '' } });

            // 再レンダリング（依存配列の変化を想定）
            rerender(<TextCell cell={cell} onSave={mockSave} isNew={true} />);

            // 推定が再度走っていないこと（空文字のままであること）
            expect(input).toHaveValue('');
            expect(mockEstimate).toHaveBeenCalledTimes(1);
        });

        it('推定値がセットされた直後はフォーカスがタイトルに留まり、本文へ移動しないこと', async () => {
            vi.useFakeTimers();
            const cell = new Cell({ ...baseCell, name: '', value: '', id: '999-focus-stay' });
            render(<TextCell cell={cell} onSave={mockSave} isNew={true} />);

            await act(async () => {
                vi.advanceTimersByTime(0);
            });

            const nameInput = screen.getByDisplayValue('Est 1');
            act(() => {
                vi.advanceTimersByTime(100);
            });

            const valueInput = screen.getByPlaceholderText('Description...');
            expect(nameInput).toHaveFocus();
            expect(valueInput).not.toHaveFocus();
            vi.useRealTimers();
        });
    });
});
