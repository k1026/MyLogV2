'use client';
import React from 'react';
import { useState, useEffect, useRef } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { cn } from '@/app/lib/utils';
import { useCellTitleEstimation } from '@/app/lib/hooks/useCellTitleEstimation';
import { useFilter } from '@/app/contexts/FilterContext';
import { highlightText } from '@/app/lib/utils/highlight';

interface TaskCellProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
    isNew?: boolean;
}

export const TaskCell: React.FC<TaskCellProps> = ({ cell, onSave, isNew }) => {
    const [name, setName] = useState(cell.name);
    const [isFocused, setIsFocused] = useState(false);
    const { filterSettings } = useFilter();
    const highlightKeywords = filterSettings.keywords.include;
    const isChecked = cell.value === 'true';
    const nameRef = useRef<HTMLInputElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // Estimation Hook
    const { estimate } = useCellTitleEstimation();
    const hasEstimatedRef = useRef(false);
    const isEstimatingRef = useRef(false);

    useEffect(() => {
        if (isNew && !name && !hasEstimatedRef.current && !isEstimatingRef.current) {
            isEstimatingRef.current = true;
            estimate().then(results => {
                if (results.length > 0) {
                    // 新規追加時は自動的に1位をセット
                    setName(currentName => {
                        // ユーザーが既に入力済みの場合は上書きしない
                        if (currentName) return currentName;

                        const estimatedTitle = results[0].title;
                        hasEstimatedRef.current = true;

                        // DOM更新後に全選択
                        setTimeout(() => {
                            nameRef.current?.focus();
                            nameRef.current?.select();
                        }, 50);

                        return estimatedTitle;
                    });
                }
                isEstimatingRef.current = false;
            }).catch(() => {
                isEstimatingRef.current = false;
            });
        }
    }, [isNew, name, estimate]);


    const hasAutoFocusedRef = useRef(false);

    useEffect(() => {
        if (isNew && !hasAutoFocusedRef.current) {
            hasAutoFocusedRef.current = true;
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
        onSave?.(new Cell({ ...cell, value: checked ? 'true' : 'false' }));
    };

    const handleBlur = (e: React.FocusEvent) => {
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
            if (name !== cell.name) {
                onSave?.(new Cell({ ...cell, name }));
            }
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
            ref={containerRef}
            data-testid="task-cell"
            onClick={handleContainerClick}
            className="flex items-center justify-start gap-3 w-full flex-1 cursor-text p-3"
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
            <div className="flex-1 flex flex-col gap-1">
                <div className="relative flex-1">
                    {!isFocused && name ? (
                        <div className={cn(
                            "absolute inset-0 p-3 text-left font-bold text-[20px] break-words pointer-events-none",
                            isChecked ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800"
                        )}>
                            {highlightText(name, highlightKeywords)}
                        </div>
                    ) : null}
                    <input
                        ref={nameRef}
                        type="text"
                        value={name}
                        onChange={(e) => {
                            setName(e.target.value);
                            if (!hasEstimatedRef.current) {
                                hasEstimatedRef.current = true;
                            }
                        }}
                        onFocus={() => setIsFocused(true)}
                        onBlur={handleBlur}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                nameRef.current?.blur();
                            }
                        }}
                        placeholder="To-do Task"
                        className={cn(
                            "bg-transparent border-b-2 border-transparent outline-none transition-all duration-300 text-left font-bold text-[20px] p-3 rounded-none placeholder:text-slate-400 flex-1 w-full",
                            "focus:border-purple-500",
                            isChecked ? "text-slate-400 line-through decoration-slate-300" : "text-slate-800",
                            !isFocused && name ? "text-transparent" : ""
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
