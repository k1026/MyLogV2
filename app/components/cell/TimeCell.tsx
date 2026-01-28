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

    const dateObj = parseDate(cell.value);
    const initialDate = isNaN(dateObj.getTime()) ? '' : dateObj.toISOString().split('T')[0];
    const initialTime = isNaN(dateObj.getTime()) ? '' : dateObj.toISOString().split('T')[1].slice(0, 5);

    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);

    const dateInputRef = useRef<HTMLInputElement>(null);
    const timeInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        setName(cell.name);
        const d = parseDate(cell.value);
        if (!isNaN(d.getTime())) {
            setDate(d.toISOString().split('T')[0]);
            setTime(d.toISOString().split('T')[1].slice(0, 5));
        } else {
            setDate('');
            setTime('');
        }
    }, [cell.name, cell.value]);

    const handleBlur = () => {
        let newValue = cell.value;
        if (date && time) {
            const updatedDate = new Date(`${date}T${time}:00.000Z`);
            if (!isNaN(updatedDate.getTime())) {
                newValue = updatedDate.toISOString();
            }
        } else if (!date && !time) {
            newValue = '';
        } else if (date && !time) {
            const updatedDate = new Date(`${date}T00:00:00.000Z`);
            if (!isNaN(updatedDate.getTime())) {
                newValue = updatedDate.toISOString();
            }
        } else if (!date && time) {
            const now = new Date();
            const currentDate = now.toISOString().split('T')[0];
            const updatedDate = new Date(`${currentDate}T${time}:00.000Z`);
            if (!isNaN(updatedDate.getTime())) {
                newValue = updatedDate.toISOString();
            }
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
