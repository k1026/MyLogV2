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
                return <div className="p-2 text-slate-400 text-sm italic">Base Cell: {cell.attribute}</div>;
        }
    };

    return (
        <div
            data-testid="cell-container"
            className="group relative overflow-hidden rounded-3xl border border-indigo-100/50 bg-gradient-to-br from-indigo-50/80 to-purple-50/80 shadow-xl shadow-indigo-100/50 transition-all duration-500 hover:shadow-2xl hover:shadow-indigo-200/50 hover:border-indigo-300/50 backdrop-blur-xl min-h-[5rem] w-full flex flex-col"
        >
            <div className="absolute inset-0 bg-white/40 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
            <div className="relative z-10 flex-1 flex flex-col">
                {renderCell()}
            </div>
        </div>
    );
};
