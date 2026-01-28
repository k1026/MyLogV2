import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TaskCell } from './TaskCell';
import { CellAttribute, Cell } from '@/app/lib/models/cell';

describe('TaskCell', () => {
    const baseCell: Cell = {
        id: '1234567890123-ABCDE',
        attribute: CellAttribute.Task,
        name: 'Task Title',
        value: 'false',
        geo: null,
        remove: null,
    };

    const mockSave = vi.fn();

    it('初期表示: name と value (チェック状態) が正しく表示されること', () => {
        const { rerender } = render(<TaskCell cell={baseCell} onSave={mockSave} />);

        expect(screen.getByDisplayValue('Task Title')).toBeInTheDocument();
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        expect(checkbox.checked).toBe(false);

        const checkedCell = { ...baseCell, value: 'true' };
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
});
