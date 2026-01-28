// Card.test.tsx
// Issue: toggle logic now excludes header buttons or wrapper click logic changed
// The implementation `onClick={!isExpanded ? handleToggle : undefined}` means 
// once expanded, clicking the container DOESNT toggle.
// Collapse must be done via "Close" button.

// Fix test "toggles expansion on click":
// Expanding works via container click. Collapsing needs "Close" button.

// Fix test "calls cleanupCardCells when collapsed":
// Same, needs "Close" button.

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from './Card';
import { Cell, CellAttribute } from '@/app/lib/models/cell';
import { vi, describe, it, expect } from 'vitest';

// Mock dependencies
vi.mock('@/app/contexts/RarityContext', () => ({
    useRarity: () => ({
        rarityData: new Map(),
    }),
}));

vi.mock('dexie-react-hooks', () => ({
    useLiveQuery: () => {
        return [
            { I: 'child1', A: 'Time', N: 'Time', V: 'Now', G: null, R: null },
            { I: 'child2', A: 'Text', N: 'Child Title', V: 'Some text', G: null, R: null }
        ];
    }
}));


vi.mock('./cardUtils', () => ({
    cleanupCardCells: vi.fn(),
    createCard: vi.fn(),
    addCellToCard: vi.fn(),
}));

import { cleanupCardCells } from './cardUtils';

const mockCardCell: Cell = {
    id: '1700000000000-ABCDE', // 2023-11-14...
    attribute: CellAttribute.Card,
    name: 'Test Card',
    value: 'child1 child2',
    geo: null,
    remove: null,
};

describe('Card Component', () => {
    it('renders the card container', () => {
        render(<Card cell={mockCardCell} />);
        // Should fail as Card returns null
        expect(screen.getByTestId('card-container')).toBeInTheDocument();
    });

    it('displays the creation time derived from ID', () => {
        render(<Card cell={mockCardCell} />);
        expect(screen.queryByText(/2023/)).toBeInTheDocument();
    });

    it('displays the title of the first text/task cell', async () => {
        render(<Card cell={mockCardCell} />);
        await waitFor(() => {
            expect(screen.getByText('Child Title')).toBeInTheDocument();
        });
    });

    it('toggles expansion on click', async () => {
        render(<Card cell={mockCardCell} />);

        const card = screen.getByTestId('card-container');

        // Initially collapsed
        expect(screen.queryByTestId('card-item-list')).not.toBeInTheDocument();

        // Click to expand
        fireEvent.click(card);
        expect(screen.getByTestId('card-item-list')).toBeInTheDocument();

        // Click to collapse (must use Close button now)
        const closeBtn = screen.getByTestId('card-close-button');
        fireEvent.click(closeBtn);

        expect(screen.queryByTestId('card-item-list')).not.toBeInTheDocument();
    });

    it('calls cleanupCardCells when collapsed', async () => {
        render(<Card cell={mockCardCell} />);
        const card = screen.getByTestId('card-container');

        // Expand
        fireEvent.click(card);

        // Collapse
        const closeBtn = screen.getByTestId('card-close-button');
        fireEvent.click(closeBtn);

        expect(cleanupCardCells).toHaveBeenCalledWith(mockCardCell);
    });

    it('renders Toolbar and FAB when expanded', async () => {
        render(<Card cell={mockCardCell} />);
        const card = screen.getByTestId('card-container');

        // Expand
        fireEvent.click(card);

        // Check Toolbar elements (Sort buttons)
        expect(screen.getByLabelText('Sort by Time')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort by Task')).toBeInTheDocument();

        // Check FAB
        expect(screen.getByLabelText('Add')).toBeInTheDocument();
    });

    it('adds cell via FAB', async () => {
        // Mock addCellToCard logic is handled by vi.mock above
        const { addCellToCard } = await import('./cardUtils');

        render(<Card cell={mockCardCell} />);
        const card = screen.getByTestId('card-container');
        fireEvent.click(card); // Expand

        const fab = screen.getByLabelText('Add');

        // Click FAB (Default Text)
        fireEvent.mouseDown(fab);
        fireEvent.mouseUp(fab);

        expect(addCellToCard).toHaveBeenCalledWith(
            mockCardCell.id,
            CellAttribute.Text,
            expect.any(Array) // currentIds
        );
    });
});

