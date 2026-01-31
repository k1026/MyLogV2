import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Footer } from './Footer';
import { UIStateProvider } from '../../contexts/UIStateContext';
import { describe, it, expect, vi } from 'vitest';

describe('Footer Component', () => {
    const renderFooter = () => {
        return render(
            <UIStateProvider>
                <Footer />
            </UIStateProvider>
        );
    };

    it('renders sort, filter and view mode buttons', () => {
        renderFooter();
        expect(screen.getByTestId('app-footer')).toBeInTheDocument();
        expect(screen.getByLabelText('Sort Options')).toBeInTheDocument();
        expect(screen.getByLabelText('Filter Options')).toBeInTheDocument();
        expect(screen.getByLabelText('View Mode Options')).toBeInTheDocument();
    });

    describe('z-index and pointer-events (Scroll Bug Fix)', () => {
        it('has z-[60] class for z-index order', () => {
            renderFooter();
            const footer = screen.getByTestId('app-footer');
            expect(footer).toHaveClass('z-[60]');
        });

        it('has pointer-events-none on root to allow background scrolling', () => {
            renderFooter();
            const footer = screen.getByTestId('app-footer');
            expect(footer).toHaveClass('pointer-events-none');
        });

        it('has pointer-events-auto on content wrapper to allow interactions', () => {
            renderFooter();
            const footer = screen.getByTestId('app-footer');
            // Background & Content
            const bg = footer.querySelector('.absolute.inset-0');
            const content = footer.querySelector('.relative.max-w-7xl');

            expect(bg).toHaveClass('pointer-events-none');
            expect(content).toHaveClass('pointer-events-auto');
        });
    });
});
