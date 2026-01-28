'use client';

import React from 'react';
import { Cell, CellAttribute } from '@/app/lib/models/cell';

import { TimeCell } from './TimeCell';
import { TextCell } from './TextCell';
import { TaskCell } from './TaskCell';
import { useRarity } from '@/app/contexts/RarityContext';
import { getRarityStyle } from '@/app/lib/rarity/RarityColor';

interface CellContainerProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
}

/**
 * CellのAttributeに応じて表示するコンポーネントを切り替えるコンテナ
 */
export const CellContainer: React.FC<CellContainerProps> = ({ cell, onSave }) => {
    const { rarityData } = useRarity();
    const isTimeCell = cell.attribute === CellAttribute.Time;
    const rarity = isTimeCell ? undefined : rarityData.get(cell.name);

    // 仕様 4.1.1: 背景色は指定がない場合は白色に設定する
    // レア度が取得できない（またはTimeセルの）場合は白系（ここではガラスモーフィズムを維持しつつ白っぽく）
    const rarityStyle = rarity !== undefined ? getRarityStyle(rarity) : { backgroundColor: 'rgba(255, 255, 255, 0.8)' };

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
            style={rarityStyle}
            className="group relative overflow-hidden rounded-3xl border border-white/40 shadow-xl transition-all duration-500 hover:shadow-2xl hover:border-white/60 shadow-purple-500/10 backdrop-blur-xl min-h-[5rem] w-full flex flex-col"
        >
            <div className="absolute inset-0 bg-white/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none" />
            <div className="relative z-10 flex-1 flex flex-col">
                {renderCell()}
            </div>
        </div>
    );
};
