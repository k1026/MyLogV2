import { renderHook, waitFor } from '@testing-library/react';
import { useCardList } from './useCardList';
import { CellRepository } from '@/app/lib/db/operations';
import { Cell, CellAttribute } from '@/app/lib/models/cell';
import { vi, describe, it, expect, beforeEach, Mock } from 'vitest';

// Helper to create mock cells
const createMockCard = (id: string, timestamp: string): Cell => ({
    id,
    attribute: 'Card' as CellAttribute,
    name: 'Test Card',
    value: timestamp,
    geo: null,
    remove: null,
});

// Mock CellRepository
vi.mock('@/app/lib/db/operations', () => ({
    CellRepository: {
        getCards: vi.fn(),
        getCardCount: vi.fn(),
    },
}));

describe('useCardList', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should load initial batch of cards', async () => {
        const mockCards = Array.from({ length: 1000 }, (_, i) =>
            createMockCard(`card-${i}`, new Date().toISOString())
        );
        (CellRepository.getCards as Mock).mockResolvedValue(mockCards);
        // Set count to 1000 so background loading loop doesn't trigger
        (CellRepository.getCardCount as Mock).mockResolvedValue(1000);

        const { result } = renderHook(() => useCardList());

        // Initially empty
        expect(result.current.cards).toEqual([]);

        // Wait for initial load
        await waitFor(() => {
            expect(result.current.cards.length).toBe(1000);
            expect(result.current.isLoading).toBe(false);
        });
    });

    it('should load remaining cards in background', async () => {
        const initialCards = Array.from({ length: 1000 }, (_, i) =>
            createMockCard(`card-${i}`, new Date().toISOString())
        );
        const remainingCards = Array.from({ length: 500 }, (_, i) =>
            createMockCard(`card-${1000 + i}`, new Date().toISOString())
        );

        (CellRepository.getCards as Mock)
            .mockResolvedValueOnce(initialCards) // Initial load
            .mockImplementationOnce(async () => {
                // Add delay to ensure we can catch the intermediate state
                await new Promise(resolve => setTimeout(resolve, 100));
                return remainingCards;
            })
            .mockResolvedValue([]); // No more

        (CellRepository.getCardCount as Mock).mockResolvedValue(1500);

        const { result } = renderHook(() => useCardList());

        // Initial load check
        await waitFor(() => {
            expect(result.current.cards.length).toBe(1000);
        });

        // Background load check
        await waitFor(() => {
            expect(result.current.cards.length).toBe(1500);
        }, { timeout: 3000 });
    });
});
