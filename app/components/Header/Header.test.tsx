import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Header } from './Header';
import { LocationProvider } from '../../contexts/LocationContext';
import { UIStateProvider } from '../../contexts/UIStateContext';
import { vi, describe, it, expect } from 'vitest';

// Mock LocationContext since Header might use it
vi.mock('../../contexts/LocationContext', async () => {
    const actual = await vi.importActual('../../contexts/LocationContext');
    return {
        ...actual,
        useLocation: () => ({
            status: 'active',
            toggleLocation: vi.fn(),
        }),
    };
});

describe('Header Component', () => {
    const defaultProps = {
        cardCount: 10,
        totalCardCount: 100,
        onReset: vi.fn(),
        onRandomPick: vi.fn(),
        onDbOpen: vi.fn(),
        isDbLoading: false,
    };

    const renderHeader = (props = defaultProps) => {
        return render(
            <UIStateProvider>
                <Header {...props} />
            </UIStateProvider>
        );
    };

    it('renders card counts correctly', () => {
        renderHeader();
        // improved regex to match flexible spacing/formatting if needed, 
        // but simplest expectation is "Cards: 10 / Total: 100" based on specs
        expect(screen.getByText(/Cards:\s*10/i)).toBeInTheDocument();
        expect(screen.getByText(/Total:\s*100/i)).toBeInTheDocument();
    });

    it('renders title', () => {
        renderHeader();
        expect(screen.getByText('MyLog')).toBeInTheDocument();
    });

    it('calls onReset when title is clicked', () => {
        renderHeader();
        const title = screen.getByText('MyLog');
        fireEvent.click(title);
        expect(defaultProps.onReset).toHaveBeenCalled();
    });

    it('calls onRandomPick when random button is clicked', () => {
        renderHeader();
        const button = screen.getByLabelText('Random Pick');
        fireEvent.click(button);
        expect(defaultProps.onRandomPick).toHaveBeenCalled();
    });

    it('calls onDbOpen when db button is clicked', () => {
        renderHeader();
        const button = screen.getByLabelText('Database Viewer');
        fireEvent.click(button);
        expect(defaultProps.onDbOpen).toHaveBeenCalled();
    });
});
