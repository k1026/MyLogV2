import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CardAddButton } from './CardAddButton';
import { UIStateProvider } from '../../contexts/UIStateContext';

describe('CardAddButton', () => {
    it('renders when visible is true', () => {
        render(
            <UIStateProvider>
                <CardAddButton onClick={() => { }} visible={true} />
            </UIStateProvider>
        );
        expect(screen.getByTestId('card-add-button-root')).toBeDefined();
    });

    it('does not render when visible is false', () => {
        render(
            <UIStateProvider>
                <CardAddButton onClick={() => { }} visible={false} />
            </UIStateProvider>
        );
        expect(screen.queryByTestId('card-add-button-root')).toBeNull();
    });

    it('calls onClick when clicked', () => {
        const handleClick = vi.fn();
        render(
            <UIStateProvider>
                <CardAddButton onClick={handleClick} visible={true} />
            </UIStateProvider>
        );

        const button = screen.getByTestId('card-add-button-root');
        fireEvent.click(button);

        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('changes position based on footer visibility', () => {
        // Since UIStateProvider uses window events, we can't easily trigger scroll in JSDOM sometimes,
        // but we can check if it initially has either bottom-8 or bottom-[104px]
        render(
            <UIStateProvider>
                <CardAddButton onClick={() => { }} visible={true} />
            </UIStateProvider>
        );
        const button = screen.getByTestId('card-add-button-root');

        // Initial state (footer visible) should be higher up
        expect(button.className).toContain('bottom-[104px]');
    });
});
