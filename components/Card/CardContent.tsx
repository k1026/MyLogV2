import React from 'react';
import { Cell, CellAttribute } from '@/lib/models/cell';
import { CardFAB } from './CardFAB';
import { CellContainer } from '../Cell/CellContainer';

interface CardContentProps {
    footerVisible: boolean;
    handleAddCell: (attribute: CellAttribute) => Promise<void>;
    cellModels: Cell[];
    handleCellSave: (updatedCell: Cell) => Promise<void>;
    lastAddedId: string | null;
}

export const CardContent: React.FC<CardContentProps> = ({
    footerVisible,
    handleAddCell,
    cellModels,
    handleCellSave,
    lastAddedId
}) => {
    return (
        <div data-testid="card-item-list" className="mt-2 text-sm w-full relative">
            {/* Floating Add Button Wrapper - Keeps FAB visible while scrolling through the card */}
            <div
                data-testid="card-fab-container"
                className="sticky z-[100] h-0 flex justify-end pr-[16px] pointer-events-none"
                style={{
                    top: footerVisible
                        ? 'calc(100vh - 80px - 16px - 60px)'
                        : 'calc(100vh - 16px - 60px)'
                }}
            >
                <div className="pointer-events-auto">
                    <CardFAB onAdd={handleAddCell} />
                </div>
            </div>

            <div className="flex flex-col gap-2 pb-[12px]">
                {cellModels.map(cellModel => (
                    <div key={cellModel.id}>
                        <CellContainer
                            cell={cellModel}
                            onSave={handleCellSave}
                            isNew={cellModel.id === lastAddedId}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};
