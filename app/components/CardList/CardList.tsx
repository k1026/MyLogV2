import React, { useRef, useState } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { Card } from '../card/Card';
import { cn } from '@/app/lib/utils';
import { useUIState } from '@/app/contexts/UIStateContext';

interface CardListProps {
    cards: Cell[];
    focusedId?: string | null;
    onFocusClear?: () => void;
    onFocus?: (id: string) => void;
}

const ESTIMATED_ITEM_HEIGHT = 150; // px
const GAP = 16;
const BUFFER_SIZE = 30; // 30 items before and after
const VISIBLE_COUNT = 30; // Target visible items (approx)
const WINDOW_SIZE = BUFFER_SIZE * 2 + VISIBLE_COUNT; // 90 items

export function CardList({ cards, focusedId, onFocusClear, onFocus }: CardListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const lastStartIndexRef = useRef(0);
    const { viewMode } = useUIState();

    const cols = viewMode === 'list' ? 1 : 2;

    // Sync focusedId prop with internal state
    React.useEffect(() => {
        if (focusedId) {
            setExpandedCardId(focusedId);
        } else if (focusedId === null && expandedCardId) {
            setExpandedCardId(null);
        }
    }, [focusedId]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (expandedCardId) return;

        const newTop = e.currentTarget.scrollTop;
        const newTopIndex = Math.floor(newTop / (ESTIMATED_ITEM_HEIGHT + GAP));
        const newStartItemIndex = Math.max(0, (newTopIndex - BUFFER_SIZE) * cols);

        if (Math.abs(newStartItemIndex - lastStartIndexRef.current) >= cols) {
            lastStartIndexRef.current = newStartItemIndex;
            setScrollTop(newTop);
        }
    };

    const handleExpand = (id: string, index: number) => {
        setExpandedCardId(id);
        if (onFocus) onFocus(id);
        if (containerRef.current) {
            // Adjust scroll position to align card top with screen top
            const rowIndex = Math.floor(index / cols);
            const targetScrollTop = rowIndex * (ESTIMATED_ITEM_HEIGHT + GAP);
            if (containerRef.current.scrollTo) {
                containerRef.current.scrollTo({
                    top: targetScrollTop,
                    behavior: 'smooth'
                });
            }
        }
    };

    const handleCollapse = () => {
        setExpandedCardId(null);
        if (onFocusClear) onFocusClear();
    };

    const count = cards.length;

    let visibleCards: Cell[] = [];
    let paddingTop = 0;
    let paddingBottom = 0;
    let startIndex = 0;

    if (expandedCardId) {
        const targetCard = cards.find(c => c.id === expandedCardId);
        visibleCards = targetCard ? [targetCard] : [];
        paddingTop = 0;
        paddingBottom = 0;
    } else {
        const rowHeight = ESTIMATED_ITEM_HEIGHT + GAP;
        const topRowIndex = Math.floor(scrollTop / rowHeight);
        const startRowIndex = Math.max(0, topRowIndex - BUFFER_SIZE);
        startIndex = startRowIndex * cols;
        const endItemIndex = Math.min(count, startIndex + WINDOW_SIZE);
        visibleCards = cards.slice(startIndex, endItemIndex);

        paddingTop = startRowIndex * rowHeight;
        const remainingItems = count - endItemIndex;
        const remainingRows = Math.ceil(remainingItems / cols);
        paddingBottom = remainingRows * rowHeight;
    }

    return (
        <div
            data-testid="card-list-container"
            ref={containerRef}
            onScroll={handleScroll}
            className={cn(
                "h-full w-full overflow-y-auto relative scroll-smooth",
                expandedCardId ? "overflow-y-auto" : "overflow-y-auto"
            )}
        >
            <div style={{ height: expandedCardId ? 0 : paddingTop }} />
            <div className={cn(
                "grid gap-4 p-4",
                cols === 1 ? "grid-cols-1" : "grid-cols-2"
            )}>
                {visibleCards.map((card, i) => {
                    const isExpanded = card.id === expandedCardId;
                    const shouldHide = expandedCardId !== null && !isExpanded;

                    if (shouldHide) return null;

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
                                onExpand={() => handleExpand(card.id, startIndex + i)}
                                onCollapse={handleCollapse}
                                externalExpanded={isExpanded}
                            />
                        </div>
                    );
                })}
            </div>
            <div style={{ height: expandedCardId ? 0 : paddingBottom }} />
        </div>
    );
}
