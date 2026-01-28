'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { cn } from '@/app/lib/utils';

interface TimeCellProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
    isNew?: boolean;
}

export const TimeCell: React.FC<TimeCellProps> = ({ cell, onSave, isNew }) => {
    const [name, setName] = useState(cell.name);

    // Helper to safely parse date from string (ISO or timestamp)
    const parseDate = (val: string): Date => {
        let d = new Date(val);
        // If invalid, try parsing as number (timestamp)
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

    const dateObj = parseDate(cell.value);
    const initialDate = formatDate(dateObj);
    const initialTime = formatTime(dateObj);

    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);

    const dateInputRef = useRef<HTMLInputElement>(null);
    const timeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setName(cell.name);
        const d = parseDate(cell.value);
        if (!isNaN(d.getTime())) {
            setDate(formatDate(d));
            setTime(formatTime(d));
        } else {
            setDate('');
            setTime('');
        }
    }, [cell.name, cell.value]);

    const handleBlur = () => {
        let newValue = cell.value;
        if (date && time) {
            // Store as local time string (YYYY-MM-DDTHH:mm:ss) to match tests and user preference
            newValue = `${date}T${time}:00`;
        } else if (!date && !time) {
            newValue = '';
        } else if (date && !time) {
            newValue = `${date}T00:00:00`;
        } else if (!date && time) {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const day = String(now.getDate()).padStart(2, '0');
            const currentDate = `${year}-${month}-${day}`;
            newValue = `${currentDate}T${time}:00`;
        }

        if (name !== cell.name || newValue !== cell.value) {
            onSave?.({ ...cell, name, value: newValue });
        }
    };

    const inputBaseClass = "bg-transparent border-none outline-none text-white transition-all duration-300 text-left focus:ring-0 p-0";

    const renderAutoWidthInput = (
        value: string,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
        placeholder: string = "",
        ariaLabel: string = "",
        className: string = "",
        onClick?: () => void
    ) => (
        <div className="inline-grid items-center">
            <input
                type="text"
                value={value}
                onChange={onChange}
                onBlur={handleBlur}
                placeholder={placeholder}
                aria-label={ariaLabel}
                className={cn(inputBaseClass, "col-start-1 row-start-1 w-full", className)}
                onClick={onClick}
            />
            <span className={cn(inputBaseClass, "col-start-1 row-start-1 invisible whitespace-pre px-0 min-w-[1ch]", className)}>
                {value || placeholder}
            </span>
        </div>
    );

    return (
        <div
            data-testid="time-cell"
            className="flex flex-col gap-1 w-full flex-1 items-start justify-start p-4"
        >
            {renderAutoWidthInput(
                name,
                (e) => setName(e.target.value),
                "Entry Title",
                "",
                "font-bold text-lg placeholder:text-white/40"
            )}
            <div className="flex gap-2 items-center flex-wrap">
                {renderAutoWidthInput(
                    date,
                    (e) => setDate(e.target.value),
                    "",
                    "Date",
                    "text-sm font-medium w-auto",
                    () => dateInputRef.current?.showPicker()
                )}
                {renderAutoWidthInput(
                    time,
                    (e) => setTime(e.target.value),
                    "",
                    "Time",
                    "text-sm font-medium w-auto",
                    () => timeInputRef.current?.showPicker()
                )}
                {/* Hidden pickers */}
                <input
                    type="date"
                    ref={dateInputRef}
                    className="sr-only"
                    onChange={(e) => {
                        setDate(e.target.value);
                        handleBlur();
                    }}
                />
                <input
                    type="time"
                    ref={timeInputRef}
                    className="sr-only"
                    onChange={(e) => {
                        setTime(e.target.value);
                        handleBlur();
                    }}
                />
            </div>
        </div>
    );
};
