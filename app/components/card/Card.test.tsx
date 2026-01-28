import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Card } from './Card';
import { Cell, CellAttribute } from '@/app/lib/models/cell';
import { vi, describe, it, expect, beforeEach } from 'vitest';

// --- Mocks ---

// Rarity
vi.mock('@/app/contexts/RarityContext', () => ({
    useRarity: () => ({
        rarityData: new Map(),
    }),
}));

// DB
const mockPut = vi.fn();
const mockUpdate = vi.fn();
const mockGet = vi.fn();
const mockBulkGet = vi.fn();

vi.mock('@/app/lib/db/db', () => ({
    db: {
        cells: {
            put: (...args: any[]) => mockPut(...args),
            update: (...args: any[]) => mockUpdate(...args),
            get: (...args: any[]) => mockGet(...args),
            bulkGet: (...args: any[]) => mockBulkGet(...args),
        }
    }
}));

// useLiveQuery
// We will simply return the "child cells" for now. 
// When we implement the fix (2 queries), we need to handle that.
// For now, let's assume the test environment renders Card.
// If Card adds a second useLiveQuery, this mock needs to handle it.
// We can use a simple hack: currentCard query usually returns a single object, childCells query returns array.
// But we can't distinguish by input easily without executing.
// Let's mock it to return the 'childCells' array effectively for the list.
// If the code tries to read 'currentCard', and gets an array, it might fail?
// Let's make it return a Proxy or a special object if we want to be fancy, but simple is better.
// We will iterate: verify onSave first.

const defaultChildCells = [
    { I: 'child1', A: 'Time', N: 'Time', V: 'Now', G: null, R: null },
    { I: 'child2', A: 'Text', N: 'Child Title', V: 'Some text', G: null, R: null }
];

vi.mock('dexie-react-hooks', () => ({
    useLiveQuery: (querier: () => any) => {
        // If we want to distinguish, we could try to toString the querier, 
        // but that's fragile.
        // For now, return defaultChildCells. 
        // If the component tries to use this as "currentCard", we ensure it fails gracefully or we mock it better.
        return defaultChildCells;
    }
}));

vi.mock('./cardUtils', () => ({
    cleanupCardCells: vi.fn(),
    createCard: vi.fn(),
    addCellToCard: vi.fn(),
}));

import { cleanupCardCells, addCellToCard } from './cardUtils';

const mockCardCell: Cell = {
    id: '1700000000000-ABCDE',
    attribute: CellAttribute.Card,
    name: 'Test Card',
    value: 'child1 child2',
    geo: null,
    remove: null,
};

describe('Card Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders the card container', () => {
        render(<Card cell={mockCardCell} />);
        expect(screen.getByTestId('card-container')).toBeInTheDocument();
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

        expect(screen.queryByTestId('card-item-list')).not.toBeInTheDocument();

        fireEvent.click(card);
        expect(screen.getByTestId('card-item-list')).toBeInTheDocument();

        const closeBtn = screen.getByTestId('card-close-button');
        fireEvent.click(closeBtn);

        expect(screen.queryByTestId('card-item-list')).not.toBeInTheDocument();
    });

    it('Child Cell の変更を保存すると db.cells.put が呼ばれること', async () => {
        render(<Card cell={mockCardCell} />);
        const card = screen.getByTestId('card-container');
        fireEvent.click(card); // Expand

        // Find the Text cell (Child Title) input
        // Note: TextCell renders 2 inputs (Title, Value).
        // "Child Title" is in Title input.
        const titleInput = screen.getByDisplayValue('Child Title');

        // Change text
        fireEvent.change(titleInput, { target: { value: 'Updated Title' } });
        fireEvent.blur(titleInput);

        expect(mockPut).toHaveBeenCalledWith(expect.objectContaining({
            I: 'child2',
            N: 'Updated Title'
        }));
    });
});
