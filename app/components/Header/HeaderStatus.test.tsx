import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { HeaderStatus } from './HeaderStatus';
import { useLocation } from '../../contexts/LocationContext';
import { vi, describe, it, expect, beforeEach } from 'vitest';

vi.mock('../../contexts/LocationContext', () => ({
    useLocation: vi.fn()
}));

describe('HeaderStatus Visual Specs', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const setup = (status: 'active' | 'loading' | 'error' | 'idle') => {
        vi.mocked(useLocation).mockReturnValue({
            status,
            toggleLocation: vi.fn(),
            location: null,
            geoString: null,
            error: null
        });
        const { container } = render(<HeaderStatus cardCount={10} cellCount={20} />);
        return { container };
    };

    it('Active: displays correct styles', () => {
        setup('active');
        const button = screen.getByTitle('Location: active');
        expect(button).toHaveClass('text-slate-500');
        const icon = screen.getByText('location_on');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('text-purple-300');
    });

    it('Error: displays correct styles', () => {
        setup('error');
        const button = screen.getByTitle('Location: error');
        expect(button).toHaveClass('text-red-500');
        const icon = screen.getByText('location_off');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('text-red-500');
    });

    it('Loading: displays correct styles', () => {
        setup('loading');
        const button = screen.getByTitle('Location: loading');
        expect(button).toHaveClass('text-slate-400', 'cursor-wait');
        const icon = screen.getByText('progress_activity');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('animate-spin');
    });

    it('Idle: displays correct styles', () => {
        setup('idle');
        const button = screen.getByTitle('Location: idle');
        expect(button).toHaveClass('text-slate-400');
        const icon = screen.getByText('location_on');
        expect(icon).toBeInTheDocument();
        expect(icon).toHaveClass('text-white');
    });

    it('displays card and cell counts', () => {
        setup('active');
        expect(screen.getByText('CARDS: 10')).toBeInTheDocument();
        expect(screen.getByText('CELLS: 20')).toBeInTheDocument();
    });
});
