import { useState, useEffect, useRef } from 'react';
import { Cell, CellAttribute } from '@/app/lib/models/cell';
import { CellRepository } from '@/app/lib/db/operations';
import { SortOrder } from '../contexts/UIStateContext';

export interface UseCardListResult {
    cards: Cell[];
    subCellMap: Map<string, Cell>;
    isLoading: boolean;
    isSorting: boolean;
    totalCount: number;
    addCard: (card: Cell) => void;
    updateCard: (card: Cell) => void;
}

const BATCH_SIZE = 1000;

export function useCardList(sortOrder: SortOrder = 'desc'): UseCardListResult {
    const [cards, setCards] = useState<Cell[]>([]);
    const [subCellMap, setSubCellMap] = useState<Map<string, Cell>>(new Map());
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

        const loadData = async () => {
            setIsLoading(true);
            try {
                // Initial load: fetch everything to build subCellMap and extract cards
                // Note: If performance becomes an issue, we can optimize later, 
                // but for filtering we need all data in memory.
                const allCells = await CellRepository.getAll();
                if (!isMounted.current) return;

                const newSubCellMap = new Map<string, Cell>();
                const newCards: Cell[] = [];

                allCells.forEach(cell => {
                    newSubCellMap.set(cell.id, cell);
                    if (cell.attribute === CellAttribute.Card) {
                        newCards.push(cell);
                    }
                });

                setSubCellMap(newSubCellMap);
                setCards(newCards); // Already sorted by ID descending from getAll()
                setTotalCount(newCards.length);
                setIsLoading(false);

            } catch (error) {
                console.error("Failed to load cards", error);
                if (isMounted.current) setIsLoading(false);
            }
        };

        loadData();

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
        setSubCellMap(prev => {
            const next = new Map(prev);
            next.set(card.id, card);
            return next;
        });
        setTotalCount(prev => prev + 1);
    };

    const updateCard = (updatedCard: Cell) => {
        setCards(prev => prev.map(c => c.id === updatedCard.id ? updatedCard : c));
        setSubCellMap(prev => {
            const next = new Map(prev);
            next.set(updatedCard.id, updatedCard);
            return next;
        });
    };

    return {
        cards,
        subCellMap,
        isLoading,
        isSorting,
        totalCount,
        addCard,
        updateCard
    };
}
