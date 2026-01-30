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
            toggleLocation: vi.fn()
        });
        const { container } = render(<HeaderStatus cardCount={10} cellCount={20} />);
        return { container };
    };

    it('Active: displays correct styles', () => {
        const { container } = setup('active');
        const button = screen.getByTitle('Location: active');
        expect(button).toHaveClass('text-slate-500');
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('fill-purple-300');
    });

    it('Error: displays correct styles', () => {
        const { container } = setup('error');
        const button = screen.getByTitle('Location: error');
        expect(button).toHaveClass('text-red-500');
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('fill-red-500');
    });

    it('Loading: displays correct styles', () => {
        const { container } = setup('loading');
        const button = screen.getByTitle('Location: loading');
        expect(button).toHaveClass('text-slate-400', 'cursor-wait');
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('animate-spin');
    });

    it('Idle: displays correct styles', () => {
        const { container } = setup('idle');
        const button = screen.getByTitle('Location: idle');
        expect(button).toHaveClass('text-slate-400');
        const svg = container.querySelector('svg');
        expect(svg).toBeInTheDocument();
        expect(svg).toHaveClass('fill-white');
    });

    it('displays card and cell counts', () => {
        setup('active');
        expect(screen.getByText('CARDS: 10')).toBeInTheDocument();
        expect(screen.getByText('CELLS: 20')).toBeInTheDocument();
    });
});
