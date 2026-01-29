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
    // State Initialization
    // -------------------------------------------------------------------------
    const dateObj = parseDate(cell.value);
    const initialDate = formatDate(dateObj);
    const initialTime = formatTime(dateObj);

    const [name, setName] = useState(cell.name);
    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);

    const dateInputRef = useRef<HTMLInputElement>(null);
    const timeInputRef = useRef<HTMLInputElement>(null);

    // -------------------------------------------------------------------------
    // Effects & Handlers
    // -------------------------------------------------------------------------
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
            newValue = `${year}-${month}-${day}T${time}:00`;
        }

        if (name !== cell.name || newValue !== cell.value) {
            // Must return a distinct Cell instance for onSave
            onSave?.(new Cell({ ...cell, name, value: newValue }));
        }
    };

    // -------------------------------------------------------------------------
    // Render Helper: Auto-Width Input via Grid Stack
    // -------------------------------------------------------------------------
    const renderAutoWidthInput = (
        value: string,
        onChange: (e: React.ChangeEvent<HTMLInputElement>) => void,
        placeholder: string = "",
        ariaLabel: string = "",
        className: string = "",
        onClick?: () => void
    ) => {
        // Base styling for seamless look
        const inputBaseClass = "bg-transparent border-none outline-none text-white transition-all duration-300 text-left focus:ring-0 p-0 m-0 font-inherit leading-none";

        return (
            <div className="inline-grid items-center p-0 m-0">
                {/* 
                  Grid Stack Trick:
                  1. Input and Span occupy col-1 / row-1
                  2. Span is invisible but sets the grid width based on content
                  3. Input fills the grid width (w-full) but is allowed to shrink (min-w-0)
                  
                  IMPORTANT: 'min-w-0' is critical to prevent the input from defaulting to ~150px
                */}
                <input
                    type="text"
                    value={value}
                    onChange={onChange}
                    onBlur={handleBlur}
                    placeholder={placeholder}
                    aria-label={ariaLabel}
                    className={cn(inputBaseClass, "col-start-1 row-start-1 w-full min-w-0", className)}
                    onClick={onClick}
                />
                <span className={cn(inputBaseClass, "col-start-1 row-start-1 invisible whitespace-pre px-0 pointer-events-none", className)}>
                    {value || placeholder}
                </span>
            </div>
        );
    };

    // -------------------------------------------------------------------------
    // Component Render
    // -------------------------------------------------------------------------
    return (
        <div
            data-testid="time-cell"
            className="flex flex-col gap-[2px] items-start justify-start w-full"
        >
            {/* Title Row */}
            {renderAutoWidthInput(
                name,
                (e) => setName(e.target.value),
                "Entry Title",
                "Name",
                "font-medium text-[14px] text-white placeholder:text-white/40"
            )}

            {/* DateTime Row (Side-by-side) */}
            <div className="flex gap-[2px] items-center flex-wrap">
                {renderAutoWidthInput(
                    date,
                    (e) => setDate(e.target.value),
                    "",
                    "Date",
                    "font-normal text-[18px] text-white",
                    () => dateInputRef.current?.showPicker()
                )}
                {renderAutoWidthInput(
                    time,
                    (e) => setTime(e.target.value),
                    "",
                    "Time",
                    "font-normal text-[18px] text-white",
                    () => timeInputRef.current?.showPicker()
                )}
            </div>

            {/* Hidden Built-in Pickers for Browser Feature Support */}
            <input
                type="date"
                ref={dateInputRef}
                className="sr-only"
                onChange={(e) => {
                    setDate(e.target.value);
                    handleBlur();
                }}
                tabIndex={-1}
            />
            <input
                type="time"
                ref={timeInputRef}
                className="sr-only"
                onChange={(e) => {
                    setTime(e.target.value);
                    handleBlur();
                }}
                tabIndex={-1}
            />
        </div>
    );
};
