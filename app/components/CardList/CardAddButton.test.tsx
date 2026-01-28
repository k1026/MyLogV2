import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CardAddButton } from './CardAddButton';

describe('CardAddButton', () => {
    it('renders when visible is true', () => {
        render(<CardAddButton onClick={() => { }} visible={true} />);
        expect(screen.getByTestId('card-add-button-root')).toBeDefined();
    });

    it('does not render when visible is false', () => {
        render(<CardAddButton onClick={() => { }} visible={false} />);
        expect(screen.queryByTestId('card-add-button-root')).toBeNull();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(<CardAddButton onClick={handleClick} visible={true} />);

        const button = screen.getByTestId('card-add-button-root');
        fireEvent.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('has correct styles and icon', () => {
        render(<CardAddButton onClick={() => { }} visible={true} />);
        const button = screen.getByTestId('card-add-button-root');

        // Final implementation should have these classes
        // For now, it will fail style check
        expect(button.className).toContain('fixed');
        expect(button.className).toContain('bottom-8');
        expect(button.className).toContain('right-8');
        expect(button.className).toContain('bg-white');

        // Icon check (should have a plus icon/svg)
        const icon = screen.getByTestId('plus-icon');
        expect(icon).toBeDefined();
    });
});
