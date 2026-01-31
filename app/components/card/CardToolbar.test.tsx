import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardToolbar } from './CardToolbar';
import { UseCardSortResult } from './useCardSort';
import { describe, it, expect, vi } from 'vitest';

describe('CardToolbar', () => {
    const mockSortState: UseCardSortResult = {
        sortedCells: [],
        sortMode: 'none',
        taskSortMode: 'none',
        toggleSort: vi.fn(),
        toggleTaskSort: vi.fn(),
        setManualSort: vi.fn(),
        isManualSort: false,
    };

    it('renders sort buttons', () => {
        render(<CardToolbar sortState={mockSortState} />);

        // Expect minimal buttons: Close is in Card, but Sort/Task/Manual are here
        // We look for aria-labels or roles
        expect(screen.getByLabelText('Sort by Time')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by Task')).toBeInTheDocument();
        expect(screen.getByLabelText('Manual Sort')).toBeInTheDocument();
    });

    it('calls toggleSort when sort button is clicked', () => {
        render(<CardToolbar sortState={mockSortState} />);
        fireEvent.click(screen.getByLabelText('Sort by Time'));
        expect(mockSortState.toggleSort).toHaveBeenCalled();
    });

    it('calls toggleTaskSort when task button is clicked', () => {
        render(<CardToolbar sortState={mockSortState} />);
        fireEvent.click(screen.getByLabelText('Sort by Task'));
        expect(mockSortState.toggleTaskSort).toHaveBeenCalled();
    });

    it('calls setManualSort when manual button is clicked', () => {
        render(<CardToolbar sortState={mockSortState} />);
        fireEvent.click(screen.getByLabelText('Manual Sort'));
        expect(mockSortState.setManualSort).toHaveBeenCalled();
    });

    // --- Style & Design Spec Tests ---

    it('Toolbar container should have gap-1 and background', () => {
        render(<CardToolbar sortState={mockSortState} />);
        const toolbar = screen.getByLabelText('Sort by Time').closest('div');
        expect(toolbar).toHaveClass('gap-1');
        expect(toolbar).toHaveClass('bg-white/10');
    });

    it('Toolbar buttons should be vertical layout (flex-col)', () => {
        const withSort = { ...mockSortState, sortMode: 'desc' as const };
        render(<CardToolbar sortState={withSort} />);
        const sortBtn = screen.getByLabelText('Sort by Time');
        // 仕様: アイコンは横並び、詳細ラベルはアイコンの下に中央揃え
        expect(sortBtn).toHaveClass('flex-col');
        expect(sortBtn).toHaveClass('items-center');
    });

    it('Active/Inactive button styles', () => {
        const withActive = { ...mockSortState, isManualSort: true };
        const { rerender } = render(<CardToolbar sortState={withActive} />);
        const manualBtn = screen.getByLabelText('Manual Sort');

        // Active: text-white
        expect(manualBtn).toHaveClass('text-white');

        rerender(<CardToolbar sortState={{ ...mockSortState, isManualSort: false }} />);
        // Inactive: text-white/50 (灰色)
        expect(manualBtn).toHaveClass('text-white/50');
    });

    it('Task Sort icon should change based on state', () => {
        // none -> complete (check_box) -> incomplete (check_box_outline_blank)
        const { rerender } = render(<CardToolbar sortState={{ ...mockSortState, taskSortMode: 'none' }} />);
        // MaterialIcon components generally render the icon name as text content
        expect(screen.getByTestId('task-sort-icon')).toHaveTextContent('check_box');

        rerender(<CardToolbar sortState={{ ...mockSortState, taskSortMode: 'complete' }} />);
        expect(screen.getByTestId('task-sort-icon')).toHaveTextContent('check_box');

        rerender(<CardToolbar sortState={{ ...mockSortState, taskSortMode: 'incomplete' }} />);
        expect(screen.getByTestId('task-sort-icon')).toHaveTextContent('check_box_outline_blank');
    });

    it('Labels should be 10px and have transition classes', () => {
        const { rerender } = render(<CardToolbar sortState={{ ...mockSortState, sortMode: 'desc' }} />);
        const labelNew = screen.getByText('NEW');
        expect(labelNew).toHaveClass('text-[10px]');
        // 遷移アニメーションの検証
        expect(labelNew).toHaveClass('transition-opacity');
        expect(labelNew).toHaveClass('duration-200');
        // アクティブ時は見える
        expect(labelNew).toHaveClass('text-white');
        expect(labelNew).not.toHaveClass('opacity-0');

        rerender(<CardToolbar sortState={{ ...mockSortState, sortMode: 'none' }} />);
        const labelPlaceholder = screen.getByText('NEW'); // NEW or OLD based on implementation, but let's assume it stays in DOM
        expect(labelPlaceholder).toHaveClass('opacity-0');
    });

    it('Buttons should have hover scale and active shadow', () => {
        const withActive = { ...mockSortState, isManualSort: true };
        render(<CardToolbar sortState={withActive} />);
        const manualBtn = screen.getByLabelText('Manual Sort');

        // Active state shadow
        expect(manualBtn).toHaveClass('shadow-sm');
        expect(manualBtn).toHaveClass('shadow-white/20');

        // Hover scale
        expect(manualBtn).toHaveClass('hover:scale-105');
    });

    it('Task Sort label should toggle correctly', () => {
        const { rerender } = render(<CardToolbar sortState={{ ...mockSortState, taskSortMode: 'complete' }} />);
        expect(screen.getByText('DONE')).toBeInTheDocument();

        rerender(<CardToolbar sortState={{ ...mockSortState, taskSortMode: 'incomplete' }} />);
        expect(screen.getByText('TODO')).toBeInTheDocument();
    });
});
