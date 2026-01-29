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

vi.mock('@/app/contexts/LocationContext', () => ({
    useLocation: () => ({
        location: { latitude: 35.123, longitude: 139.456, altitude: 10 },
        geoString: '35.123 139.456 10',
        status: 'active',
        error: null,
    }),
}));

vi.mock('./cardUtils', () => ({
    cleanupCardCells: vi.fn(),
    createCard: vi.fn(),
    addCellToCard: vi.fn().mockResolvedValue({ id: 'new-cell', attribute: 'Text' }),
}));

import { cleanupCardCells, addCellToCard } from './cardUtils';

const mockCardCell = new Cell({
    id: '1700000000000-ABCDE',
    attribute: CellAttribute.Card,
    name: 'Test Card',
    value: 'child1 child2',
    geo: null,
    remove: null,
});

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

        await waitFor(() => {
            expect(screen.queryByTestId('card-item-list')).not.toBeInTheDocument();
        });
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

    it('closes the card when Escape key is pressed', async () => {
        render(<Card cell={mockCardCell} />);
        const card = screen.getByTestId('card-container');
        fireEvent.click(card); // Expand

        expect(screen.getByTestId('card-item-list')).toBeInTheDocument();

        fireEvent.keyDown(window, { key: 'Escape' });

        await waitFor(() => {
            expect(screen.queryByTestId('card-item-list')).not.toBeInTheDocument();
        });
    });

    it('should NOT close the card on popstate if history management is disabled', async () => {
        render(<Card cell={mockCardCell} />);
        const card = screen.getByTestId('card-container');
        fireEvent.click(card); // Expand

        expect(screen.getByTestId('card-item-list')).toBeInTheDocument();

        // Simulate popstate - it should NOT close the card anymore
        fireEvent(window, new PopStateEvent('popstate'));

        // Wait a bit to ensure it stays open
        await new Promise(r => setTimeout(r, 100));
        expect(screen.getByTestId('card-item-list')).toBeInTheDocument();
    });

    it('should NOT push state to history when expanded', async () => {
        const pushStateSpy = vi.spyOn(window.history, 'pushState');
        render(<Card cell={mockCardCell} />);
        const card = screen.getByTestId('card-container');
        fireEvent.click(card); // Expand

        expect(pushStateSpy).not.toHaveBeenCalled();
        pushStateSpy.mockRestore();
    });

    it('calls addCellToCard when adding a new cell via FAB', async () => {
        render(<Card cell={mockCardCell} />);
        const card = screen.getByTestId('card-container');
        fireEvent.click(card); // Expand

        // Find FAB (it has aria-label="Add")
        const fab = screen.getByLabelText('Add');
        fireEvent.mouseDown(fab);
        fireEvent.mouseUp(fab); // Click to add Text cell

        await waitFor(() => {
            expect(addCellToCard).toHaveBeenCalledWith(
                expect.any(String), // cardId
                CellAttribute.Text, // attribute
                expect.any(Array)   // currentIds
            );
        });
    });

    it('CardFAB rendering position: should be absolute, not fixed', () => {
        render(<Card cell={mockCardCell} />);
        const cardContainer = screen.getByTestId('card-container');
        fireEvent.click(cardContainer); // Expand

        const fabContainer = screen.getByTestId('card-fab-container');

        // 修正前は 'fixed' があるはずだが、修正後は 'absolute' になるべき
        expect(fabContainer).toHaveClass('absolute');
        expect(fabContainer).not.toHaveClass('fixed');
    });
});
