import { renderHook, waitFor } from '@testing-library/react';
import { useCardList } from './useCardList';
import { CellRepository } from '@/lib/db/operations';
import { Cell, CellAttribute } from '@/lib/models/cell';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

// Helper to create mock cells
const createMockCard = (id: string, timestamp: string): Cell => new Cell({
    id,
    attribute: 'Card' as CellAttribute,
    name: 'Test Card',
    value: timestamp,
    geo: null,
    remove: null,
});

// Mock CellRepository
vi.mock('@/lib/db/operations', () => ({
    CellRepository: {
        getAll: vi.fn(),
    },
}));

describe('useCardList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load cards and build subCellMap', async () => {
        const mockCards = Array.from({ length: 5 }, (_, i) =>
            createMockCard(`card-${i}`, new Date().toISOString())
        );
        (CellRepository.getAll as Mock).mockResolvedValue(mockCards);

        const { result } = renderHook(() => useCardList());

        // Initially empty
        expect(result.current.cards).toEqual([]);

        // Wait for load
        await waitFor(() => {
            expect(result.current.cards.length).toBe(5);
            expect(result.current.subCellMap.size).toBe(5);
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('should add a card when addCard is called', async () => {
        const { result } = renderHook(() => useCardList());

        // Wait for initial load
        await waitFor(() => expect(result.current.isLoading).toBe(false));
        const initialCount = result.current.cards.length;
        const initialTotal = result.current.totalCount;

        const newCard = new Cell({
            id: 'new-card-id',
            attribute: CellAttribute.Card,
            name: 'New Card',
            value: '',
            geo: null,
            remove: null
        });

        const { act } = await import('@testing-library/react');
        await act(async () => {
            result.current.addCard(newCard);
        });

        expect(result.current.cards.length).toBe(initialCount + 1);
        expect(result.current.cards[0]).toEqual(newCard); // Spec 7.6: Insert at proper position (newest first by default)
        expect(result.current.totalCount).toBe(initialTotal + 1);
    });

    it('should refresh data when refresh is called', async () => {
        const mockCards1 = [createMockCard('card-1', 'time-1')];
        const mockCards2 = [createMockCard('card-1', 'time-1'), createMockCard('card-2', 'time-2')];

        (CellRepository.getAll as Mock).mockResolvedValueOnce(mockCards1).mockResolvedValueOnce(mockCards2);

        const { result } = renderHook(() => useCardList());

        // Initial load
        await waitFor(() => expect(result.current.cards.length).toBe(1));

        const { act } = await import('@testing-library/react');
        await act(async () => {
            await result.current.refresh();
        });

        await waitFor(() => {
            expect(result.current.cards.length).toBe(2);
            expect(CellRepository.getAll).toHaveBeenCalledTimes(2);
        });
    });
});
