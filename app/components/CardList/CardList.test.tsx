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

// Mock react-virtuoso
vi.mock('react-virtuoso', () => {
    const React = require('react');
    interface VirtuosoProps {
        data: any[];
        itemContent: (index: number, data: any) => React.ReactNode;
    }
    const Virtuoso = React.forwardRef((props: VirtuosoProps, ref: React.Ref<any>) => {
        const { data, itemContent } = props;

        React.useImperativeHandle(ref, () => ({
            scrollToIndex: vi.fn(),
        }));

        return (
            <div data-testid="virtuoso-container">
                {data.map((item: any, index: number) => {
                    return (
                        <div key={index} data-testid="virtuoso-item">
                            {itemContent(index, item)}
                        </div>
                    );
                })}
            </div>
        );
    });
    return { Virtuoso: Virtuoso };
});

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
    it('should render items using Virtuoso', () => {
        const cards = createDummyCards(10);
        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardList cards={cards} />
                </UIStateProvider>
            </RarityProvider>
        );

        // Since we mock Virtuoso to render all items, we expect 10 wrappers in list mode
        const items = screen.getAllByTestId('card-item-wrapper');
        expect(items.length).toBe(10);
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

    it('should maintain other cards in DOM when a card is expanded (due to mock rendering all)', () => {
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
        expect(wrappers.length).toBe(10); // Mock renders all
    });
});
