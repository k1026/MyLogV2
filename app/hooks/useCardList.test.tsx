import { renderHook, act } from '@testing-library/react';
import { useCardList } from './useCardList';
import { Cell, CellAttribute } from '@/app/lib/models/cell';
import { vi, describe, it, expect } from 'vitest';

// Mock db operations
vi.mock('@/app/lib/db/operations', () => ({
    CellRepository: {
        getAll: vi.fn().mockResolvedValue([])
    }
}));

describe('useCardList', () => {
    it('should allow updating a card in the list', async () => {
        const { result } = renderHook(() => useCardList());

        // Wait for load
        await act(async () => {
            await new Promise(resolve => setTimeout(resolve, 0));
        });

        // Add a card manually
        const card = new Cell({ id: '1', attribute: CellAttribute.Card, value: 'Original' });
        act(() => {
            result.current.addCard(card);
        });

        expect(result.current.cards[0].value).toBe('Original');

        // Update the card
        const updatedCard = new Cell({ id: '1', attribute: CellAttribute.Card, value: 'Updated' });

        act(() => {
            result.current.updateCard(updatedCard);
        });

        expect(result.current.cards[0].value).toBe('Updated');
    });
});
