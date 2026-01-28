import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeCell } from './TimeCell';
import { CellAttribute, Cell } from '@/app/lib/models/cell';

describe('TimeCell', () => {
    const baseCell: Cell = {
        id: '1234567890123-ABCDE',
        attribute: CellAttribute.Time,
        name: 'Time Entry',
        // 2026-01-28 12:00:00 (Local time, no Z)
        value: '2026-01-28T12:00:00',
        geo: null,
        remove: null,
    };

    const mockSave = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        // HTMLInputElement.prototype.showPicker is not implemented in JSDOM
        if (!HTMLInputElement.prototype.showPicker) {
            HTMLInputElement.prototype.showPicker = vi.fn();
        }
    });

    it('初期表示: name と value (日付・時刻) が正しく表示されること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);

        expect(screen.getByDisplayValue('Time Entry')).toBeInTheDocument();

        // 新仕様ではテキストボックスを使用
        const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
        const timeInput = screen.getByLabelText(/time/i) as HTMLInputElement;

        const d = new Date(baseCell.value);
        const expectedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const expectedTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

        expect(dateInput.value).toBe(expectedDate);
        expect(timeInput.value).toBe(expectedTime);
    });

    it('初期表示: valueが数値文字列の場合でも正しく日付・時刻が表示されること', () => {
        const numericValueCell: Cell = {
            ...baseCell,
            // 2026-01-28T12:00:00.000Z in milliseconds (approximate)
            // 1769572800000 -> 2026-01-28T04:00:00.000Z (UTC) for simpler math
            // Let's use specific timestamp: 1769601600000 (2026-01-28T12:00:00.000Z)
            value: '1769601600000'
        };

        render(<TimeCell cell={numericValueCell} onSave={mockSave} />);

        const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
        const timeInput = screen.getByLabelText(/time/i) as HTMLInputElement;

        const d = new Date(parseInt(numericValueCell.value, 10));
        const expectedDate = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
        const expectedTime = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

        expect(dateInput.value).toBe(expectedDate);
        expect(timeInput.value).toBe(expectedTime);
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

    it('テキストボックスをクリックするとピッカー（showPicker）が呼ばれること', () => {
        const showPickerMock = vi.spyOn(HTMLInputElement.prototype, 'showPicker');
        render(<TimeCell cell={baseCell} onSave={mockSave} />);

        const dateInput = screen.getByLabelText(/date/i);
        fireEvent.click(dateInput);
        // spec: "テキストボックスをクリックするとそれぞれの日付時刻選択UIを表示する"
        // 実際の実装では hidden な input[type="date"] を叩くか、自分自身の showPicker を呼ぶ
        expect(showPickerMock).toHaveBeenCalled();
    });

    it('UI要件: 配置、ギャップ、デザインが仕様通りであること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);

        const container = screen.getByTestId('time-cell');
        const nameInput = screen.getByDisplayValue('Time Entry');
        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);

        // コンテナの配置確認 (左詰め、gap-1 (4px))
        expect(container).toHaveClass('items-start');
        expect(container).toHaveClass('gap-1');

        // デザイン確認: 背景透明、文字色白、枠線なし、可変幅
        [nameInput, dateInput, timeInput].forEach(input => {
            expect(input).toHaveClass('bg-transparent');
            expect(input).toHaveClass('text-white');
            expect(input).toHaveClass('border-none');
        });

        // 可変幅の確認 (w-auto or calc or similar)
        expect(dateInput).toHaveClass('w-auto');
        expect(timeInput).toHaveClass('w-auto');
    });
});
