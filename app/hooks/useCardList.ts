import { useState, useEffect, useRef } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { CellRepository } from '@/app/lib/db/operations';
import { SortOrder } from '../contexts/UIStateContext';

export interface UseCardListResult {
    cards: Cell[];
    isLoading: boolean;
    isSorting: boolean;
    totalCount: number;
    addCard: (card: Cell) => void;
}

const BATCH_SIZE = 1000;

export function useCardList(sortOrder: SortOrder = 'desc'): UseCardListResult {
    const [cards, setCards] = useState<Cell[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSorting, setIsSorting] = useState(false);
    const [totalCount, setTotalCount] = useState(0);
    // Use ref to track mounted state to prevent state updates on unmounted component
    const isMounted = useRef(true);
    const sortOrderRef = useRef(sortOrder);

    useEffect(() => {
        sortOrderRef.current = sortOrder;
    }, [sortOrder]);

    useEffect(() => {
        isMounted.current = true;

        const loadCards = async () => {
            setIsLoading(true);
            try {
                // Initial load
                const initialBatch = await CellRepository.getCards(0, BATCH_SIZE);
                if (!isMounted.current) return;

                setCards(initialBatch);
                setIsLoading(false); // UI visible after first batch

                const count = await CellRepository.getCardCount();
                if (!isMounted.current) return;
                setTotalCount(count);

                // Background load
                let currentOffset = BATCH_SIZE;
                // Continue loading if we have more cards
                while (currentOffset < count) {
                    const nextBatch = await CellRepository.getCards(currentOffset, BATCH_SIZE);
                    if (!isMounted.current) return;

                    if (nextBatch.length === 0) break;

                    setCards(prev => {
                        const next = [...prev, ...nextBatch];
                        return next.sort((a, b) => {
                            if (sortOrderRef.current === 'desc') {
                                return b.id.localeCompare(a.id);
                            } else {
                                return a.id.localeCompare(b.id);
                            }
                        });
                    });
                    currentOffset += BATCH_SIZE;

                    // Small delay to yield to main thread
                    await new Promise(resolve => setTimeout(resolve, 10));
                }

            } catch (error) {
                console.error("Failed to load cards", error);
                if (isMounted.current) setIsLoading(false);
            }
        };

        loadCards();

        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        if (cards.length === 0) return;

        setIsSorting(true);
        // Instant memory sort
        setCards(prev => {
            const sorted = [...prev].sort((a, b) => {
                if (sortOrderRef.current === 'desc') {
                    return b.id.localeCompare(a.id);
                } else {
                    return a.id.localeCompare(b.id);
                }
            });
            return sorted;
        });
        setIsSorting(false);
    }, [sortOrder]);

    const addCard = (card: Cell) => {
        setCards(prev => {
            const next = [card, ...prev];
            // Re-sort to maintain order
            return next.sort((a, b) => {
                if (sortOrderRef.current === 'desc') {
                    return b.id.localeCompare(a.id);
                } else {
                    return a.id.localeCompare(b.id);
                }
            });
        });
        setTotalCount(prev => prev + 1);
    };

    return {
        cards,
        isLoading,
        isSorting,
        totalCount,
        addCard
    };
}
