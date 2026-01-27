import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { DbViewer } from './DbViewer';
import { CellRepository } from '@/app/lib/db/operations';
import { Cell } from '@/app/lib/models/cell';

describe('DbViewer Component', () => {
    beforeEach(async () => {
        await CellRepository.truncate();
        // window.confirm をモック
        vi.stubGlobal('confirm', vi.fn(() => true));
    });

    it('renders header and close button', () => {
        const onClose = vi.fn();
        render(<DbViewer isOpen={true} onClose={onClose} />);

        expect(screen.getByText(/DATABASE/i)).toBeInTheDocument();
        expect(screen.getByText(/System Storage/i)).toBeInTheDocument();

        const closeBtn = screen.getByLabelText('Close');
        fireEvent.click(closeBtn);
        expect(onClose).toHaveBeenCalled();
    });

    it('displays total item count', async () => {
        await CellRepository.save(Cell.create({ attribute: 'Text', name: 'Test1' }));
        await CellRepository.save(Cell.create({ attribute: 'Text', name: 'Test2' }));

        render(<DbViewer isOpen={true} onClose={() => { }} />);

        // アイテムカウントが表示される（＝ロード完了）まで待機
        await waitFor(() => {
            expect(screen.queryByText('Initializing...')).not.toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
        }, { timeout: 3000 });
    });

    it('renders action buttons (Delete, Append, Export)', async () => {
        render(<DbViewer isOpen={true} onClose={() => { }} />);

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Append/i })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();
        });
    });

    it('navigates pages', async () => {
        // 110件作成
        for (let i = 0; i < 110; i++) {
            await CellRepository.save(Cell.create({ attribute: 'Text', name: `Item ${i}` }));
        }

        render(<DbViewer isOpen={true} onClose={() => { }} />);

        // ページ1が表示され、全2ページであることを確認
        await waitFor(() => {
            expect(screen.getByDisplayValue('1')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
        }, { timeout: 5000 });

        // Nextボタンが有効になるのを待ってクリック
        const nextBtn = screen.getByRole('button', { name: '>' });
        await waitFor(() => expect(nextBtn).not.toBeDisabled());
        fireEvent.click(nextBtn);

        await waitFor(() => {
            expect(screen.getByDisplayValue('2')).toBeInTheDocument();
        });
    });

    it('shows confirmation dialog on Delete DB', async () => {
        const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);
        render(<DbViewer isOpen={true} onClose={() => { }} />);

        // ロード完了を待つ
        await waitFor(() => {
            expect(screen.queryByText('Initializing...')).not.toBeInTheDocument();
        });

        const deleteBtn = screen.getByRole('button', { name: /Delete/i });
        await waitFor(() => expect(deleteBtn).not.toBeDisabled());
        fireEvent.click(deleteBtn);

        expect(confirmSpy).toHaveBeenCalledWith(expect.stringContaining('削除'));
        confirmSpy.mockRestore();
    });
});
