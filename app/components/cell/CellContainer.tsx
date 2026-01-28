'use client';

import React from 'react';
import { Cell, CellAttribute } from '@/app/lib/models/cell';

import { TimeCell } from './TimeCell';
import { TextCell } from './TextCell';
import { TaskCell } from './TaskCell';

interface CellContainerProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
}

/**
 * CellのAttributeに応じて表示するコンポーネントを切り替えるコンテナ
 */
export const CellContainer: React.FC<CellContainerProps> = ({ cell, onSave }) => {
    const renderCell = () => {
        switch (cell.attribute) {
            case CellAttribute.Time:
                return <TimeCell cell={cell} onSave={onSave} />;
            case CellAttribute.Text:
                return <TextCell cell={cell} onSave={onSave} />;
            case CellAttribute.Task:
                return <TaskCell cell={cell} onSave={onSave} />;
            default:
                // Cardセルや未知の属性は現状フォールバック
                return <div className="p-2 text-white/50 text-sm italic">Base Cell: {cell.attribute}</div>;
        }
    };

    return (
        <div
            data-testid="cell-container"
            className="bg-[#4141a0] text-white p-4 rounded-lg shadow-sm min-h-[4rem] w-full break-words"
        >
            {renderCell()}
        </div>
    );
};
