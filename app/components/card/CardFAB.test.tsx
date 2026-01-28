import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { CardFAB } from './CardFAB';
import { CellAttribute } from '@/app/lib/models/cell';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('CardFAB', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('renders the FAB button', () => {
        render(<CardFAB onAdd={vi.fn()} />);
        expect(screen.getByRole('button', { name: /add/i })).toBeInTheDocument();
    });

    it('calls onAdd with Text (default) when clicked quickly (< 10ms)', () => {
        const onAdd = vi.fn();
        render(<CardFAB onAdd={onAdd} />);

        const fab = screen.getByRole('button', { name: /add/i });
        fireEvent.mouseDown(fab);

        // Advance only 5ms
        act(() => {
            vi.advanceTimersByTime(5);
        });

        fireEvent.mouseUp(fab);

        expect(onAdd).toHaveBeenCalledWith(CellAttribute.Text);
    });

    it('shows pie menu on long press (>= 10ms)', () => {
        render(<CardFAB onAdd={vi.fn()} />);

        const fab = screen.getByRole('button', { name: /add/i });
        fireEvent.mouseDown(fab);

        act(() => {
            vi.advanceTimersByTime(15); // > 10ms
        });

        // Check for menu items by test-id or text
        // Based on spec 5.3.2.4.2: Text (left), Task (up)
        expect(screen.getByTestId('fab-menu-text')).toBeInTheDocument();
        expect(screen.getByTestId('fab-menu-task')).toBeInTheDocument();
    });

    it('adds Task when dragging to Task item and releasing', () => {
        const onAdd = vi.fn();
        render(<CardFAB onAdd={onAdd} />);

        const fab = screen.getByRole('button', { name: /add/i });
        fireEvent.mouseDown(fab);

        act(() => {
            vi.advanceTimersByTime(15);
        });

        const taskItem = screen.getByTestId('fab-menu-task');

        // Simulate dragging onto the task item
        fireEvent.mouseEnter(taskItem);
        fireEvent.mouseUp(taskItem);

        expect(onAdd).toHaveBeenCalledWith(CellAttribute.Task);
    });

    it('adds Text when dragging to Text item and releasing', () => {
        const onAdd = vi.fn();
        render(<CardFAB onAdd={onAdd} />);

        const fab = screen.getByRole('button', { name: /add/i });
        fireEvent.mouseDown(fab);

        act(() => {
            vi.advanceTimersByTime(15);
        });

        const textItem = screen.getByTestId('fab-menu-text');

        fireEvent.mouseEnter(textItem);
        fireEvent.mouseUp(textItem);

        expect(onAdd).toHaveBeenCalledWith(CellAttribute.Text);
    });

    it('just closes menu when releasing without selecting (on the FAB itself)', () => {
        const onAdd = vi.fn();
        render(<CardFAB onAdd={onAdd} />);

        const fab = screen.getByRole('button', { name: /add/i });
        fireEvent.mouseDown(fab);

        act(() => {
            vi.advanceTimersByTime(15);
        });

        expect(screen.getByTestId('fab-menu-text')).toBeInTheDocument();

        // Release on FAB itself (no mouseEnter on items)
        fireEvent.mouseUp(fab);

        expect(onAdd).not.toHaveBeenCalled();
        expect(screen.queryByTestId('fab-menu-text')).not.toBeInTheDocument();
    });
});
