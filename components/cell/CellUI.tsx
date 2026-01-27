'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { Checkbox } from '@/components/ui/checkbox';

export interface CellUIProps {
    cell: Cell;
    onUpdate?: (updatedCell: Cell) => Promise<void>;
    autoFocus?: boolean;
}

/**
 * Cell共通のUIコンテナ
 */
export function CellUI({ cell, onUpdate, autoFocus }: CellUIProps) {
    // ライトテーマ: 白背景に薄いボーダー、影を付けて「浮いている」感を出す
    const baseStyle = "p-6 rounded-2xl bg-white text-slate-950 min-h-[4rem] transition-all flex flex-col hover:shadow-md border border-slate-100";

    let content = null;
    switch (cell.attribute) {
        case 'Time':
            content = <TimeCellUI cell={cell} onUpdate={onUpdate} />;
            break;
        case 'Text':
            content = <TextCellUI cell={cell} onUpdate={onUpdate} initialAutoFocus={autoFocus} />;
            break;
        case 'Task':
            content = <TaskCellUI cell={cell} onUpdate={onUpdate} />;
            break;
    }

    return (
        <div className={baseStyle}>
            {content}
        </div>
    );
}

/**
 * Time属性用セルUI
 */
export function TimeCellUI({ cell, onUpdate }: CellUIProps) {
    const [name, setName] = useState(cell.name);
    const [value, setValue] = useState(cell.value);
    const lastSubmittedName = useRef(cell.name);
    const lastSubmittedValue = useRef(cell.value);

    // cell prop が外部から更新された場合にローカルステートを同期する
    useEffect(() => {
        setName(cell.name);
        setValue(cell.value);
        lastSubmittedName.current = cell.name;
        lastSubmittedValue.current = cell.value;
    }, [cell.id, cell.name, cell.value]); // IDも含めて同期

    const handleBlur = () => {
        // 現在のセルの値と比較、かつ最後に送信した値とも比較（べき等性）
        const isChanged = (name !== cell.name || value !== cell.value) &&
            (name !== lastSubmittedName.current || value !== lastSubmittedValue.current);

        if (isChanged) {
            lastSubmittedName.current = name;
            lastSubmittedValue.current = value;
            const updated = new Cell({ ...cell.toObject(), name, value });
            onUpdate?.(updated);
        }
    };

    // UNIXミリ秒を input type="datetime-local" 形式 (YYYY-MM-DDTHH:mm) に変換
    const toDatetimeLocal = (ts: string) => {
        const date = new Date(parseInt(ts, 10));
        if (isNaN(date.getTime())) return '';
        return date.toISOString().slice(0, 16);
    };

    return (
        <div className="flex flex-col gap-3">
            <input
                type="text"
                value={name || ''}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleBlur}
                className="bg-transparent border-b-2 border-slate-100 focus:border-indigo-500/50 outline-none transition-all px-1 py-1 text-sm font-bold text-slate-700 placeholder:text-slate-300"
                placeholder="Event Name"
            />
            <input
                type="datetime-local"
                value={toDatetimeLocal(value || '')}
                onChange={(e) => {
                    const ts = new Date(e.target.value).getTime();
                    if (!isNaN(ts)) setValue(ts.toString());
                }}
                onBlur={handleBlur}
                className="bg-transparent border-b-2 border-slate-100 focus:border-indigo-500/50 outline-none transition-all px-1 py-1 text-xs font-mono text-slate-500"
            />
        </div>
    );
}

/**
 * Text属性用セルUI
 */
