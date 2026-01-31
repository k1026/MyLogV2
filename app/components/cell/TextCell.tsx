'use client';
import { useState, useRef, useEffect } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { cn } from '@/app/lib/utils';
import { useCellTitleEstimation } from '@/app/lib/hooks/useCellTitleEstimation';
import { useFilter } from '@/app/contexts/FilterContext';
import { highlightText } from '@/app/lib/utils/highlight';

interface TextCellProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
    isNew?: boolean;
}

export const TextCell: React.FC<TextCellProps> = ({ cell, onSave, isNew }) => {
    const [name, setName] = useState(cell.name);
    const [value, setValue] = useState(cell.value);
    const [isFocused, setIsFocused] = useState(false);
    const { filterSettings } = useFilter();
    const highlightKeywords = filterSettings.keywords.include;

    // Estimation Hook
    const { estimate } = useCellTitleEstimation();
    const hasEstimatedRef = useRef(false);
    const isEstimatingRef = useRef(false);
    const preventAutoMoveRef = useRef(false);

    useEffect(() => {
        if (isNew && !name && !hasEstimatedRef.current && !isEstimatingRef.current) {
            isEstimatingRef.current = true;
            estimate().then(results => {
                if (results.length > 0) {
                    // 新規追加時は自動的に1位をセット
                    if (isNew && !name) {
                        setName(results[0].title);
                        hasEstimatedRef.current = true;
                        preventAutoMoveRef.current = true;

                        // DOM更新後に全選択
                        setTimeout(() => {
                            nameRef.current?.focus();
                            nameRef.current?.select();
                            // 少し遅れて自動移動抑制を解除（ユーザーが操作できるように）
                            setTimeout(() => {
                                preventAutoMoveRef.current = false;
                            }, 500);
                        }, 50);
                    }
                }
                isEstimatingRef.current = false;
            }).catch(() => {
                isEstimatingRef.current = false;
            });
        }
    }, [isNew, name, estimate]);


    // ... focus management code ...
    // Note: Inserting hook calls must be at top level, before returns.

    // ... (Keep existing Effect blocks) ... But I am replacing lines 12-16?
    // I need to use replace_file carefully.

    // Let's insert hook calls at the beginning of component.


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


    // フォーカス管理 (仕様 4.2.2 & 修正計画)
    const hasAutoFocusedRef = useRef(false);

    useEffect(() => {
        // 新規作成時の自動フォーカス (初回のみ)
        if (isNew && !hasAutoFocusedRef.current) {
            hasAutoFocusedRef.current = true;
            setIsFocused(true);
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

            // 推定直後は移動を抑制
            if (preventAutoMoveRef.current) return;

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
    }, [isFocused, isNew, name, value]); // name, value を依存配列に追加して入力時の挙動も安定させる

    const handleBlur = (e: React.FocusEvent) => {
        // コンテナ外にフォーカスが移ったかチェック (relatedTarget is the new focused element)
        if (!containerRef.current?.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
            if (name !== cell.name || value !== cell.value) {
                // Fix lint: Create new Cell instance because onSave expects Cell, not POJO
                onSave?.(new Cell({ ...cell, name, value }));
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

    // 表示判定: 未入力かつ非フォーカス時は非表示にする (仕様 4.2.2)
    const showName = isFocused || !!name;
    const showValue = isFocused || !!value;

    return (
        <div
            ref={containerRef}
            data-testid="text-cell"
            onClick={handleContainerClick}
            onBlur={handleBlur}
            onFocus={() => setIsFocused(true)}
            className="flex flex-col gap-3 w-full flex-1 cursor-text min-h-[4rem] justify-start p-3"
        >
            {showName && (
                <div className="flex flex-col gap-1">
                    <div className="relative w-full">
                        {!isFocused && name && (
                            <div className="absolute inset-0 p-2 text-slate-800 font-bold text-[20px] leading-tight break-words pointer-events-none">
                                {highlightText(name, highlightKeywords)}
                            </div>
                        )}
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
                            onKeyDown={handleKeyDown}
                            placeholder={isFocused || !name ? "Title" : ""}
                            className={cn(
                                "bg-transparent border-b-2 border-transparent outline-none w-full transition-all duration-300 text-left p-2 rounded-none text-slate-800 font-bold text-[20px] placeholder:text-slate-400",
                                "focus:border-purple-500",
                                !isFocused && name ? "text-transparent" : "text-slate-800"
                            )}
                        />
                    </div>
                </div>
            )}
            {showValue && (
                <div className="relative w-full">
                    {!isFocused && value && (
                        <div className="absolute inset-0 p-2 text-slate-700 text-left leading-relaxed text-[18px] break-words whitespace-pre-wrap pointer-events-none">
                            {highlightText(value, highlightKeywords)}
                        </div>
                    )}
                    <textarea
                        ref={valueRef}
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        placeholder={isFocused || !value ? "Description..." : ""}
                        rows={1}
                        className={cn(
                            "bg-transparent border-b-2 border-transparent outline-none w-full resize-none transition-all duration-300 overflow-hidden text-left p-2 rounded-none text-slate-700 placeholder:text-slate-400 leading-relaxed text-[18px]",
                            "focus:border-purple-500",
                            !isFocused && value ? "text-transparent" : "text-slate-700"
                        )}
                    />
                </div>
            )}
        </div>
    );
};
