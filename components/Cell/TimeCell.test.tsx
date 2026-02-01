import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { TimeCell } from './TimeCell';
import { CellAttribute, Cell } from '@/lib/models/cell';

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
        if (!HTMLInputElement.prototype.showPicker) {
            HTMLInputElement.prototype.showPicker = vi.fn();
        }
    });

    it('初期表示: name と value (日付・時刻) が正しく表示されること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);

        // タイトルの確認
        const nameInput = screen.getByDisplayValue('Time Entry');
        expect(nameInput).toBeInTheDocument();

        // 日付・時刻ボタンの確認 (仕様: 日付 200px, 時刻 100px)
        const dateButton = screen.getByRole('button', { name: /date/i });
        const timeButton = screen.getByRole('button', { name: /time/i });

        expect(dateButton).toHaveTextContent('2026-01-28');
        expect(timeButton).toHaveTextContent('12:00');
    });

    it('UI要件: 配置、デザインが仕様通りであること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);

        const container = screen.getByTestId('time-cell');
        const nameInput = screen.getByDisplayValue('Time Entry');
        const dateButton = screen.getByRole('button', { name: /date/i });
        const timeButton = screen.getByRole('button', { name: /time/i });

        // コンテナ: flex-col, gap-[2px], items-start
        expect(container).toHaveClass('flex-col');
        expect(container).toHaveClass('gap-[2px]');
        expect(container).toHaveClass('items-start');

        // 値行: flex-row, gap-2 (8px)
        const valueRow = dateButton.parentElement;
        expect(valueRow).toHaveClass('flex-row');
        expect(valueRow).toHaveClass('gap-2');

        // 全体: 角丸なし、枠線なし、背景透明
        expect(container).not.toHaveClass('rounded-lg');
        expect(container).not.toHaveClass('border');

        // タイトル: 14px, text-white, font-medium
        expect(nameInput).toHaveClass('text-[14px]');
        expect(nameInput).toHaveClass('text-white');
        expect(nameInput).toHaveClass('font-medium');

        // 日付ボタン: 18px, w-fit, text-white
        expect(dateButton).toHaveClass('text-[18px]');
        expect(dateButton).toHaveClass('w-fit');
        expect(dateButton).toHaveClass('text-white');

        // 時刻ボタン: 18px, w-fit, text-white
        expect(timeButton).toHaveClass('text-[18px]');
        expect(timeButton).toHaveClass('w-fit');
        expect(timeButton).toHaveClass('text-white');
    });

    it('タイトルを変更すると onSave が呼ばれること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);
        const nameInput = screen.getByDisplayValue('Time Entry');

        fireEvent.change(nameInput, { target: { value: 'New Name' } });
        fireEvent.blur(nameInput);

        expect(mockSave).toHaveBeenCalledTimes(1);
        expect(mockSave.mock.calls[0][0].name).toBe('New Name');
    });

    it('ボタンをクリックするとピッカーが開くこと', () => {
        const showPickerMock = vi.spyOn(HTMLInputElement.prototype, 'showPicker');
        render(<TimeCell cell={baseCell} onSave={mockSave} />);

        const dateButton = screen.getByRole('button', { name: /date/i });
        fireEvent.click(dateButton);
        expect(showPickerMock).toHaveBeenCalled();

        const timeButton = screen.getByRole('button', { name: /time/i });
        fireEvent.click(timeButton);
        expect(showPickerMock).toHaveBeenCalledTimes(2);
    });

    it('ピッカーで値を変更すると onSave が呼ばれること', () => {
        render(<TimeCell cell={baseCell} onSave={mockSave} />);

        // 日付の変更 (aria-label="Date Input" の input を探す)
        const dateInput = screen.getByLabelText('Date Input');
        fireEvent.change(dateInput, { target: { value: '2026-01-29' } });

        expect(mockSave).toHaveBeenCalled();
        expect(mockSave.mock.calls[0][0].value).toContain('2026-01-29T12:00:00');
        mockSave.mockClear();

        // 時刻の変更 (aria-label="Time Input" の input を探す)
        const timeInput = screen.getByLabelText('Time Input');
        fireEvent.change(timeInput, { target: { value: '13:00' } });

        expect(mockSave).toHaveBeenCalled();
        // 直前のテストで日付が 29 になっているので、29 を期待する
        expect(mockSave.mock.calls[0][0].value).toContain('2026-01-29T13:00:00');
    });
});
