import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeCell } from './TimeCell';
import { CellAttribute, Cell } from '@/app/lib/models/cell';

describe('TimeCell', () => {
    const baseCell = new Cell({
        id: '1234567890123-ABCDE',
        attribute: CellAttribute.Time,
        name: 'Time Entry',
        value: '2026-01-28T12:00:00',
        geo: null,
        remove: null,
    });

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

        const dateInput = screen.getByLabelText(/date/i) as HTMLInputElement;
        const timeInput = screen.getByLabelText(/time/i) as HTMLInputElement;

        // Expect YYYY-MM-DD
        expect(dateInput.value).toBe('2026-01-28');
        // Expect HH:mm
        expect(timeInput.value).toBe('12:00');
    });

    it('UI要件: 配置、ギャップ、デザインが仕様通りであること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);

        const container = screen.getByTestId('time-cell');
        const nameInput = screen.getByDisplayValue('Time Entry');
        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);

        // コンテナの配置確認 (左詰め、gap 2px)
        expect(container).toHaveClass('items-start');
        expect(container).toHaveClass('gap-[2px]');

        // デザイン確認: 背景透明、文字色白、枠線なし
        [nameInput, dateInput, timeInput].forEach(input => {
            expect(input).toHaveClass('bg-transparent');
            expect(input).toHaveClass('text-white');
            expect(input).toHaveClass('border-none');
            expect(input).toHaveClass('outline-none');
        });

        // テキスト配置
        // タイトル: 14px, medium
        expect(nameInput).toHaveClass('text-[14px]');
        expect(nameInput).toHaveClass('font-medium');

        // 値: 18px, normal
        expect(dateInput).toHaveClass('text-[18px]');
        expect(dateInput).toHaveClass('font-normal');
        expect(timeInput).toHaveClass('text-[18px]');
        expect(timeInput).toHaveClass('font-normal');

        // 自動保存ピッカー用クラス (w-full, min-w-0 for grid overlap)
        expect(dateInput).toHaveClass('w-full');
        expect(dateInput).toHaveClass('min-w-0');
        expect(timeInput).toHaveClass('w-full');
        expect(timeInput).toHaveClass('min-w-0');

        // inputs should NOT have w-auto (cause of the bug)
        expect(dateInput).not.toHaveClass('w-auto');
        expect(timeInput).not.toHaveClass('w-auto');
    });

    it('日付、時刻、タイトルを変更すると onSave が呼ばれること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);
        const dateInput = screen.getByLabelText(/date/i);
        const timeInput = screen.getByLabelText(/time/i);
        const nameInput = screen.getByDisplayValue('Time Entry');

        // Date Change
        fireEvent.change(dateInput, { target: { value: '2026-01-29' } });
        fireEvent.blur(dateInput);
        expect(mockSave).toHaveBeenCalledWith(expect.any(Cell));
        expect(mockSave.mock.calls[0][0].value).toContain('2026-01-29T12:00:00');
        mockSave.mockClear();

        // Time Change
        fireEvent.change(timeInput, { target: { value: '13:00' } });
        fireEvent.blur(timeInput);
        expect(mockSave).toHaveBeenCalledWith(expect.any(Cell));
        // Previous step set date to 29, so we expect 29 here too
        expect(mockSave.mock.calls[0][0].value).toContain('2026-01-29T13:00:00');
        mockSave.mockClear();

        // Name Change
        fireEvent.change(nameInput, { target: { value: 'New Name' } });
        fireEvent.blur(nameInput);
        expect(mockSave).toHaveBeenCalledWith(expect.any(Cell));
        expect(mockSave.mock.calls[0][0].name).toBe('New Name');
    });

    it('テキストボックスをクリックするとピッカーが開くこと', () => {
        const showPickerMock = vi.spyOn(HTMLInputElement.prototype, 'showPicker');
        render(<TimeCell cell={baseCell} onSave={mockSave} />);

        const dateInput = screen.getByLabelText(/date/i);
        fireEvent.click(dateInput);
        expect(showPickerMock).toHaveBeenCalled();
    });
});
