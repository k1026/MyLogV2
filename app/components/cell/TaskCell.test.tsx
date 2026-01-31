import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TaskCell } from './TaskCell';
import { CellAttribute, Cell } from '@/app/lib/models/cell';
import { useCellTitleEstimation } from '@/app/lib/hooks/useCellTitleEstimation';

// Mock the hook
vi.mock('@/app/lib/hooks/useCellTitleEstimation', () => ({
    useCellTitleEstimation: vi.fn(),
}));

describe('TaskCell', () => {
    const baseCell = new Cell({
        id: '1234567890123-ABCDE',
        attribute: CellAttribute.Task,
        name: 'Task Title',
        value: 'false',
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
                { title: 'Task Est 1', score: 10, details: {} },
                { title: 'Task Est 2', score: 8, details: {} },
            ]),
            learn: mockLearn,
        });
    });

    it('初期表示: name と value (チェック状態) が正しく表示されること', () => {
        const { rerender } = render(<TaskCell cell={baseCell} onSave={mockSave} />);

        expect(screen.getByDisplayValue('Task Title')).toBeInTheDocument();
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);

        const checkedCell = new Cell({ ...baseCell, value: 'true' });
        rerender(<TaskCell cell={checkedCell} onSave={mockSave} />);
        expect(checkbox.checked).toBe(true);
    });

    it('チェックボックスをクリックすると onSave が即座に呼ばれること', () => {
        render(<TaskCell cell={baseCell} onSave={mockSave} />);
        const checkbox = screen.getByRole('checkbox');

        fireEvent.click(checkbox);

        expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
            value: 'true'
        }));
    });

    it('nameを編集してblurするとonSaveが呼ばれること', () => {
        render(<TaskCell cell={baseCell} onSave={mockSave} />);
        const nameInput = screen.getByDisplayValue('Task Title');

        fireEvent.change(nameInput, { target: { value: 'Updated Task' } });
        fireEvent.blur(nameInput);

        expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'Updated Task'
        }));
    });

    it('コンテナをクリックするとタイトルのテキストフィールドにフォーカスが当たり、テキストが全選択されること', () => {
        render(<TaskCell cell={baseCell} onSave={mockSave} />);
        const nameInput = screen.getByDisplayValue('Task Title') as HTMLInputElement;
        const container = screen.getByTestId('task-cell');

        fireEvent.click(container);

        expect(nameInput).toHaveFocus();
        // select()が呼ばれたことを確認 (JSDOMでの簡略的な確認)
        // 注意: userEvent.click()などを使うとよりリアルだが、fireEventでonClick発火 -> ref.select()の流れを確認
        // JSDOMでは select() 呼び出しで selectionStart/End が更新される
        expect(nameInput.selectionStart).toBe(0);
        expect(nameInput.selectionEnd).toBe(nameInput.value.length);
    });

    it('過剰なフォーカス奪取の防止: isNew=trueでも、一度フォーカスが外れたら再取得しないこと', () => {
        vi.useFakeTimers();
        try {
            const cell = new Cell({ ...baseCell, name: 'New Task', value: 'false', id: 'new-task-1' });

            // 初回レンダリング (isNew=true)
            const { rerender } = render(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

            // useEffect内のsetTimeoutを処理
            act(() => {
                vi.runAllTimers();
            });

            const nameInput = screen.getByDisplayValue('New Task');
            expect(nameInput).toHaveFocus();

            // ユーザーが脱出 (actを使って確実にDOM更新を反映)
            act(() => {
                nameInput.blur();
            });
            expect(nameInput).not.toHaveFocus();

            // 再レンダリング (isNew=true のまま)
            rerender(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

            act(() => {
                vi.runAllTimers();
            });

            // フォーカスが戻らないこと
            expect(nameInput).not.toHaveFocus();
        } finally {
            vi.useRealTimers();
        }
    });

    describe('推定機能 (Estimation)', () => {
        it('新規セル追加時に自動で推定結果の1位がセットされること', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: 'false', id: '999-new' });
            render(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Task Est 1')).toBeInTheDocument();
            });
        });

        it('新規セル追加時に候補チップが表示されないこと', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: 'false', id: '999-new' });
            render(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Task Est 1')).toBeInTheDocument();
            });

            expect(screen.queryByTestId('title-candidates')).not.toBeInTheDocument();
        });

        it('推定値がセットされた後、タイトルが全選択されていること', async () => {
            vi.useFakeTimers();
            const cell = new Cell({ ...baseCell, name: '', value: 'false', id: '999-selection' });
            render(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

            await act(async () => {
                vi.advanceTimersByTime(0);
            });

            const input = screen.getByDisplayValue('Task Est 1') as HTMLInputElement;

            act(() => {
                vi.advanceTimersByTime(100);
            });

            expect(input.selectionStart).toBe(0);
            expect(input.selectionEnd).toBe(input.value.length);
            vi.useRealTimers();
        });

        it('一度推定された後、タイトルを空にしても再推定されないこと', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: 'false', id: '999-no-retry' });
            const { rerender } = render(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

            await waitFor(() => expect(screen.getByDisplayValue('Task Est 1')).toBeInTheDocument());

            const input = screen.getByDisplayValue('Task Est 1');
            fireEvent.change(input, { target: { value: '' } });

            rerender(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

            expect(input).toHaveValue('');
            expect(mockEstimate).toHaveBeenCalledTimes(1);
        });

        it('競合状態の防止: 推定処理中にユーザーが入力を開始した場合、推定結果で上書きされないこと', async () => {
            vi.useFakeTimers();
            try {
                // estimateが少し遅れるように遅延させる
                mockEstimate.mockImplementation(async () => {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    return [
                        { title: 'Delayed Est', score: 10, details: {} }
                    ];
                });

                const cell = new Cell({ ...baseCell, name: '', value: 'false', id: '999-race' });
                render(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

                // まだ推定結果は来ていない（空文字であること）
                const input = screen.getByPlaceholderText('To-do Task');
                expect(input).toHaveValue('');

                // ユーザーが入力を開始
                fireEvent.change(input, { target: { value: 'User Typed' } });

                // タイマーを進めて推定処理を完了させる
                await act(async () => {
                    vi.advanceTimersByTime(150);
                });

                // ユーザー入力が維持されていること（Delayed Estで上書きされていないこと）
                expect(input).toHaveValue('User Typed');
            } finally {
                vi.useRealTimers();
            }
        });
    });
});
