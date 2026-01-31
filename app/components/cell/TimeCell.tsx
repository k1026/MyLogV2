'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { cn } from '@/app/lib/utils';

interface TimeCellProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
    isNew?: boolean;
}

/**
 * タイムセル (Time) コンポーネント
 * 発生・記録日時の表示・編集を仕様(04_CellUI.md)に基づいて行う。
 */
export const TimeCell: React.FC<TimeCellProps> = ({ cell, onSave }) => {
    // -------------------------------------------------------------------------
    // Helper Functions
    // -------------------------------------------------------------------------
    const parseDate = (val: string): Date => {
        let d = new Date(val);
        if (isNaN(d.getTime())) {
            const timestamp = parseInt(val, 10);
            if (!isNaN(timestamp)) {
                d = new Date(timestamp);
            }
        }
        return d;
    };

    const formatDate = (d: Date) => {
        if (isNaN(d.getTime())) return '';
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const formatTime = (d: Date) => {
        if (isNaN(d.getTime())) return '';
        const hours = String(d.getHours()).padStart(2, '0');
        const minutes = String(d.getMinutes()).padStart(2, '0');
        return `${hours}:${minutes}`;
    };

    // -------------------------------------------------------------------------
    // State
    // -------------------------------------------------------------------------
    const dateObj = parseDate(cell.value);
    const [name, setName] = useState(cell.name);
    const [date, setDate] = useState(formatDate(dateObj));
    const [time, setTime] = useState(formatTime(dateObj));

    const dateInputRef = useRef<HTMLInputElement>(null);
    const timeInputRef = useRef<HTMLInputElement>(null);

    // 同期
    useEffect(() => {
        setName(cell.name);
        const d = parseDate(cell.value);
        if (!isNaN(d.getTime())) {
            setDate(formatDate(d));
            setTime(formatTime(d));
        }
    }, [cell.name, cell.value]);

    const handleSave = (newName?: string, newDate?: string, newTime?: string) => {
        const finalName = newName ?? name;
        const finalDate = newDate ?? date;
        const finalTime = newTime ?? time;

        let newValue = cell.value;
        if (finalDate && finalTime) {
            newValue = `${finalDate}T${finalTime}:00`;
        } else if (!finalDate && !finalTime) {
            newValue = '';
        } else if (finalDate && !finalTime) {
            newValue = `${finalDate}T00:00:00`;
        }

        if (finalName !== cell.name || newValue !== cell.value) {
            onSave?.(new Cell({ ...cell, name: finalName, value: newValue }));
        }
    };

    return (
        <div
            data-testid="time-cell"
            className="flex flex-col gap-[2px] items-start w-full bg-transparent"
        >
            {/* タイトル行 - 仕様: 14px, medium, text-white */}
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onBlur={() => handleSave()}
                placeholder="Entry Title"
                className="w-full bg-transparent border-none outline-none text-[14px] font-medium text-white placeholder:text-white/40 p-0 focus:ring-0"
                aria-label="Name"
            />

            {/* 値行 - 仕様: 横並び gap-2px */}
            <div className="flex flex-row gap-2">
                {/* 日付ボタン - 仕様: 18px, w-fit, text-white */}
                <button
                    type="button"
                    onClick={() => dateInputRef.current?.showPicker()}
                    className="w-fit text-left text-[18px] font-normal text-white bg-transparent border-none p-0 cursor-pointer"
                    aria-label="Date"
                >
                    {date || 'YYYY-MM-DD'}
                </button>

                {/* 時刻ボタン - 仕様: 18px, w-fit, text-white */}
                <button
                    type="button"
                    onClick={() => timeInputRef.current?.showPicker()}
                    className="w-fit text-left text-[18px] font-normal text-white bg-transparent border-none p-0 cursor-pointer"
                    aria-label="Time"
                >
                    {time || 'HH:mm'}
                </button>
            </div>

            {/* 隠しインプット */}
            <input
                type="date"
                ref={dateInputRef}
                className="sr-only"
                value={date}
                onChange={(e) => {
                    setDate(e.target.value);
                    handleSave(name, e.target.value, time);
                }}
                aria-label="Date Input"
            />
            <input
                type="time"
                ref={timeInputRef}
                className="sr-only"
                value={time}
                onChange={(e) => {
                    setTime(e.target.value);
                    handleSave(name, date, e.target.value);
                }}
                aria-label="Time Input"
            />
        </div>
    );
};
