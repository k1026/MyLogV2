import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TimeCell } from './TimeCell';
import { CellAttribute, Cell } from '@/app/lib/models/cell';

describe('TimeCell', () => {
    const baseCell: Cell = {
        id: '1234567890123-ABCDE',
        attribute: CellAttribute.Time,
        name: 'Time Entry',
        // 2026-01-28 12:00:00
        value: '2026-01-28T12:00:00.000Z',
        geo: null,
        remove: null,
    };

    const mockSave = vi.fn();

    it('初期表示: name と value (日付・時刻) が正しく表示されること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);

        expect(screen.getByDisplayValue('Time Entry')).toBeInTheDocument();

        // input type="date" and type="time" を想定
        const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
        const timeInput = screen.getByLabelText(/time/i) as HTMLInputElement;

        // HTML5 date input formatted as YYYY-MM-DD
        expect(dateInput.value).toBe('2026-01-28');
        // HTML5 time input formatted as HH:MM
        expect(timeInput.value).toBe('12:00');
    });

    it('日付を変更すると onSave が呼ばれること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);
        const dateInput = screen.getByLabelText(/date/i);

        fireEvent.change(dateInput, { target: { value: '2026-01-29' } });
        fireEvent.blur(dateInput);

        expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
            value: expect.stringContaining('2026-01-29T12:00:00')
        }));
    });

    it('時刻を変更すると onSave が呼ばれること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);
        const timeInput = screen.getByLabelText(/time/i);

        fireEvent.change(timeInput, { target: { value: '13:30' } });
        fireEvent.blur(timeInput);

        expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
            value: expect.stringContaining('2026-01-28T13:30:00')
        }));
    });

    it('nameを編集してblurするとonSaveが呼ばれること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);
        const nameInput = screen.getByDisplayValue('Time Entry');

        fireEvent.change(nameInput, { target: { value: 'New Time Title' } });
        fireEvent.blur(nameInput);

        expect(mockSave).toHaveBeenCalledWith(expect.objectContaining({
            name: 'New Time Title'
        }));
    });
});
