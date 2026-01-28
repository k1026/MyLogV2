'use client';
import { useState, useRef, useEffect } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { cn } from '@/app/lib/utils';

interface TextCellProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
}

export const TextCell: React.FC<TextCellProps> = ({ cell, onSave }) => {
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

    const handleBlur = (e: React.FocusEvent) => {
        // コンテナ外にフォーカスが移ったかチェック
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
            if (name !== cell.name || value !== cell.value) {
                onSave?.({ ...cell, name, value });
            }
        }
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        if (isFocused) return;
        setIsFocused(true);

        // 仕様 4.2.2: フォーカス制御
        setTimeout(() => {
            if (!name && !value) {
                nameRef.current?.focus();
            } else if (name && !value) {
                valueRef.current?.focus();
            } else if (!name && value) {
                nameRef.current?.focus();
            } else {
                valueRef.current?.focus();
            }
        }, 0);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && e.target === nameRef.current) {
            e.preventDefault();
            valueRef.current?.focus();
        }
    };

    // 表示判定
    const showName = isFocused || !!name;
    const showValue = isFocused || !!value;

    return (
        <div
            ref={containerRef}
            data-testid="text-cell"
            onClick={handleContainerClick}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            className="flex flex-col gap-2 w-full h-full cursor-text"
        >
            {showName && (
                <input
                    ref={nameRef}
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={isFocused ? "Title" : ""}
                    className={cn(
                        "bg-transparent border-b border-transparent outline-none w-full transition-colors",
                        "focus:border-purple-400 placeholder:text-white/30"
                    )}
                />
            )}
            {showValue && (
                <textarea
                    ref={valueRef}
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder={isFocused ? "Content" : ""}
                    rows={1}
                    className={cn(
                        "bg-transparent border-b border-transparent outline-none w-full resize-none transition-colors overflow-hidden",
                        "focus:border-purple-400 placeholder:text-white/30"
                    )}
                />
            )}
        </div>
    );
};
