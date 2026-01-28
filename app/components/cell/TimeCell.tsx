'use client';
import React, { useState, useEffect } from 'react';
import { Cell } from '@/app/lib/models/cell';
import { cn } from '@/app/lib/utils';

interface TimeCellProps {
    cell: Cell;
    onSave?: (cell: Cell) => void;
}

export const TimeCell: React.FC<TimeCellProps> = ({ cell, onSave }) => {
    const [name, setName] = useState(cell.name);

    // ISO 8601 string -> date/time fragments
    const dateObj = new Date(cell.value);
    const initialDate = isNaN(dateObj.getTime()) ? '' : dateObj.toISOString().split('T')[0];
    const initialTime = isNaN(dateObj.getTime()) ? '' : dateObj.toISOString().split('T')[1].slice(0, 5);

    const [date, setDate] = useState(initialDate);
    const [time, setTime] = useState(initialTime);

    useEffect(() => {
        setName(cell.name);
        const d = new Date(cell.value);
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
            // Create new ISO string from date and time
            // Assuming UTC for simplicity or following local if desired.
            // Specification says "年月日選択UIと時刻選択UIにvalueの値表示・編集"
            // we'll try to reconstruct the ISO string.
            const updatedDate = new Date(`${date}T${time}:00.000Z`);
            if (!isNaN(updatedDate.getTime())) {
                newValue = updatedDate.toISOString();
            }
        } else if (!date && !time) {
            // If both date and time are cleared, set value to empty string
            newValue = '';
        } else if (date && !time) {
            // If only date is present, use midnight UTC for that date
            const updatedDate = new Date(`${date}T00:00:00.000Z`);
            if (!isNaN(updatedDate.getTime())) {
                newValue = updatedDate.toISOString();
            }
        } else if (!date && time) {
            // If only time is present, use current date with the specified time
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

    return (
        <div
            data-testid="time-cell"
            onBlur={handleBlur}
            className="flex flex-col gap-3 w-full"
        >
            <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={cn(
                    "bg-transparent border-b border-transparent outline-none w-full transition-colors",
                    "focus:border-purple-400 placeholder:text-white/30"
                )}
            />
            <div className="flex gap-2">
                <div className="flex flex-col flex-1">
                    <label htmlFor={`date-${cell.id}`} className="text-[10px] text-white/50 uppercase">Date</label>
                    <input
                        id={`date-${cell.id}`}
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className={cn(
                            "bg-white/10 p-2 rounded outline-none w-full text-white",
                            "focus:ring-1 focus:ring-purple-400"
                        )}
                    />
                </div>
                <div className="flex flex-col w-32">
                    <label htmlFor={`time-${cell.id}`} className="text-[10px] text-white/50 uppercase">Time</label>
                    <input
                        id={`time-${cell.id}`}
                        type="time"
                        value={time}
                        onChange={(e) => setTime(e.target.value)}
                        className={cn(
                            "bg-white/10 p-2 rounded outline-none w-full text-white",
                            "focus:ring-1 focus:ring-purple-400"
                        )}
                    />
                </div>
            </div>
        </div>
    );
};
