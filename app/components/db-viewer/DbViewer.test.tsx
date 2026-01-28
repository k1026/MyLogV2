import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { DbViewer } from './DbViewer';
import { CellRepository } from '@/app/lib/db/operations';

// CellRepository をモック
vi.mock('@/app/lib/db/operations', () => ({
    CellRepository: {
        getCount: vi.fn(),
        getRange: vi.fn(),
        clearAll: vi.fn(),
        delete: vi.fn(),
        exportAsJSONL: vi.fn(),
        importFromJSONL: vi.fn(),
    }
}));

describe('DbViewer', () => {
    const mockOnClose = vi.fn();

    beforeEach(() => {
        // 各テストの前にモックをリセットし、デフォルトの戻り値を設定
        vi.clearAllMocks();
        // 型安全なモック呼び出し
        (CellRepository.getCount as ReturnType<typeof vi.fn>).mockResolvedValue(0);
        (CellRepository.getRange as ReturnType<typeof vi.fn>).mockResolvedValue([]);
    });

    it('isOpen=true の時に表示され、ロゴ、操作ボタン、リスト情報、リストヘッダーが存在すること', async () => {
        // 非同期データロードを待機するためにactを使用
        await act(async () => {
            render(<DbViewer isOpen={true} onClose={mockOnClose} />);
        });

        // オーバーレイ
        expect(screen.getByTestId('db-viewer-overlay')).toBeInTheDocument();

        // ロゴ
        expect(screen.getByText('Database')).toBeInTheDocument();
        expect(screen.getByText('LOCAL')).toBeInTheDocument();

        // 操作ボタン
        expect(screen.getByRole('button', { name: /DELETE DB/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Append/i })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Export/i })).toBeInTheDocument();

        // リスト情報 (アイテム数、ページネーション)
        expect(screen.getByText(/アイテム数/)).toBeInTheDocument();
        expect(screen.getAllByText('1').length).toBeGreaterThanOrEqual(2); // 現在のページと総ページ
        expect(screen.getByText('/')).toBeInTheDocument();

        expect(screen.getByRole('button', { name: '<' })).toBeInTheDocument();
        expect(screen.getByRole('button', { name: '>' })).toBeInTheDocument();

        // リストヘッダー
        expect(screen.getByText('ID')).toBeInTheDocument();
        expect(screen.getByText('GPS')).toBeInTheDocument();
        expect(screen.getByText('ATTRIBUTE')).toBeInTheDocument();
        expect(screen.getByText('NAME')).toBeInTheDocument();
        expect(screen.getByText('VALUE')).toBeInTheDocument();
        expect(screen.getByText('REMOVE')).toBeInTheDocument();
    });

    it('データがある場合に正しくリスト表示されること', async () => {
        const mockCells = [
            { id: '1-A', attribute: 'Text', name: 'Name1', value: 'Val1', geo: null, remove: null },
            { id: '2-B', attribute: 'Task', name: 'Name2', value: 'true', geo: '35.0 135.0', remove: null },
        ];
        (CellRepository.getCount as any).mockResolvedValue(2);
        (CellRepository.getRange as any).mockResolvedValue(mockCells);

        await act(async () => {
            render(<DbViewer isOpen={true} onClose={mockOnClose} />);
        });

        expect(screen.getByText('1-A')).toBeInTheDocument();
        expect(screen.getByText('Name1')).toBeInTheDocument();
        expect(screen.getByText('Val1')).toBeInTheDocument();
        expect(screen.getByText('2-B')).toBeInTheDocument();
        expect(screen.getByText('35.0 135.0')).toBeInTheDocument();
    });

    it('REMOVEボタンをクリックすると CellRepository.delete が呼ばれること', async () => {
        const mockCells = [{ id: '1-A', attribute: 'Text', name: 'Name1', value: 'Val1', geo: null, remove: null }];
        (CellRepository.getCount as any).mockResolvedValue(1);
        (CellRepository.getRange as any).mockResolvedValue(mockCells);

        await act(async () => {
            render(<DbViewer isOpen={true} onClose={mockOnClose} />);
        });

        const removeButton = screen.getByLabelText('Remove');
        await act(async () => {
            fireEvent.click(removeButton);
        });

        expect(CellRepository.delete).toHaveBeenCalledWith('1-A');
    });

    it('DeleteDBボタンをクリックすると確認後に CellRepository.clearAll が呼ばれること', async () => {
        (CellRepository.getCount as any).mockResolvedValue(10);
        window.confirm = vi.fn().mockReturnValue(true);

        await act(async () => {
            render(<DbViewer isOpen={true} onClose={mockOnClose} />);
        });

        const deleteButton = screen.getByRole('button', { name: /DELETE DB/i });
        await act(async () => {
            fireEvent.click(deleteButton);
        });

        expect(window.confirm).toHaveBeenCalled();
        expect(CellRepository.clearAll).toHaveBeenCalled();
    });

    it('Exportボタンをクリックすると CellRepository.exportAsJSONL が呼ばれ、ダウンロードが行われること', async () => {
        (CellRepository.exportAsJSONL as any).mockResolvedValue('{"I":"1"}');
        // URL.createObjectURL と revorkeObjectURL をモック
        window.URL.createObjectURL = vi.fn().mockReturnValue('blob:url');
        window.URL.revokeObjectURL = vi.fn();

        await act(async () => {
            render(<DbViewer isOpen={true} onClose={mockOnClose} />);
        });

        const exportButton = screen.getByRole('button', { name: /Export/i });
        await act(async () => {
            fireEvent.click(exportButton);
        });

        expect(CellRepository.exportAsJSONL).toHaveBeenCalled();
        expect(window.URL.createObjectURL).toHaveBeenCalled();
    });

    it('閉じるボタンをクリックすると onClose が呼ばれること', () => {
        render(<DbViewer isOpen={true} onClose={mockOnClose} />);
        const closeButton = screen.getByLabelText('閉じる');

        fireEvent.click(closeButton);

        expect(mockOnClose).toHaveBeenCalled();
    });
});
