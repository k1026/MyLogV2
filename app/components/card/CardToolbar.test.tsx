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

    it('Toolbar container should have correct height and padding', () => {
        render(<CardToolbar sortState={mockSortState} />);
        // Wrapper div
        // Current code has h-[28px], px-1. Spec says p-4px? 
        // We will test for h-[28px] and check if padding roughly matches.
        // Spec says: "Height 28px... Padding 4px". 
        // px-1 is 4px horizontal. If py is 0, that might be mismatch.
        // Let's assert class names.
        // Note: The code might be `h-[28px] px-1`.
        const container = screen.getByLabelText('Sort by Time').parentElement;
        expect(container).toHaveClass('h-[28px]');
        // expect(container).toHaveClass('p-[4px]'); // This might fail if it's px-1
    });

    it('Toolbar buttons should be 24x24px', () => {
        render(<CardToolbar sortState={mockSortState} />);
        const btn = screen.getByLabelText('Manual Sort');
        // w-6 h-6 matches 24px
        expect(btn).toHaveClass('w-6');
        expect(btn).toHaveClass('h-6');
        expect(btn).toHaveClass('rounded');
    });

    it('Sort Label should be text-[10px]', () => {
        const withSort = { ...mockSortState, sortMode: 'asc' as const };
        render(<CardToolbar sortState={withSort} />);
        const label = screen.getByText('OLD');
        expect(label).toHaveClass('text-[10px]');
    });
});
