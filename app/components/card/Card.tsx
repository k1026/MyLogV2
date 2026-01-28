import React from 'react';
import { Cell, CellAttribute } from '@/app/lib/models/cell';
import { useRarity } from '@/app/contexts/RarityContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, CellDB } from '@/app/lib/db/db';
import { useCardSort } from './useCardSort';
import { CardToolbar } from './CardToolbar';
import { CardFAB } from './CardFAB';
import { getRarityStyle } from '@/app/lib/rarity/RarityColor';
import { CellContainer } from '../cell/CellContainer';
import { cleanupCardCells, addCellToCard } from './cardUtils';

interface CardProps {
    cell: Cell;
    onUpdate?: (cell: Cell) => void;
    defaultExpanded?: boolean;
}

export const Card: React.FC<CardProps> = ({ cell, onUpdate, defaultExpanded = false }) => {
    const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
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
    const displayTitle = titleCell?.N || cell.name || 'No Title';

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

    const handleToggle = () => {
        if (isExpanded) {
            cleanupCardCells(cell);
            setLastAddedId(null); // Reset when closing
        }
        setIsExpanded(!isExpanded);
    };

    const handleAddCell = async (attribute: CellAttribute) => {
        const currentIds = sortState.sortedCells.map(c => c.I);
        const newCell = await addCellToCard(cell.id, attribute, currentIds);
        setLastAddedId(newCell.id);
    };

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
    };

    const renderCell = (c: CellDB) => {
        const cellModel: Cell = {
            id: c.I,
            attribute: c.A as CellAttribute,
            name: c.N,
            value: c.V,
            geo: c.G,
            remove: c.R
        };
        return (
            <div key={c.I} className="mb-2">
                <CellContainer
                    cell={cellModel}
                    onSave={handleCellSave}
                    isNew={c.I === lastAddedId}
                />
            </div>
        );
    };

    return (
        <div
            data-testid="card-container"
            style={rarityStyle}
            className={`flex flex-col p-4 border rounded-3xl shadow-sm transition-all duration-300 relative
                ${isExpanded ? 'bg-white/10 backdrop-blur-md ring-2 ring-white/20' : 'bg-white/5 hover:bg-white/10 cursor-pointer'}
            `}
            onClick={!isExpanded ? handleToggle : undefined}
        >
            <div className="flex justify-between items-center w-full mb-2">
                <div className="font-bold text-lg">{displayTitle}</div>
                <div className="flex items-center gap-2">
                    {isExpanded && <CardToolbar sortState={sortState} />}
                    <div className="text-xs opacity-50">{formattedDate}</div>
                    {isExpanded && (
                        <button
                            data-testid="card-close-button"
                            className="text-xs text-white/70 hover:text-white px-2 py-1 rounded bg-white/10"
                            onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                        >
                            Close
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div data-testid="card-item-list" className="mt-2 text-sm w-full relative">
                    <div className="flex flex-col gap-2 pb-12">
                        {sortState.sortedCells.map(renderCell)}
                    </div>

                    <div className="absolute bottom-0 right-0 p-2">
                        <CardFAB onAdd={handleAddCell} />
                    </div>
                </div>
            )}
        </div>
    );
}
