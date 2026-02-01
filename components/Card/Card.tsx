import React from 'react';
import { Cell, CellAttribute } from '@/lib/models/cell';
import { useRarity } from '@/contexts/RarityContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, CellDB } from '@/lib/db/db';
import { useCardSort } from './useCardSort';
import { CardHeader } from './CardHeader';
import { CardContent } from './CardContent';
import { getRarityStyle } from '@/lib/rarity/RarityColor';
import { cleanupCardCells, addCellToCard } from './cardUtils';
import { useCellTitleEstimation } from '@/hooks/useCellTitleEstimation';
import { useFilter } from '@/contexts/FilterContext';
import { useUIState } from '@/contexts/UIStateContext';

interface CardProps {
    cell: Cell;
    onUpdate?: (cell: Cell) => void;
    onExpand?: () => void;
    onCollapse?: () => void;
    defaultExpanded?: boolean;
    externalExpanded?: boolean;
}

export const Card: React.FC<CardProps> = ({
    cell,
    onUpdate,
    onExpand,
    onCollapse,
    defaultExpanded = false,
    externalExpanded // New prop
}) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
    const { filterSettings } = useFilter();
    const { viewMode, footerVisible } = useUIState();
    const highlightKeywords = filterSettings.keywords.include;

    // Sync with external control if provided
    React.useEffect(() => {
        if (externalExpanded !== undefined) {
            setIsExpanded(externalExpanded);
        }
    }, [externalExpanded]);
    const { rarityData } = useRarity();

    // Fetch latest card data from DB to ensure we have up-to-date value (list of children)
    const currentCard = useLiveQuery(() => db.cells.get(cell.id), [cell.id]);
    const cardValue = currentCard?.V ?? cell.value;

    // Fetch child cells for title and list
    const childCells = useLiveQuery(async () => {
        if (!cardValue) return [];
        const ids = cardValue.split(' ').filter(id => id.trim() !== '');
        const cells = await db.cells.bulkGet(ids);
        return cells.filter((c): c is CellDB => c !== undefined && c.R === null);
    }, [cardValue]);

    // Sorting Logic
    const sortState = useCardSort(childCells);

    // Determine title: First non-Time cell
    const titleCell = childCells?.find(c => c.A !== CellAttribute.Time);
    const displayTitle = titleCell?.N || cell.name || '';

    // Rarity Calculation
    const rarityAvg = React.useMemo(() => {
        if (!childCells || childCells.length === 0) return 1.0;
        const validCells = childCells.filter(c => c.A !== CellAttribute.Time);
        if (validCells.length === 0) return 1.0;

        const sum = validCells.reduce((acc, c) => acc + (rarityData.get(c.N) ?? 1.0), 0);
        return sum / validCells.length;
    }, [childCells, rarityData]);

    const rarityStyle = getRarityStyle(rarityAvg);

    // Parse timestamp from ID
    const timestampStr = cell.id.split('-')[0];
    const timestamp = parseInt(timestampStr, 10);
    const date = new Date(timestamp);
    const formattedDate = isNaN(timestamp) ? '' : date.toLocaleString();

    const [lastAddedId, setLastAddedId] = React.useState<string | null>(null);
    const closeCard = React.useCallback(() => {
        setIsExpanded(false);
        cleanupCardCells(cell);
        setLastAddedId(null);
        onCollapse?.();
    }, [cell, onCollapse]);

    const handleToggle = React.useCallback(() => {
        if (isExpanded) {
            closeCard();
        } else {
            setIsExpanded(true);
            onExpand?.();
        }
    }, [isExpanded, closeCard, onExpand]);

    // Escキーの処理 (履歴操作は削除)
    React.useEffect(() => {
        if (!isExpanded) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleToggle();
            }
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [isExpanded, handleToggle]);

    const handleAddCell = React.useCallback(async (attribute: CellAttribute) => {
        const currentIds = sortState.sortedCells.map(c => c.I);
        const newCell = await addCellToCard(cell.id, attribute, currentIds);
        setLastAddedId(newCell.id);
    }, [cell.id, sortState.sortedCells]);

    const { learn } = useCellTitleEstimation();

    const handleCellSave = async (updatedCell: Cell) => {
        const cellDB: CellDB = {
            I: updatedCell.id,
            A: updatedCell.attribute,
            N: updatedCell.name,
            V: updatedCell.value,
            G: updatedCell.geo,
            R: updatedCell.remove
        };
        await db.cells.put(cellDB);
        if (onUpdate) onUpdate(updatedCell);

        learn(updatedCell);
    };

    const cellModels = React.useMemo(() => {
        return sortState.sortedCells.map(c => new Cell({
            id: c.I,
            attribute: c.A as CellAttribute,
            name: c.N,
            value: c.V,
            geo: c.G,
            remove: c.R
        }));
    }, [sortState.sortedCells]);

    // Check if cell is removed
    const isRemoved = !!cell.remove;

    // Use rarity style only if not removed
    const containerStyle = isRemoved ? undefined : rarityStyle;

    return (
        <div
            data-testid="card-container"
            style={containerStyle}
            className={`flex flex-col p-2 rounded-[16px] shadow-sm transition-all duration-300 relative
                ${isExpanded
                    ? 'bg-white/10 backdrop-blur-md ring-2 ring-white/20'
                    : isRemoved
                        ? 'bg-gray-500/20 cursor-default p-2' // Removed style
                        : 'bg-white/5 hover:bg-white/10 cursor-pointer p-2'
                }
            `}
            onClick={!isExpanded && !isRemoved ? handleToggle : undefined}
        >
            <CardHeader
                isExpanded={isExpanded}
                isRemoved={isRemoved}
                viewMode={viewMode}
                sortState={sortState}
                displayTitle={displayTitle}
                highlightKeywords={highlightKeywords}
                formattedDate={formattedDate}
                handleToggle={handleToggle}
            />

            {isExpanded && (
                <CardContent
                    footerVisible={footerVisible}
                    handleAddCell={handleAddCell}
                    cellModels={cellModels}
                    handleCellSave={handleCellSave}
                    lastAddedId={lastAddedId}
                />
            )}
        </div>
    );
};
