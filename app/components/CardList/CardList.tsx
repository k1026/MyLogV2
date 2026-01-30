import React, { useRef, useState, useMemo, useEffect } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { Card } from '../card/Card';
import { cn } from '@/app/lib/utils';
import { useUIState } from '@/app/contexts/UIStateContext';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

interface CardListProps {
    cards: Cell[];
    focusedId?: string | null;
    onFocusClear?: () => void;
    onFocus?: (id: string) => void;
    onCardUpdate?: (card: Cell) => void;
}

export function CardList({ cards, focusedId, onFocusClear, onFocus, onCardUpdate }: CardListProps) {
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const { viewMode, handleScroll: syncScroll } = useUIState();
    const virtuosoRef = useRef<VirtuosoHandle>(null);

    // Sync focusedId prop with internal state
    useEffect(() => {
        if (focusedId) {
            setExpandedCardId(focusedId);
        } else if (focusedId === null && expandedCardId) {
            setExpandedCardId(null);
        }
    }, [focusedId]);

    const handleExpand = (id: string, index: number) => {
        setExpandedCardId(id);
        if (onFocus) onFocus(id);
        // Scroll to the item
        requestAnimationFrame(() => {
            virtuosoRef.current?.scrollToIndex({ index, align: 'start', behavior: 'smooth' });
        });
    };

    const handleCollapse = (id: string, index: number) => {
        setExpandedCardId(null);
        if (onFocusClear) onFocusClear();
        // Scroll to the item to prevent getting lost
        requestAnimationFrame(() => {
            virtuosoRef.current?.scrollToIndex({ index, align: 'start', behavior: 'smooth' });
        });
    };

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        // Pass scroll position to UI context for header/footer visibility
        const scrollTop = (e.target as HTMLElement).scrollTop;
        syncScroll(scrollTop);
    };

    // --- Data Preparation ---

    // For Grid View, we pair items: [ [card1, card2], [card3, card4], ... ]
    // For List View, it's just [card1, card2, ...]
    // But to unify the Virtuoso usage (and handle variable height rows in grid),
    // we can treat everything as "rows".
    // List: 1 item per row. Grid: 2 items per row.

    const rows = useMemo(() => {
        return cards.map(c => [c]);
    }, [cards]);

    // Helper to find row index for a given card ID
    const getRowIndexForCard = (id: string) => {
        return rows.findIndex(row => row.some(c => c.id === id));
    };

    return (
        <div
            data-testid="card-list-container"
            className="h-full w-full relative"
        >
            <Virtuoso
                ref={virtuosoRef}
                data={rows}
                style={{ height: '100%' }}
                className="scroll-smooth"
                onScroll={handleScroll}
                components={{
                    Header: () => <div className="h-[64px]" />,
                    Footer: () => <div className="h-[80px]" />,
                }}
                itemContent={(rowIndex, rowItems) => {
                    return (
                        <div className="w-full px-4 mb-4 flex flex-col">
                            {rowItems.map((card) => {
                                const isExpanded = card.id === expandedCardId;

                                return (
                                    <div
                                        key={card.id}
                                        data-testid="card-item-wrapper"
                                        className={cn(
                                            "transition-all duration-500",
                                            isExpanded ? "z-50" : "z-0"
                                        )}
                                    // Ensure expanded card takes full width in grid if needed?
                                    // Spec says "Grid mode... 2 columns". 
                                    // If a card expands in grid mode, does it push others?
                                    // Current CSS suggests it's just a card in a grid cell.
                                    // If it becomes huge, it just makes the row tall.
                                    >
                                        <Card
                                            cell={card}
                                            externalExpanded={isExpanded}
                                            onUpdate={onCardUpdate}
                                            onExpand={() => handleExpand(card.id, rowIndex)}
                                            onCollapse={() => handleCollapse(card.id, rowIndex)}
                                        />
                                    </div>
                                );
                            })}
                        </div>
                    );
                }}
            />
        </div>
    );
}
