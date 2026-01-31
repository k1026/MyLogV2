import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardList } from './CardList';
import { RarityProvider } from '@/app/contexts/RarityContext';
import { UIStateProvider } from '@/app/contexts/UIStateContext';
import { CardSortProvider } from '@/app/contexts/CardSortContext';
import { Cell, CellAttribute } from '@/app/lib/models/cell';
import { vi, describe, it, expect, beforeEach } from 'vitest';

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

// Use vi.hoisted to share the mock function between the mock factory and tests
const { mockScrollToIndex } = vi.hoisted(() => {
    return { mockScrollToIndex: vi.fn() };
});

// Mock react-virtuoso
vi.mock('react-virtuoso', () => {
    const React = require('react');
    interface VirtuosoProps {
        data: any[];
        itemContent: (index: number, data: any) => React.ReactNode;
        className?: string; // Add className to props
        style?: React.CSSProperties;
    }
    const Virtuoso = React.forwardRef((props: VirtuosoProps, ref: React.Ref<any>) => {
        const { data, itemContent, className, style } = props;

        React.useImperativeHandle(ref, () => ({
            scrollToIndex: mockScrollToIndex,
        }));

        return (
            <div data-testid="virtuoso-container" className={className} style={style}>
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
    beforeEach(() => {
        mockScrollToIndex.mockClear();
    });

    it('should render items using Virtuoso', () => {
        const cards = createDummyCards(10);
        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardSortProvider>
                        <CardList cards={cards} />
                    </CardSortProvider>
                </UIStateProvider>
            </RarityProvider>
        );

        // Since we mock Virtuoso to render all items, we expect 10 wrappers in list mode
        const items = screen.getAllByTestId('card-item-wrapper');
        expect(items.length).toBe(10);
    });

    it('should NOT have scroll-smooth class on Virtuoso container', () => {
        const cards = createDummyCards(1);
        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardSortProvider>
                        <CardList cards={cards} />
                    </CardSortProvider>
                </UIStateProvider>
            </RarityProvider>
        );

        const container = screen.getByTestId('virtuoso-container');
        expect(container).not.toHaveClass('scroll-smooth');
    });

    it('should call onFocus when a card is expanded', () => {
        const cards = createDummyCards(5);
        const onFocus = vi.fn();

        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardSortProvider>
                        <CardList cards={cards} onFocus={onFocus} />
                    </CardSortProvider>
                </UIStateProvider>
            </RarityProvider>
        );

        const cardContainers = screen.getAllByTestId('card-container');
        fireEvent.click(cardContainers[0]);
        expect(onFocus).toHaveBeenCalledWith(cards[0].id);
    });

    it('should scroll to index when focusedId prop is provided', async () => {
        const cards = createDummyCards(5);
        const { rerender } = render(
            <RarityProvider>
                <UIStateProvider>
                    <CardSortProvider>
                        <CardList cards={cards} focusedId={null} />
                    </CardSortProvider>
                </UIStateProvider>
            </RarityProvider>
        );

        // Update focusedId
        rerender(
            <RarityProvider>
                <UIStateProvider>
                    <CardSortProvider>
                        <CardList cards={cards} focusedId={cards[3].id} />
                    </CardSortProvider>
                </UIStateProvider>
            </RarityProvider>
        );

        // check if scrollToIndex was called
        await waitFor(() => {
            expect(mockScrollToIndex).toHaveBeenCalledWith(expect.objectContaining({
                index: 3,
                align: 'start',
                behavior: 'smooth'
            }));
        });
    });

    it('should NOT scroll when cards instance changes but focusedId remains the same', async () => {
        const cards = createDummyCards(5);
        const { rerender } = render(
            <RarityProvider>
                <UIStateProvider>
                    <CardSortProvider>
                        <CardList cards={cards} focusedId={cards[2].id} />
                    </CardSortProvider>
                </UIStateProvider>
            </RarityProvider>
        );

        // Initial scroll
        await waitFor(() => {
            expect(mockScrollToIndex).toHaveBeenCalled();
        });
        mockScrollToIndex.mockClear();

        // Rerender with new cards instance (but same data) and same focusedId
        const newCardsInstance = [...cards];
        rerender(
            <RarityProvider>
                <UIStateProvider>
                    <CardSortProvider>
                        <CardList cards={newCardsInstance} focusedId={cards[2].id} />
                    </CardSortProvider>
                </UIStateProvider>
            </RarityProvider>
        );

        // Wait a bit to ensure no scroll happens
        await new Promise(resolve => setTimeout(resolve, 100));
        expect(mockScrollToIndex).not.toHaveBeenCalled();
    });

    it('should call onFocusClear when a card is collapsed', async () => {
        const cards = createDummyCards(5);
        const onFocusClear = vi.fn();

        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardSortProvider>
                        <CardList cards={cards} onFocusClear={onFocusClear} />
                    </CardSortProvider>
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

    it('should NOT scroll when card is collapsed', async () => {
        const cards = createDummyCards(5);

        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardSortProvider>
                        <CardList cards={cards} />
                    </CardSortProvider>
                </UIStateProvider>
            </RarityProvider>
        );

        // Expand first
        const cardContainers = screen.getAllByTestId('card-container');
        fireEvent.click(cardContainers[0]);

        // Reset mock because expand triggers scroll
        mockScrollToIndex.mockClear();

        // Find and click close button
        const closeBtn = screen.getByTestId('card-close-button');
        fireEvent.click(closeBtn);

        await waitFor(() => {
            // Should verify that scrollToIndex was NOT called
            expect(mockScrollToIndex).not.toHaveBeenCalled();
        });
    });

    it('should have scroll-padding based on header and footer visibility', () => {
        const cards = createDummyCards(5);
        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardSortProvider>
                        <CardList cards={cards} />
                    </CardSortProvider>
                </UIStateProvider>
            </RarityProvider>
        );

        const container = screen.getByTestId('virtuoso-container');
        // Default visibility is true for both
        expect(container.style.scrollPaddingTop).toBe('64px');
        expect(container.style.scrollPaddingBottom).toBe('80px');
    });
});
