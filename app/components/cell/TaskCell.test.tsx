import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

    describe('推定機能 (Estimation)', () => {
        it('新規セル追加時に自動で推定結果の1位がセットされること', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: 'false', id: '999-new' });
            render(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

            await waitFor(() => {
                expect(screen.getByDisplayValue('Task Est 1')).toBeInTheDocument();
            });
        });

        it('新規セル追加時に候補チップが表示されること', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: 'false', id: '999-new' });
            render(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

            await waitFor(() => {
                expect(screen.getByText('Task Est 2')).toBeInTheDocument();
            });
        });

        it('候補チップをクリックするとタイトルが更新され、チップが消えること', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: 'false', id: '999-new' });
            render(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

            await waitFor(() => expect(screen.getByText('Task Est 2')).toBeInTheDocument());

            fireEvent.click(screen.getByText('Task Est 2'));

            expect(screen.getByDisplayValue('Task Est 2')).toBeInTheDocument();
            expect(screen.queryByText('Task Est 1')).not.toBeInTheDocument();
        });

        it('手動で入力すると候補チップが消えること', async () => {
            const cell = new Cell({ ...baseCell, name: '', value: 'false', id: '999-new' });
            render(<TaskCell cell={cell} onSave={mockSave} isNew={true} />);

            await waitFor(() => expect(screen.getByText('Task Est 1')).toBeInTheDocument());

            const nameInput = screen.getByDisplayValue('Task Est 1');
            fireEvent.change(nameInput, { target: { value: 'User Input' } });

            expect(screen.queryByText('Task Est 1')).not.toBeInTheDocument();
        });
    });

    it('競合状態の防止: 推定処理中にユーザーが入力を開始した場合、推定結果で上書きされないこと', async () => {
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

        // 推定完了まで待つ
        await waitFor(() => new Promise(r => setTimeout(r, 150)));

        // ユーザー入力が維持されていること（Delayed Estで上書きされていないこと）
        expect(input).toHaveValue('User Typed');
    });
});
