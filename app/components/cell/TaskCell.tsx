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
            className="flex items-center justify-center gap-4 w-full flex-1 cursor-text p-6"
        >
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(e.target.checked)}
                    className="appearance-none w-7 h-7 rounded-xl border-2 border-slate-200 bg-white/90 checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer relative
                        checked:after:content-['✓'] checked:after:absolute checked:after:text-white checked:after:text-base checked:after:font-bold checked:after:top-1/2 checked:after:left-1/2 checked:after:-translate-x-1/2 checked:after:-translate-y-1/2 hover:border-purple-400 ring-offset-2 focus:ring-4 focus:ring-purple-500/10"
                />
            </div>
            <input
                ref={nameRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleBlur}
                placeholder="To-do Task"
                className={cn(
                    "bg-white/90 border-b-2 border-transparent outline-none transition-all duration-300 text-center font-bold text-lg p-3 rounded-2xl placeholder:text-slate-400 flex-1",
                    "focus:border-purple-500 focus:bg-white focus:shadow-sm",
                    isChecked ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800"
                )}
            />
        </div>
    );
};
