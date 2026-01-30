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
    onCardUpdate?: (card: Cell) => void;
}

const ESTIMATED_ITEM_HEIGHT = 150; // px
const GAP = 16;
const BUFFER_SIZE = 30; // 30 items before and after
const VISIBLE_COUNT = 30; // Target visible items (approx)
const WINDOW_SIZE = BUFFER_SIZE * 2 + VISIBLE_COUNT; // 90 items

export function CardList({ cards, focusedId, onFocusClear, onFocus, onCardUpdate }: CardListProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const expandedRef = useRef<HTMLDivElement>(null);
    const [scrollTop, setScrollTop] = useState(0);
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const [clampRange, setClampRange] = useState<[number, number] | null>(null);
    const lastStartIndexRef = useRef(0);
    const { viewMode, handleScroll: syncScroll } = useUIState();

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
        const container = e.currentTarget;
        const newTop = container.scrollTop;

        // Sync with UI State (Header/Footer visibility)
        syncScroll(newTop);

        if (expandedCardId && clampRange) {
            const [min, max] = clampRange;
            if (newTop < min) {
                container.scrollTop = min;
                return;
            } else if (newTop > max) {
                container.scrollTop = max;
                return;
            }
        }

        if (expandedCardId) return;

        const newTopIndex = Math.floor(newTop / (ESTIMATED_ITEM_HEIGHT + GAP));
        const newStartItemIndex = Math.max(0, (newTopIndex - BUFFER_SIZE) * cols);

        if (Math.abs(newStartItemIndex - lastStartIndexRef.current) >= cols) {
            lastStartIndexRef.current = newStartItemIndex;
            setScrollTop(newTop);
        }
    };

    // Update clamp range when expanded card changes or resizes
    React.useEffect(() => {
        if (!expandedCardId || !expandedRef.current || !containerRef.current) {
            setClampRange(null);
            return;
        }

        const updateRange = () => {
            if (!expandedRef.current || !containerRef.current) return;
            const container = containerRef.current;
            const el = expandedRef.current;

            const rect = el.getBoundingClientRect();
            const containerRect = container.getBoundingClientRect();

            const currentScroll = container.scrollTop;
            const absoluteTop = rect.top - containerRect.top + currentScroll;
            const absoluteBottom = absoluteTop + rect.height;

            // Clamping range: Align card's top with header bottom (64px) 
            // and card's bottom with footer top (80px from screen bottom)
            const minScroll = absoluteTop - 64;
            const maxScroll = absoluteBottom - containerRect.height + 80;

            // If card is smaller than available viewport, allow minimal movement or lock to top
            if (maxScroll < minScroll) {
                setClampRange([minScroll, minScroll]);
            } else {
                setClampRange([minScroll, maxScroll]);
            }
        };

        const observer = new ResizeObserver(updateRange);
        observer.observe(expandedRef.current);
        updateRange();

        return () => observer.disconnect();
    }, [expandedCardId]);

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

    const rowHeight = ESTIMATED_ITEM_HEIGHT + GAP;
    const topRowIndex = Math.floor(scrollTop / rowHeight);
    const startRowIndex = Math.max(0, topRowIndex - BUFFER_SIZE);
    const startIndex = startRowIndex * cols;
    const endItemIndex = Math.min(count, startIndex + WINDOW_SIZE);
    const visibleCards = cards.slice(startIndex, endItemIndex);

    const paddingTop = startRowIndex * rowHeight;
    const remainingItems = count - endItemIndex;
    const remainingRows = Math.ceil(remainingItems / cols);
    const paddingBottom = remainingRows * rowHeight;

    return (
        <div
            data-testid="card-list-container"
            ref={containerRef}
            onScroll={handleScroll}
            className={cn(
                "h-full w-full overflow-y-auto relative scroll-smooth pt-[64px] pb-[80px]",
                expandedCardId ? "overflow-y-auto" : "overflow-y-auto"
            )}
        >
            <div style={{ height: paddingTop }} />
            <div className={cn(
                "grid gap-4 p-4",
                cols === 1 ? "grid-cols-1" : "grid-cols-2"
            )}>
                {visibleCards.map((card, i) => {
                    const isExpanded = card.id === expandedCardId;

                    return (
                        <div
                            key={card.id}
                            ref={isExpanded ? expandedRef : null}
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
                                onUpdate={onCardUpdate}
                            />
                        </div>
                    );
                })}
            </div>
            <div style={{ height: paddingBottom }} />
        </div>
    );
}
