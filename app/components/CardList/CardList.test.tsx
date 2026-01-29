import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardList } from './CardList';
import { RarityProvider } from '@/app/contexts/RarityContext';
import { UIStateProvider } from '@/app/contexts/UIStateContext';
import { Cell, CellAttribute } from '@/app/lib/models/cell';
import { vi, describe, it, expect } from 'vitest';

vi.mock('@/app/contexts/LocationContext', () => ({
    useLocation: () => ({
        location: null,
        geoString: null,
        status: 'idle',
        error: null,
    }),
}));


vi.mock('dexie-react-hooks', () => ({
    useLiveQuery: (querier: () => any) => {
        return [];
    },
}));

vi.mock('@/app/lib/db/db', () => ({
    db: {
        cells: {
            get: vi.fn(),
            bulkGet: vi.fn().mockResolvedValue([]),
        }
    }
}));

const createDummyCards = (count: number): Cell[] =>
    Array.from({ length: count }, (_, i) => new Cell({
        id: `card-${i}`,
        attribute: 'Card' as CellAttribute,
        name: `Card ${i}`,
        value: new Date().toISOString(),
        geo: null,
        remove: null,
    }));

describe('CardList Virtual Scroll', () => {
    it('should render only a subset of cards (90 limit)', () => {
        const cards = createDummyCards(200);
        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardList cards={cards} />
                </UIStateProvider>
            </RarityProvider>
        );

        const items = screen.queryAllByTestId('card-item-wrapper');

        // Assertions for Virtual Scroll
        expect(items.length).toBeGreaterThan(0);
        expect(items.length).toBeLessThanOrEqual(90);
    });

    it('should call onFocus when a card is expanded', () => {
        const cards = createDummyCards(5);
        const onFocus = vi.fn();


        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardList cards={cards} onFocus={onFocus} />
                </UIStateProvider>
            </RarityProvider>
        );

        const cardContainers = screen.getAllByTestId('card-container');
        fireEvent.click(cardContainers[0]);
        expect(onFocus).toHaveBeenCalledWith(cards[0].id);
    });

    it('should call onFocusClear when a card is collapsed', async () => {
        const cards = createDummyCards(5);
        const onFocusClear = vi.fn();

        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardList cards={cards} onFocusClear={onFocusClear} />
                </UIStateProvider>
            </RarityProvider>
        );

        // Expand first
        const cardContainers = screen.getAllByTestId('card-container');
        fireEvent.click(cardContainers[0]);

        // Find and click close button
        const closeBtn = screen.getByTestId('card-close-button');
        fireEvent.click(closeBtn);

        await waitFor(() => {
            expect(onFocusClear).toHaveBeenCalled();
        });
    });

    it('should maintain other cards in DOM when a card is expanded', () => {
        const cards = createDummyCards(10);
        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardList cards={cards} />
                </UIStateProvider>
            </RarityProvider>
        );

        const cardContainers = screen.getAllByTestId('card-container');
        fireEvent.click(cardContainers[0]);

        const wrappers = screen.getAllByTestId('card-item-wrapper');
        expect(wrappers.length).toBeGreaterThan(1);
    });
});
