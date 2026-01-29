'use client';
import { useState, useRef, useEffect } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { cn } from '@/app/lib/utils';

interface TextCellProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
    isNew?: boolean;
}

export const TextCell: React.FC<TextCellProps> = ({ cell, onSave, isNew }) => {
    const [name, setName] = useState(cell.name);
    const [value, setValue] = useState(cell.value);
    const [isFocused, setIsFocused] = useState(false);

    const nameRef = useRef<HTMLInputElement>(null);
    const valueRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    // cell.name or cell.value が外部から変わった場合の対応
    useEffect(() => {
        setName(cell.name);
        setValue(cell.value);
    }, [cell.name, cell.value]);

    // 自動高さ調整
    useEffect(() => {
        if (valueRef.current) {
            valueRef.current.style.height = 'auto';
            valueRef.current.style.height = `${valueRef.current.scrollHeight}px`;
        }
    }, [value, isFocused]);


    // フォーカス管理 (仕様 4.2.2)
    useEffect(() => {
        if (isNew) {
            setIsFocused(true);
            // We need a short timeout to ensure the element is rendered and can be selected
            setTimeout(() => {
                nameRef.current?.focus();
                nameRef.current?.select();
            }, 50);
            return;
        }

        if (isFocused) {
            // レンダリング完了後にフォーカスを設定
            // 既存の focus check を行って、すでにフォーカスがある場合は何もしない（誤作動防止）
            if (document.activeElement === nameRef.current || document.activeElement === valueRef.current) return;

            if (!name && !value) {
                nameRef.current?.focus();
            } else if (name && !value) {
                valueRef.current?.focus();
            } else if (!name && value) {
                nameRef.current?.focus();
            } else {
                valueRef.current?.focus();
            }
        }
    }, [isFocused, isNew]);

    const handleBlur = (e: React.FocusEvent) => {
        // コンテナ外にフォーカスが移ったかチェック (relatedTarget is the new focused element)
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
            if (name !== cell.name || value !== cell.value) {
                onSave?.({ ...cell, name, value });
            }
        }
    };

    const handleContainerClick = () => {
        if (isFocused) return;
        setIsFocused(true);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.target === nameRef.current) {
            e.preventDefault();
            valueRef.current?.focus();
        }
    };

    // 表示判定: 両方空の場合は、場所を明示するために常にタイトルを表示する
    const showName = isFocused || !!name || (!name && !value);
    const showValue = isFocused || !!value;

    return (
        <div
            ref={containerRef}
            data-testid="text-cell"
            onClick={handleContainerClick}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            className="flex flex-col gap-3 w-full flex-1 cursor-text min-h-[4rem] justify-center p-3"
        >
            {showName && (
                <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isFocused || !name ? "Title" : ""}
                    className={cn(
                        "bg-transparent border-b-2 border-transparent outline-none w-full transition-all duration-300 text-center p-2 rounded-none text-slate-800 font-bold text-[20px] placeholder:text-slate-400",
                        "focus:border-purple-500"
                    )}
                />
            )}
            {showValue && (
                <textarea
                    ref={valueRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={isFocused || !value ? "Description..." : ""}
                    rows={1}
                    className={cn(
                        "bg-transparent border-b-2 border-transparent outline-none w-full resize-none transition-all duration-300 overflow-hidden text-center p-2 rounded-none text-slate-700 placeholder:text-slate-400 leading-relaxed text-[18px]",
                        "focus:border-purple-500"
                    )}
                />
            )}
        </div>
    );
};
