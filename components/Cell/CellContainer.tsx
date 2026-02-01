'use client';

import React from 'react';
import { Cell, CellAttribute } from '@/lib/models/cell';
import { cn } from '@/lib/utils/cn';

import { TimeCell } from './TimeCell';
import { TextCell } from './TextCell';
import { TaskCell } from './TaskCell';
import { useRarity } from '@/contexts/RarityContext';
import { getRarityStyle } from '@/lib/rarity/RarityColor';

interface CellContainerProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
    isNew?: boolean;
}

/**
 * CellのAttributeに応じて表示するコンポーネントを切り替えるコンテナ
 */
export const CellContainer: React.FC<CellContainerProps> = ({ cell, onSave, isNew }) => {
    const isTimeCell = cell.attribute === CellAttribute.Time;

    // 仕様 4.1.1: 共通デザイン
    // 背景色：背景は半透明の白色
    // 枠線：枠線は細い白色
    // Timeセルは透明背景・枠線なし
    const containerStyle = isTimeCell
        ? { backgroundColor: 'transparent' }
        : { backgroundColor: 'rgba(255, 255, 255, 0.6)' };

    const renderCell = () => {
        switch (cell.attribute) {
            case CellAttribute.Time:
                return <TimeCell cell={cell} onSave={onSave} isNew={isNew} />;
            case CellAttribute.Text:
                return <TextCell cell={cell} onSave={onSave} isNew={isNew} />;
            case CellAttribute.Task:
                return <TaskCell cell={cell} onSave={onSave} isNew={isNew} />;
            default:
                return <div className="p-2 text-slate-400 text-sm italic">Base Cell: {cell.attribute}</div>;
        }
    };

    return (
        <div
            data-testid="cell-container"
            style={containerStyle}
            className={cn(
                "group relative overflow-hidden transition-all duration-500 w-full flex flex-col",
                isTimeCell
                    ? "rounded-none border-transparent shadow-none backdrop-blur-none min-h-[auto]"
                    : "rounded-[8px] border border-white/80 shadow-sm backdrop-blur-md min-h-[12px]"
            )}
        >
            <div className="relative z-10 flex-1 flex flex-col px-[12px] py-[8px]">
                {renderCell()}
            </div>
        </div>
    );
};
