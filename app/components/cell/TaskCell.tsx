'use client';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { cn } from '@/app/lib/utils';
// import { Checkbox } from "@/app/components/ui/checkbox"; // もし作成済みならこれを使うが、現状は標準かRadix直接

interface TaskCellProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
}

export const TaskCell: React.FC<TaskCellProps> = ({ cell, onSave }) => {
    const [name, setName] = useState(cell.name);
    const isChecked = cell.value === 'true';
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setName(cell.name);
    }, [cell.name]);

    const handleCheckboxChange = (checked: boolean) => {
        onSave?.({ ...cell, value: checked ? 'true' : 'false' });
    };

    const handleBlur = () => {
        if (name !== cell.name) {
            onSave?.({ ...cell, name });
        }
    };

    const handleContainerClick = () => {
        nameRef.current?.focus();
        // 全選択と末尾移動はブラウザ挙動的にselect()で概ねカバーできるが
        // 仕様通りなら select() を呼ぶ
        nameRef.current?.select();
    };

    return (
        <div
            data-testid="task-cell"
            onClick={handleContainerClick}
            className="flex items-center gap-3 w-full group cursor-text"
        >
            <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="w-5 h-5 rounded border-white/30 bg-white/10 checked:bg-purple-500 cursor-pointer"
            />
            <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleBlur}
                className={cn(
                    "bg-transparent border-b border-transparent outline-none flex-1 transition-colors",
                    "focus:border-purple-400 placeholder:text-white/30",
                    isChecked && "text-white/50 line-through"
                )}
            />
        </div>
    );
};
