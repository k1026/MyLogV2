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
        totalCardCount: 100, // totalCardCount is still passed to Header but maybe not used by HeaderStatus
        cellCount: 50,
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

    it('renders card and cell counts correctly in vertical layout', () => {
        renderHeader();
        // 仕様: カード枚数が上、セル数が下
        const statusArea = screen.getByText(/10/i).closest('.flex-col');
        expect(statusArea).toBeInTheDocument();
        expect(screen.getByText(/10/i)).toBeInTheDocument();
        expect(screen.getByText(/50/i)).toBeInTheDocument();
        // text-slate-500が指定されていることの確認
        expect(screen.getByText(/10/i).parentElement).toHaveClass('text-slate-500');
    });

    it('renders layout in correct order: Status -> Title -> Actions', () => {
        renderHeader();
        const headerContainer = screen.getByTestId('app-header').querySelector('.relative.max-w-7xl');
        const children = headerContainer?.children;

        expect(children).toHaveLength(3);
        // HeaderStatus (contains status icon or count)
        expect(children![0]).toContainElement(screen.getByText(/10/i));
        // HeaderTitle (contains "MyLog")
        expect(children![1]).toHaveTextContent('MyLog');
        // HeaderActions (contains buttons)
        expect(children![2]).toContainElement(screen.getByLabelText('Random Pick'));
    });

    it('renders version number with 12px size', () => {
        renderHeader();
        // 仕様: 12px (text-xs is 12px in tailwind default, though spec says 12px)
        const version = screen.getByText(/v\d+\.\d+\.\d+/);
        expect(version).toHaveClass('text-[12px]');
    });

    it('tool buttons have no border or shadow (transparent/flat design)', () => {
        renderHeader();
        const randomBtn = screen.getByLabelText('Random Pick');
        const dbBtn = screen.getByLabelText('Database Status');

        // 仕様: 通常時：グレー、装飾：境界線：なし、影：なし
        // 現状の実装は border border-slate-200 shadow-sm があるはずなので失敗する
        expect(randomBtn).not.toHaveClass('border');
        expect(randomBtn).not.toHaveClass('shadow-sm');
        expect(dbBtn).not.toHaveClass('border');
        expect(dbBtn).not.toHaveClass('shadow-sm');
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
        const button = screen.getByLabelText('Database Status');
        fireEvent.click(button);
        expect(defaultProps.onDbOpen).toHaveBeenCalled();
    });
});
