import React, { useRef, useState } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { Card } from '../card/Card';
import { cn } from '@/app/lib/utils';

interface CardListProps {
    cards: Cell[];
    focusedId?: string | null;
    onFocusClear?: () => void;
}

const ESTIMATED_ITEM_HEIGHT = 150; // px
const BUFFER_SIZE = 30; // 30 items before and after
const VISIBLE_COUNT = 30; // Target visible items (approx)
const WINDOW_SIZE = BUFFER_SIZE * 2 + VISIBLE_COUNT; // 90 items

export function CardList({ cards, focusedId, onFocusClear }: CardListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const lastStartIndexRef = useRef(0);

    // Sync focusedId prop with internal state
    React.useEffect(() => {
        if (focusedId) {
            setExpandedCardId(focusedId);
        } else if (focusedId === null && expandedCardId) {
            // If prop cleared, clear internal? 
            // Logic: Header Reset -> clears focusedId -> CardList should collapse?
            // Yes.
            setExpandedCardId(null);
        }
    }, [focusedId]);

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        if (expandedCardId) return;

        const newTop = e.currentTarget.scrollTop;
        const newTopIndex = Math.floor(newTop / ESTIMATED_ITEM_HEIGHT);
        const newStartIndex = Math.max(0, newTopIndex - BUFFER_SIZE);

        if (newStartIndex !== lastStartIndexRef.current) {
            lastStartIndexRef.current = newStartIndex;
            setScrollTop(newTop);
        }
    };

    const handleExpand = (id: string, index: number) => {
        setExpandedCardId(id);
        if (containerRef.current) {
            // spec 7.4: Adjust scroll position to align card top with screen top
            const targetScrollTop = index * (ESTIMATED_ITEM_HEIGHT + 16); // 16 is gap
            containerRef.current.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
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
    let startIndex = 0; // Needed for expand handler

    if (expandedCardId) {
        // If expanded, show ONLY that card, wherever it is
        const targetCard = cards.find(c => c.id === expandedCardId);
        visibleCards = targetCard ? [targetCard] : [];
        // Padding is 0 because we hide everything else?
        // Or we should keep layout? Current implementation hides others (return null).
        // So visually list becomes 1 item.
        // Padding usually pushes it down, but if we filter the array, it's index 0.
        // We probably want to remove padding so it's top of screen.
        paddingTop = 0;
        paddingBottom = 0;
    } else {
        const topIndex = Math.floor(scrollTop / ESTIMATED_ITEM_HEIGHT);
        startIndex = Math.max(0, topIndex - BUFFER_SIZE);
        const endIndex = Math.min(count, startIndex + WINDOW_SIZE);
        visibleCards = cards.slice(startIndex, endIndex);
        paddingTop = startIndex * (ESTIMATED_ITEM_HEIGHT + 16);
        paddingBottom = (count - endIndex) * (ESTIMATED_ITEM_HEIGHT + 16);
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
            <div className="flex flex-col gap-4 p-4">
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
