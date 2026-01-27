import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { TimeCellUI, TextCellUI, TaskCellUI } from './CellUI';
import { Cell } from '@/app/lib/models/cell';
import { CellSchema } from '@/app/lib/models/cell';
import { mockValid } from 'zod-mocking';

// zod-mocking の型安全な扱いのためのヘルパー
function mockCell(attribute: 'Time' | 'Text' | 'Task'): Cell {
    const mocks = mockValid(CellSchema as any);
    const mockData = mocks.DEFAULT;
    return new Cell({ ...mockData, attribute });
}

describe('CellUI Components', () => {

    describe('TimeCellUI', () => {
        it('renders name and value fields', () => {
            const cell = mockCell('Time');
            cell.name = 'Test Time';
            cell.value = '1737942779000'; // 2025-01-27

            render(<TimeCellUI cell={cell} />);

            expect(screen.getByPlaceholderText('Event Name')).toHaveValue('Test Time');
        });

        it('calls onUpdate when name is changed (Idempotency check)', async () => {
            const cell = mockCell('Time');
            const onUpdate = vi.fn();
            render(<TimeCellUI cell={cell} onUpdate={onUpdate} />);

            const nameInput = screen.getByPlaceholderText('Event Name');

            // 1回目の変更
            fireEvent.change(nameInput, { target: { value: 'New Name' } });
            fireEvent.blur(nameInput);
            expect(onUpdate).toHaveBeenCalledTimes(1);

            // 同じ値でblurしても呼ばれないこと（べき等性の確認）
            fireEvent.blur(nameInput);
            expect(onUpdate).toHaveBeenCalledTimes(1);
        });
    });

    describe('TextCellUI', () => {
        it('renders name and value fields', () => {
            const cell = mockCell('Text');
            cell.name = 'Test Task';
            cell.value = 'Description';

            render(<TextCellUI cell={cell} />);

            expect(screen.getByDisplayValue('Test Task')).toBeInTheDocument();
            expect(screen.getByDisplayValue('Description')).toBeInTheDocument();
        });

        it('hides empty fields when not focused (Spec 4.2.2 - Zero Case)', () => {
            const cell = mockCell('Text');
            cell.name = '';
            cell.value = '';

            const { container } = render(<TextCellUI cell={cell} />);

            const inputs = container.querySelectorAll('input, textarea');
            expect(inputs.length).toBe(0);
        });

        it('focuses on name when both fields are empty (Spec 4.2.2)', () => {
            const cell = mockCell('Text');
            cell.name = '';
            cell.value = '';

            const { container } = render(<TextCellUI cell={cell} />);
            const clickableArea = container.firstChild as HTMLElement;
            fireEvent.click(clickableArea);

            expect(document.activeElement).toBe(screen.getByPlaceholderText('Log Title'));
        });

        it('focuses on value when name is filled (Spec 4.2.2)', () => {
            const cell = mockCell('Text');
            cell.name = 'Has Name';
            cell.value = '';

            const { container } = render(<TextCellUI cell={cell} />);
            const clickableArea = container.firstChild as HTMLElement;
            fireEvent.click(clickableArea);

            expect(document.activeElement).toBe(screen.getByPlaceholderText('Write details...'));
        });

        it('navigates from Title to Value on Enter key (Logical Coverage)', () => {
            const cell = mockCell('Text');
            cell.name = 'Some Title';
            cell.value = '';

            render(<TextCellUI cell={cell} />);
            fireEvent.click(screen.getByDisplayValue('Some Title'));

            const titleInput = screen.getByPlaceholderText('Log Title');
            fireEvent.keyDown(titleInput, { key: 'Enter' });

            expect(document.activeElement).toBe(screen.getByPlaceholderText('Write details...'));
        });

        it('calls onUpdate when content is changed (Idempotency check)', async () => {
            const cell = mockCell('Text');
            cell.name = 'Old Title';
            const onUpdate = vi.fn();
            render(<TextCellUI cell={cell} onUpdate={onUpdate} />);

            const nameInput = screen.getByPlaceholderText('Log Title');

            // 1回目の変更
            fireEvent.change(nameInput, { target: { value: 'New Title' } });
            fireEvent.blur(nameInput);
            expect(onUpdate).toHaveBeenCalledTimes(1);

            // 同じ値でblurしても呼ばれないこと
            fireEvent.blur(nameInput);
            expect(onUpdate).toHaveBeenCalledTimes(1);
        });
    });

    describe('TaskCellUI', () => {
        it('renders name and checkbox', () => {
            const cell = mockCell('Task');
            cell.name = 'Do something';
            cell.value = ''; // 未完了

            render(<TaskCellUI cell={cell} />);

            expect(screen.getByPlaceholderText('What needs to be done?')).toHaveValue('Do something');
            const checkbox = screen.getByRole('checkbox');
            expect(checkbox).not.toBeChecked();
        });

        it('updates task completion when checkbox is clicked', async () => {
            const cell = mockCell('Task');
            const onUpdate = vi.fn();
            render(<TaskCellUI cell={cell} onUpdate={onUpdate} />);

            const checkbox = screen.getByRole('checkbox');
            fireEvent.click(checkbox);

            expect(onUpdate).toHaveBeenCalled();
            const updatedCell = onUpdate.mock.calls[0][0];
            expect(updatedCell.value).not.toBe(''); // タイムスタンプが入るはず
        });

        it('calls onUpdate when name is changed (Idempotency check)', async () => {
            const cell = mockCell('Task');
            cell.name = 'Old Task';
            const onUpdate = vi.fn();
            render(<TaskCellUI cell={cell} onUpdate={onUpdate} />);

            const nameInput = screen.getByPlaceholderText('What needs to be done?');

            // 1回目の変更
            fireEvent.change(nameInput, { target: { value: 'New Task' } });
            fireEvent.blur(nameInput);
            expect(onUpdate).toHaveBeenCalledTimes(1);

            // 同じ値でblurしても呼ばれないこと
            fireEvent.blur(nameInput);
            expect(onUpdate).toHaveBeenCalledTimes(1);
        });
    });
});
