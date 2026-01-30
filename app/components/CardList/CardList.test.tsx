import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CardList } from './CardList';
import { RarityProvider } from '@/app/contexts/RarityContext';
import { UIStateProvider } from '@/app/contexts/UIStateContext';
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
    }
    const Virtuoso = React.forwardRef((props: VirtuosoProps, ref: React.Ref<any>) => {
        const { data, itemContent, className } = props;

        React.useImperativeHandle(ref, () => ({
            scrollToIndex: mockScrollToIndex,
        }));

        return (
            <div data-testid="virtuoso-container" className={className}>
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
                    <CardList cards={cards} />
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
                    <CardList cards={cards} />
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
                    <CardList cards={cards} onFocus={onFocus} />
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
                    <CardList cards={cards} focusedId={null} />
                </UIStateProvider>
            </RarityProvider>
        );

        // Update focusedId
        rerender(
            <RarityProvider>
                <UIStateProvider>
                    <CardList cards={cards} focusedId={cards[3].id} />
                </UIStateProvider>
            </RarityProvider>
        );

        // check if scrollToIndex was called
        await waitFor(() => {
            // Need to wait for requestAnimationFrame in component? 
            // Currently component uses requestAnimationFrame for expand, but let's see implementation.
            // If the implementation for focusedId change is not yet there, this test will fail as expected (RED).
            // But we actually WANT it to fail first. 
            // However, the test assumes immediate scroll or inside RAF.
            // Let's assume the implementation puts it in an effect, possibly with RAF.
            expect(mockScrollToIndex).toHaveBeenCalledWith(expect.objectContaining({
                index: 3,
                align: 'start',
                behavior: 'smooth'
            }));
        });
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

    it('should NOT scroll when card is collapsed', async () => {
        const cards = createDummyCards(5);

        render(
            <RarityProvider>
                <UIStateProvider>
                    <CardList cards={cards} />
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
});
