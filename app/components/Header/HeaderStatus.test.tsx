import { render, screen } from '@testing-library/react';
import { HeaderStatus } from './HeaderStatus';
import { useLocation } from '../../contexts/LocationContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import React from 'react';

// Mock the context
vi.mock('../../contexts/LocationContext', () => ({
    useLocation: vi.fn()
}));

// Mock lucide with simple components to pass tests
// Using props in mock seems to cause issues in this environment, so we use simple placeholders
vi.mock('lucide-react', () => ({
    MapPin: () => <div data-testid="MapPin" />,
    Loader2: () => <div data-testid="Loader2" />,
    MapPinOff: () => <div data-testid="MapPinOff" />
}));

describe('HeaderStatus Visual Specs', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    const setup = (status: string) => {
        (useLocation as any).mockReturnValue({
            status: status,
            toggleLocation: vi.fn()
        });
        render(<HeaderStatus cardCount={10} cellCount={20} />);
    };

    it('Active: displays correct button styles (purple icon implied)', () => {
        setup('active');
        const button = screen.getByTitle('Location: active');

        // Check button does NOT have background
        expect(button.className).not.toContain('bg-purple-100');
        // Check button text color (icon lines)
        expect(button.className).toContain('text-slate-500');

        // Icon presence
        expect(screen.getByTestId('MapPin')).toBeInTheDocument();
    });

    it('Error: displays correct button styles', () => {
        setup('error');
        const button = screen.getByTitle('Location: error');

        expect(button.className).not.toContain('bg-red-500');
        expect(button.className).toContain('text-red-500');
        expect(screen.getByTestId('MapPinOff')).toBeInTheDocument();
    });

    it('Loading: displays correct button styles', () => {
        setup('loading');
        const button = screen.getByTitle('Location: loading');

        expect(button.className).not.toContain('bg-white');
        expect(button.className).toContain('text-slate-400');
        expect(screen.getByTestId('Loader2')).toBeInTheDocument();
    });

    it('Idle: displays correct button styles', () => {
        setup('idle');
        const button = screen.getByTitle('Location: idle');

        expect(button.className).not.toContain('bg-white');
        expect(button.className).toContain('text-slate-400');
        expect(screen.getByTestId('MapPin')).toBeInTheDocument();
    });
});
