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
});
