import { render, screen, fireEvent } from '@testing-library/react';
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

const createDummyCards = (count: number): Cell[] =>
    Array.from({ length: count }, (_, i) => ({
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
        // In empty implementation this will fail because items.length is 0
        // Correct implementation should render ~30-90 items
        expect(items.length).toBeGreaterThan(0);
        expect(items.length).toBeLessThanOrEqual(90);

        // Also verify that the container is scrollable (has height)
        // This is tricky in JSDOM, we usually check if spacer elements exist
    });
});
