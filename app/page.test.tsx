import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Home from './page';
import { CellRepository } from './lib/db/operations';
import { Cell } from './lib/models/cell';

// CellRepository をモック化
vi.mock('./lib/db/operations', () => ({
    CellRepository: {
        save: vi.fn().mockResolvedValue(undefined),
    }
}));

describe('Home Page', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders CellUI and Save button', () => {
        const { container } = render(<Home />);

        // Spec 4.2.2: 初期状態では空のフィールドは非表示のため、コンテナをクリックして表示させる
        const cellUI = container.querySelector('.cursor-text') as HTMLElement;
        expect(cellUI).toBeInTheDocument();
        fireEvent.click(cellUI);

        expect(screen.getByPlaceholderText(/Log Title/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Write details/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /SAVE LOG/i })).toBeInTheDocument();
    });

    it('removes counter elements', () => {
        render(<Home />);

        expect(screen.queryByText('カウンタ')).not.toBeInTheDocument();
        expect(screen.queryByText('増加')).not.toBeInTheDocument();
        expect(screen.queryByText('減少')).not.toBeInTheDocument();
    });

    it('calls CellRepository.save when save button is clicked', async () => {
        const { container } = render(<Home />);

        const cellUI = container.querySelector('.cursor-text') as HTMLElement;
        fireEvent.click(cellUI);

        const valueInput = screen.getByPlaceholderText(/Write details/i);
        fireEvent.change(valueInput, { target: { value: 'New log entry' } });
        fireEvent.blur(valueInput); // CellUI の onUpdate を発火させるため

        const saveButton = screen.getByRole('button', { name: /SAVE LOG/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(CellRepository.save).toHaveBeenCalled();
        });

        const savedCell = vi.mocked(CellRepository.save).mock.calls[0][0] as Cell;
        expect(savedCell.value).toBe('New log entry');
    });

    it('resets the cell UI after saving', async () => {
        const { container } = render(<Home />);

        const cellUI = container.querySelector('.cursor-text') as HTMLElement;
        fireEvent.click(cellUI);

        const valueInput = screen.getByPlaceholderText(/Write details/i);
        fireEvent.change(valueInput, { target: { value: 'Content to be reset' } });
        fireEvent.blur(valueInput);

        const saveButton = screen.getByRole('button', { name: /SAVE LOG/i });
        fireEvent.click(saveButton);

        await waitFor(() => {
            expect(CellRepository.save).toHaveBeenCalled();
        });

        // 保存後にリセットされる（入力フィールドが空になる）
        await waitFor(() => {
            // ステート更新後の要素を再取得してクリック
            const nextCellUI = container.querySelector('.cursor-text') as HTMLElement;
            fireEvent.click(nextCellUI);
            expect(screen.getByPlaceholderText(/Write details/i)).toHaveValue('');
        });
    });
});
