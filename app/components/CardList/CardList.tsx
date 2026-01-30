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

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        // Pass scroll position to UI context for header/footer visibility
        const scrollTop = (e.target as HTMLElement).scrollTop;
        syncScroll(scrollTop);
    };

    // --- Data Preparation ---
    // List: 1 item per row.
    const rows = useMemo(() => {
        return cards.map(c => [c]);
    }, [cards]);

    // Helper to find row index for a given card ID
    const getRowIndexForCard = (id: string) => {
        return rows.findIndex(row => row.some(c => c.id === id));
    };

    // Sync focusedId prop with internal state and scroll to it
    useEffect(() => {
        if (focusedId) {
            setExpandedCardId(focusedId);
            // Scroll to the item
            const index = getRowIndexForCard(focusedId);
            if (index !== -1) {
                requestAnimationFrame(() => {
                    virtuosoRef.current?.scrollToIndex({ index, align: 'start', behavior: 'smooth' });
                });
            }
        } else if (focusedId === null && expandedCardId) {
            setExpandedCardId(null);
        }
    }, [focusedId, rows]); // Correct dependency order now

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
        // Removed forced scroll on collapse to prevent screen jumping
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
                // removed scroll-smooth to prevent conflict with virtuoso scrolling
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
