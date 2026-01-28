import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Home from './page';
import { CellRepository } from '@/app/lib/db/operations';
import { CellAttribute } from '@/app/lib/models/cell';

// Mock dependencies
vi.mock('@/app/lib/db/operations', () => ({
    CellRepository: {
        save: vi.fn().mockResolvedValue(undefined),
    },
}));

// Mock created Id to be stable
vi.mock('@/app/lib/models/cell', async () => {
    const actual = await vi.importActual<typeof import('@/app/lib/models/cell')>('@/app/lib/models/cell');
    return {
        ...actual,
        createCellId: vi.fn().mockReturnValue('mocked-cell-id'),
    };
});

describe('Home Page (Main Screen Trial)', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('初期表示で TimeCell, TextCell, TaskCell と Saveボタンが表示されること', async () => {
        render(<Home />);

        expect(await screen.findByTestId('time-cell')).toBeInTheDocument();
        expect(screen.getByTestId('text-cell')).toBeInTheDocument();
        expect(screen.getByTestId('task-cell')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Save/i })).toBeInTheDocument();
    });

    it('各Cellに値を入力し「Save」ボタンを押すと、DBに保存され、UIがリセットされること', async () => {
        render(<Home />);

        // 1. 各Cellへの入力
        // TimeCell: name入力
        // findByTestIdを使って表示を待機
        const timeCell = await screen.findByTestId('time-cell');
        const timeCellNameInput = timeCell.querySelector('input[type="text"]') as HTMLInputElement;
        fireEvent.change(timeCellNameInput, { target: { value: 'Time Event' } });
        fireEvent.blur(timeCellNameInput);

        // TextCell: name と value入力
        const textCell = screen.getByTestId('text-cell');
        fireEvent.click(textCell); // Focus to show inputs if necessary
        const textCellNameInput = textCell.querySelector('input[type="text"]') as HTMLInputElement;
        const textCellValueInput = textCell.querySelector('textarea') as HTMLTextAreaElement;
        fireEvent.change(textCellNameInput, { target: { value: 'Text Title' } });
        fireEvent.change(textCellValueInput, { target: { value: 'Text Content' } });
        fireEvent.blur(textCellValueInput);

        // TaskCell: name入力とCheckbox
        const taskCell = screen.getByTestId('task-cell');
        const taskCellNameInput = taskCell.querySelector('input[type="text"]') as HTMLInputElement;
        const taskCellCheckbox = taskCell.querySelector('input[type="checkbox"]') as HTMLInputElement;
        fireEvent.change(taskCellNameInput, { target: { value: 'Task Name' } });
        fireEvent.click(taskCellCheckbox);
        fireEvent.blur(taskCellNameInput);

        // 2. Saveボタン押下
        const saveButton = screen.getByRole('button', { name: /Save/i });
        fireEvent.click(saveButton);

        // 3. 保存の検証
        await waitFor(() => {
            expect(CellRepository.save).toHaveBeenCalledTimes(3);
        });

        // 各Cellの属性が含まれているか確認
        expect(CellRepository.save).toHaveBeenCalledWith(expect.objectContaining({ attribute: CellAttribute.Time, name: 'Time Event' }));
        expect(CellRepository.save).toHaveBeenCalledWith(expect.objectContaining({ attribute: CellAttribute.Text, name: 'Text Title', value: 'Text Content' }));
        expect(CellRepository.save).toHaveBeenCalledWith(expect.objectContaining({ attribute: CellAttribute.Task, name: 'Task Name', value: 'true' }));

        // 4. リセットの検証
        // 4. リセットの検証
        // 保存後、UI上の各入力値が初期状態に戻っていること
        await waitFor(() => {
            // TimeCell
            const resetTimeCell = screen.getByTestId('time-cell');
            const resetTimeName = resetTimeCell.querySelector('input[type="text"]') as HTMLInputElement;
            expect(resetTimeName.value).toBe('');

            // TextCell: empty fields are hidden when not focused
            const resetTextCell = screen.getByTestId('text-cell');
            expect(resetTextCell.querySelector('input')).toBeNull();
            expect(resetTextCell.querySelector('textarea')).toBeNull();
            // Ensure old values are gone
            expect(screen.queryByDisplayValue('Text Title')).not.toBeInTheDocument();

            // TaskCell
            const resetTaskCell = screen.getByTestId('task-cell');
            const resetTaskName = resetTaskCell.querySelector('input[type="text"]') as HTMLInputElement;
            const resetTaskCheckbox = resetTaskCell.querySelector('input[type="checkbox"]') as HTMLInputElement;
            expect(resetTaskName.value).toBe('');
            expect(resetTaskCheckbox.checked).toBe(false);
        });
    });
});
