import React, { useRef, useState, useEffect } from 'react';
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

export function CardList({ cards, focusedId, onFocusClear, onFocus, onCardUpdate }: CardListProps) {
    const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
    const { viewMode, handleScroll: syncScroll } = useUIState();
    const containerRef = useRef<HTMLDivElement>(null);

    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        // Pass scroll position to UI context for header/footer visibility
        const scrollTop = (e.currentTarget as HTMLElement).scrollTop;
        syncScroll(scrollTop);
    };

    // Scroll helper
    const scrollToCard = (id: string) => {
        const element = document.getElementById(`card-wrapper-${id}`);
        if (element && containerRef.current) {
            // スムーズスクロールで対象要素までスクロール
            // ヘッダー分のオフセットを考慮する必要がある場合はここで行うが、
            // とりあえずblock: 'start'で呼び出す
            element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    };

    // Sync focusedId prop with internal state and scroll to it
    useEffect(() => {
        if (focusedId) {
            setExpandedCardId(focusedId);
            // Scroll to the item
            requestAnimationFrame(() => {
                scrollToCard(focusedId);
            });
        } else if (focusedId === null && expandedCardId) {
            setExpandedCardId(null);
        }
    }, [focusedId]);

    const handleExpand = (id: string) => {
        setExpandedCardId(id);
        if (onFocus) onFocus(id);
        // Scroll to the item
        requestAnimationFrame(() => {
            scrollToCard(id);
        });
    };

    const handleCollapse = (id: string) => {
        setExpandedCardId(null);
        if (onFocusClear) onFocusClear();
        // Removed forced scroll on collapse to prevent screen jumping
    };

    return (
        <div
            ref={containerRef}
            data-testid="card-list-container"
            className="h-full w-full relative overflow-y-auto scroll-smooth"
            onScroll={handleScroll}
        >
            {/* Header Spacer */}
            <div className="h-[64px] w-full flex-shrink-0" />

            <div className="w-full flex flex-col">
                {cards.map((card) => {
                    const isExpanded = card.id === expandedCardId;

                    return (
                        <div
                            key={card.id}
                            id={`card-wrapper-${card.id}`}
                            data-testid="card-item-wrapper"
                            className={cn(
                                "w-full px-4 mb-4 transition-all duration-500",
                                isExpanded ? "z-50" : "z-0"
                            )}
                        >
                            <Card
                                cell={card}
                                externalExpanded={isExpanded}
                                onUpdate={onCardUpdate}
                                onExpand={() => handleExpand(card.id)}
                                onCollapse={() => handleCollapse(card.id)}
                            />
                        </div>
                    );
                })}
            </div>

            {/* Footer Spacer */}
            <div className="h-[80px] w-full flex-shrink-0" />
        </div>
    );
}
