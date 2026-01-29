import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TextCell } from './TextCell';
import { CellAttribute, Cell } from '@/app/lib/models/cell';

describe('TextCell', () => {
    const baseCell = new Cell({
        id: '1234567890123-ABCDE',
        attribute: CellAttribute.Text,
        name: 'Initial Name',
        value: 'Initial Value',
        geo: null,
        remove: null,
    });

    const mockSave = vi.fn();

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

    it('Enterキー操作: name フィールドで Enter を押すと value フィールドへ移動すること', () => {
        render(<TextCell cell={baseCell} onSave={mockSave} />);
        const nameInput = screen.getByDisplayValue('Initial Name');
        const valueInput = screen.getByDisplayValue('Initial Value');

        // focus name
        nameInput.focus();
        expect(nameInput).toHaveFocus();

        // press Enter
        act(() => {
            fireEvent.keyDown(nameInput, { key: 'Enter', code: 'Enter' });
        });

        expect(valueInput).toHaveFocus();
    });

    describe('フォーカス制御 (仕様 4.2.2)', () => {
        beforeEach(() => {
            vi.useFakeTimers();
        });

        afterEach(() => {
            vi.useRealTimers();
        });

        it('初期フォーカス: 両方空の場合は name にフォーカス', () => {
            const cell = new Cell({ ...baseCell, name: '', value: '' });
            render(<TextCell cell={cell} onSave={mockSave} />);

            // TextCellのコンテナをクリックしてフォーカス制御を発動させる
            // Note: 現状の実装は onClick で trigger している
            fireEvent.click(screen.getByTestId('text-cell'));

            vi.runAllTimers();

            const nameInput = screen.getByPlaceholderText('Title');
            expect(nameInput).toHaveFocus();
        });

        it('初期フォーカス: nameのみある場合は value にフォーカス', () => {
            const cell = new Cell({ ...baseCell, name: 'Title Only', value: '' });
            render(<TextCell cell={cell} onSave={mockSave} />);

            fireEvent.click(screen.getByTestId('text-cell'));
            vi.runAllTimers();

            const valueInput = screen.getByPlaceholderText('Description...');
            expect(valueInput).toHaveFocus();
        });

        it('初期フォーカス: valueのみある場合は name にフォーカス', () => {
            const cell = new Cell({ ...baseCell, name: '', value: 'Content Only' });
            render(<TextCell cell={cell} onSave={mockSave} />);

            fireEvent.click(screen.getByTestId('text-cell'));
            vi.runAllTimers();

            const nameInput = screen.getByPlaceholderText('Title');
            expect(nameInput).toHaveFocus();
        });

        it('初期フォーカス: 両方ある場合は value にフォーカス', () => {
            const cell = new Cell({ ...baseCell, name: 'Title', value: 'Content' });
            render(<TextCell cell={cell} onSave={mockSave} />);

            fireEvent.click(screen.getByTestId('text-cell'));
            vi.runAllTimers();

            const valueInput = screen.getByPlaceholderText('Description...');
            expect(valueInput).toHaveFocus();
        });
    });

    it('表示制御: フォーカスが外れた状態で空のフィールドが非表示になること', () => {
        const cell = new Cell({ ...baseCell, name: '', value: 'Something' });
        const { rerender } = render(<TextCell cell={cell} onSave={mockSave} />);

        // name は空なので非表示（または存在しない）
        expect(screen.queryByDisplayValue('')).not.toBeInTheDocument();
    });
});
