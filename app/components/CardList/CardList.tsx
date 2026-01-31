import React, { useRef, useState, useEffect, useMemo } from 'react';
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
    const { viewMode, handleScroll: syncScroll, headerVisible, footerVisible } = useUIState();
    const virtuosoRef = useRef<VirtuosoHandle>(null);
    const lastScrolledId = useRef<string | null>(null);

    // Virtuoso handles scroll events
    const handleScroll = (e: React.UIEvent<HTMLElement>) => {
        const scrollTop = (e.currentTarget as HTMLElement).scrollTop;
        syncScroll(scrollTop);
    };

    // Scroll helper using Virtuoso
    const scrollToCard = (id: string) => {
        const index = cards.findIndex(c => c.id === id);
        if (index !== -1 && virtuosoRef.current) {
            virtuosoRef.current.scrollToIndex({
                index,
                align: 'start',
                behavior: 'smooth'
            });
        }
    };

    // Sync focusedId prop with internal state and scroll to it
    useEffect(() => {
        if (focusedId) {
            setExpandedCardId(focusedId);
            // Scroll to the item only if focusedId has changed
            if (focusedId !== lastScrolledId.current) {
                lastScrolledId.current = focusedId;
                requestAnimationFrame(() => {
                    scrollToCard(focusedId);
                });
            }
        } else if (focusedId === null && expandedCardId) {
            setExpandedCardId(null);
            lastScrolledId.current = null;
        }
    }, [focusedId, cards]); // cards dependency is still needed for scrollToCard index lookup

    const handleExpand = (id: string) => {
        setExpandedCardId(id);
        if (onFocus) onFocus(id);
        lastScrolledId.current = id;
        // Scroll to the item
        requestAnimationFrame(() => {
            scrollToCard(id);
        });
    };

    const handleCollapse = (id: string) => {
        setExpandedCardId(null);
        if (onFocusClear) onFocusClear();
        // No forced scroll on collapse
    };

    // Header and Footer components for Virtuoso
    const Header = useMemo(() => () => <div className="h-[64px] w-full flex-shrink-0" />, []);
    const Footer = useMemo(() => () => <div className="h-[80px] w-full flex-shrink-0" />, []);

    return (
        <Virtuoso
            ref={virtuosoRef}
            data={cards}
            data-testid="virtuoso-container"
            className="h-full w-full"
            style={{
                scrollPaddingTop: headerVisible ? '64px' : '0px',
                scrollPaddingBottom: footerVisible ? '80px' : '0px',
            }}
            onScroll={handleScroll}
            components={{
                Header: Header,
                Footer: Footer
            }}
            itemContent={(index, card) => {
                const isExpanded = card.id === expandedCardId;
                return (
                    <div
                        id={`card-wrapper-${card.id}`}
                        data-testid="card-item-wrapper"
                        className={cn(
                            "w-full px-4 mb-4 transition-all duration-500",
                            isExpanded ? "z-50 relative" : "z-0"
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
            }}
        />
    );
}
