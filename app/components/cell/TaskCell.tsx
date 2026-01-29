'use client';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { cn } from '@/app/lib/utils';
// import { Checkbox } from "@/app/components/ui/checkbox"; // もし作成済みならこれを使うが、現状は標準かRadix直接

interface TaskCellProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
    isNew?: boolean;
}

export const TaskCell: React.FC<TaskCellProps> = ({ cell, onSave, isNew }) => {
    const [name, setName] = useState(cell.name);
    const isChecked = cell.value === 'true';
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isNew) {
            setTimeout(() => {
                nameRef.current?.focus();
                nameRef.current?.select();
            }, 50);
        }
    }, [isNew]);

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
            className="flex items-center justify-center gap-3 w-full flex-1 cursor-text p-3"
        >
            <div className="flex items-center">
                <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={(e) => handleCheckboxChange(e.target.checked)}
                    className="appearance-none w-7 h-7 rounded-[2px] border-2 border-purple-200 bg-transparent checked:bg-purple-500 checked:border-purple-500 transition-all cursor-pointer relative
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
                    "bg-transparent border-b-2 border-transparent outline-none transition-all duration-300 text-center font-bold text-[20px] p-3 rounded-none placeholder:text-slate-400 flex-1",
                    "focus:border-purple-500",
                    isChecked ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800"
                )}
            />
        </div>
    );
};
