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
import { useCellTitleEstimation } from '@/app/lib/hooks/useCellTitleEstimation';
import { useFilter } from '@/app/contexts/FilterContext';
import { highlightText } from '@/app/lib/utils/highlight';

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

    const handleAddCell = async (attribute: CellAttribute) => {
        const currentIds = sortState.sortedCells.map(c => c.I);
        const newCell = await addCellToCard(cell.id, attribute, currentIds);
        setLastAddedId(newCell.id);
    };

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

    // renderCell 関数は不要になるため削除し、直接マップ内でレンダリングする


    return (
        <div
            data-testid="card-container"
            style={rarityStyle}
            className={`flex flex-col p-[12px] border rounded-3xl shadow-sm transition-all duration-300 relative
                ${isExpanded ? 'bg-white/10 backdrop-blur-md ring-2 ring-white/20' : 'bg-white/5 hover:bg-white/10 cursor-pointer'}
            `}
            onClick={!isExpanded ? handleToggle : undefined}
        >
            <div className={`flex items-center w-full mb-2 ${isExpanded ? 'justify-end' : 'justify-between'}`}>
                {!isExpanded && <div className="font-bold text-lg text-white">{highlightText(displayTitle, highlightKeywords)}</div>}
                <div className="flex items-center gap-2">
                    {isExpanded && <CardToolbar sortState={sortState} />}
                    {!isExpanded && <div className="text-xs text-gray-400">{formattedDate}</div>}
                    {isExpanded && (
                        <button
                            data-testid="card-close-button"
                            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center text-gray-400 transition-colors"
                            onClick={(e) => { e.stopPropagation(); handleToggle(); }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {isExpanded && (
                <div data-testid="card-item-list" className="mt-2 text-sm w-full relative">
                    <div className="flex flex-col gap-2 pb-12">
                        {cellModels.map(cellModel => (
                            <div key={cellModel.id} className="mb-2">
                                <CellContainer
                                    cell={cellModel}
                                    onSave={handleCellSave}
                                    isNew={cellModel.id === lastAddedId}
                                />
                            </div>
                        ))}
                    </div>

                    <div
                        data-testid="card-fab-container"
                        className="absolute bottom-[16px] right-[16px] z-[100]"
                    >
                        <CardFAB onAdd={handleAddCell} />
                    </div>
                </div>
            )}
        </div>
    );
};