export function TextCellUI({ cell, onUpdate, initialAutoFocus }: CellUIProps & { initialAutoFocus?: boolean }) {
    const [name, setName] = useState(cell.name);
    const [value, setValue] = useState(cell.value);
    const [isFocused, setIsFocused] = useState(initialAutoFocus || false);
    const nameRef = useRef<HTMLInputElement>(null);
    const valueRef = useRef<HTMLTextAreaElement>(null);
    const lastSubmittedName = useRef(cell.name);
    const lastSubmittedValue = useRef(cell.value);

    // cell prop が外部から更新された場合にローカルステートを同期する
    useEffect(() => {
        setName(cell.name);
        setValue(cell.value);
        lastSubmittedName.current = cell.name;
        lastSubmittedValue.current = cell.value;
    }, [cell.id, cell.name, cell.value]);

    const handleBlur = (e: React.FocusEvent) => {
        // 次のフォーカス対象がコンテナ内部（name入力 or value入力）でない場合のみ、
        // 編集モード（isFocused）を解除する
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
            setIsFocused(false);
        }

        // 現在のセルの値と比較、かつ最後に送信した値とも比較（べき等性）
        const isChanged = (name !== cell.name || value !== cell.value) &&
            (name !== lastSubmittedName.current || value !== lastSubmittedValue.current);

        if (isChanged) {
            lastSubmittedName.current = name;
            lastSubmittedValue.current = value;
            const updated = new Cell({ ...cell.toObject(), name, value });
            onUpdate?.(updated);
        }
    };

    const handleContainerClick = (e: React.MouseEvent) => {
        // コンテナ自体がクリックされた場合のみ発動（バブリングによる重複防止）
        if (e.target === e.currentTarget) {
            setIsFocused(true);
        }
    };

    // フォーカス状態になった際の初期フォーカス制御 (初回のみ)
    useEffect(() => {
        if (isFocused) {
            if (!name) {
                nameRef.current?.focus();
            } else if (!value) {
                valueRef.current?.focus();
            } else {
                valueRef.current?.focus();
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isFocused]);

    const handleNameKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            setIsFocused(true); // 効果を発動させる
            // すでに value があっても valueRef にフォーカスを移す
            setTimeout(() => valueRef.current?.focus(), 0);
        }
    };

    return (
        <div
            className="flex-1 flex flex-col gap-3 cursor-text min-h-[2rem]"
            onClick={handleContainerClick}
            onBlur={handleBlur}
        >
            {(isFocused || name) && (
                <input
                    ref={nameRef}
                    type="text"
                    value={name || ''}
                    onChange={(e) => setName(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onKeyDown={handleNameKeyDown}
                    className="bg-transparent border-b-2 border-slate-100 focus:border-indigo-500/50 outline-none transition-all px-1 py-1 text-sm font-black text-slate-800 placeholder:text-slate-300"
                    placeholder="Log Title"
                />
            )}
            {(isFocused || value) && (
                <textarea
                    ref={valueRef}
                    value={value || ''}
                    onChange={(e) => {
                        setValue(e.target.value);
                        // 可変高さ
                        e.target.style.height = 'auto';
                        e.target.style.height = e.target.scrollHeight + 'px';
                    }}
                    onFocus={() => setIsFocused(true)}
                    className="bg-transparent border-b-2 border-slate-100 focus:border-indigo-500/50 outline-none transition-all px-1 py-1 text-base text-slate-600 placeholder:text-slate-300 resize-none overflow-hidden min-h-[3rem]"
                    placeholder="Write details..."
                />
            )}
        </div>
    );
}

/**
 * Task属性用セルUI
 */
export function TaskCellUI({ cell, onUpdate }: CellUIProps) {
    const [name, setName] = useState(cell.name);
    const inputRef = useRef<HTMLInputElement>(null);
    const lastSubmittedName = useRef(cell.name);

    // cell prop が外部から更新された場合にローカルステートを同期する
    useEffect(() => {
        setName(cell.name);
        lastSubmittedName.current = cell.name;
    }, [cell.id, cell.name]);

    const handleBlur = () => {
        const isChanged = name !== cell.name && name !== lastSubmittedName.current;
        if (isChanged) {
            lastSubmittedName.current = name;
            const updated = new Cell({ ...cell.toObject(), name });
            onUpdate?.(updated);
        }
    };

    const handleToggle = (checked: boolean) => {
        const newValue = checked ? Date.now().toString() : '';
        // checkboxのトグルは値が必ず変わるのでそのまま実行
        const updated = new Cell({ ...cell.toObject(), value: newValue });
        onUpdate?.(updated);
    };

    // タスクセルUI選択時にフォーカス
    useEffect(() => {
        if (inputRef.current) {
            // テキストがあれば全選択
            if (name) {
                inputRef.current.select();
            }
        }
    }, []);

    const isDone = !!cell.value;

    return (
        <div className="flex items-center gap-4 py-1">
            <Checkbox
                checked={isDone}
                onCheckedChange={(checked) => handleToggle(!!checked)}
                className="w-6 h-6 border-slate-200 data-[state=checked]:bg-gradient-to-br data-[state=checked]:from-indigo-600 data-[state=checked]:to-purple-600 data-[state=checked]:border-transparent rounded-lg transition-all"
            />
            <input
                ref={inputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={handleBlur}
                className={`flex-1 bg-transparent border-b-2 border-slate-100 focus:border-indigo-500/50 outline-none transition-all px-1 py-1 text-sm font-bold placeholder:text-slate-300 ${isDone ? 'text-slate-300 line-through' : 'text-slate-700'}`}
                placeholder="What needs to be done?"
            />
        </div>
    );
}
