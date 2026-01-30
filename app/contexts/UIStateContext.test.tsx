'use client';

import React from 'react';
import { render, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { UIStateProvider, useUIState } from './UIStateContext';

const TestComponent = () => {
    const {
        sortOrder,
        toggleSortOrder,
        viewMode,
        toggleViewMode,
        filterState,
        toggleFilterState,
        headerVisible,
        setHeaderVisible,
        footerVisible,
        setFooterVisible,
        handleScroll
    } = useUIState();

    return (
        <div>
            <div data-testid="sort-order">{sortOrder}</div>
            <button data-testid="toggle-sort" onClick={toggleSortOrder}>Toggle Sort</button>

            <div data-testid="view-mode">{viewMode}</div>
            <button data-testid="toggle-view" onClick={toggleViewMode}>Toggle View</button>

            <div data-testid="filter-state">{filterState}</div>
            <button data-testid="toggle-filter" onClick={toggleFilterState}>Toggle Filter</button>

            <div data-testid="header-visible">{headerVisible ? 'visible' : 'hidden'}</div>
            <button data-testid="set-header-hide" onClick={() => setHeaderVisible(false)}>Hide Header</button>

            <div data-testid="footer-visible">{footerVisible ? 'visible' : 'hidden'}</div>
            <button data-testid="set-footer-hide" onClick={() => setFooterVisible(false)}>Hide Footer</button>

            <button data-testid="scroll-down" onClick={() => handleScroll(100)}>Scroll Down</button>
            <button data-testid="scroll-up" onClick={() => handleScroll(0)}>Scroll Up</button>
        </div>
    );
};

describe('UIStateContext', () => {
    it('初期状態が正しいこと', () => {
        const { getByTestId } = render(
            <UIStateProvider>
                <TestComponent />
            </UIStateProvider>
        );
        expect(getByTestId('sort-order').textContent).toBe('desc');
        expect(getByTestId('view-mode').textContent).toBe('list');
        expect(getByTestId('filter-state').textContent).toBe('off');
    });

    it('toggleSortOrder でソート順が切り替わること', () => {
        const { getByTestId } = render(
            <UIStateProvider>
                <TestComponent />
            </UIStateProvider>
        );

        act(() => {
            getByTestId('toggle-sort').click();
        });
        expect(getByTestId('sort-order').textContent).toBe('asc');

        act(() => {
            getByTestId('toggle-sort').click();
        });
        expect(getByTestId('sort-order').textContent).toBe('desc');
    });

    it('toggleViewMode でビューモードが切り替わること', () => {
        const { getByTestId } = render(
            <UIStateProvider>
                <TestComponent />
            </UIStateProvider>
        );

        act(() => {
            getByTestId('toggle-view').click();
        });
        expect(getByTestId('view-mode').textContent).toBe('grid');

        act(() => {
            getByTestId('toggle-view').click();
        });
        expect(getByTestId('view-mode').textContent).toBe('list');
    });

    it('toggleFilterState でフィルタ状態が循環（off -> on -> disabled -> off）すること', () => {
        const { getByTestId } = render(
            <UIStateProvider>
                <TestComponent />
            </UIStateProvider>
        );

        // Initial: off
        expect(getByTestId('filter-state').textContent).toBe('off');

        // click 1 -> on
        act(() => {
            getByTestId('toggle-filter').click();
        });
        expect(getByTestId('filter-state').textContent).toBe('on');

        // click 2 -> disabled
        act(() => {
            getByTestId('toggle-filter').click();
        });
        expect(getByTestId('filter-state').textContent).toBe('disabled');

        // click 3 -> off
        act(() => {
            getByTestId('toggle-filter').click();
        });
        expect(getByTestId('filter-state').textContent).toBe('off');
    });

    it('ヘッダーとフッターの表示状態が更新されること', () => {
        const { getByTestId } = render(
            <UIStateProvider>
                <TestComponent />
            </UIStateProvider>
        );

        // Initial: visible
        expect(getByTestId('header-visible').textContent).toBe('visible');
        expect(getByTestId('footer-visible').textContent).toBe('visible');

        // Hide header
        act(() => {
            getByTestId('set-header-hide').click();
        });
        expect(getByTestId('header-visible').textContent).toBe('hidden');

        // Hide footer
        act(() => {
            getByTestId('set-footer-hide').click();
        });
        expect(getByTestId('footer-visible').textContent).toBe('hidden');
    });

    it('handleScroll でスクロール量に応じてヘッダーとフッターが非表示になること', () => {
        const { getByTestId } = render(
            <UIStateProvider>
                <TestComponent />
            </UIStateProvider>
        );

        // 下方にスクロール (閾値 50 を超える 100)
        act(() => {
            getByTestId('scroll-down').click();
        });

        // 空実装なので、現時点では visible のままであるはず（テストは失敗させる）
        expect(getByTestId('header-visible').textContent).toBe('hidden');
        expect(getByTestId('footer-visible').textContent).toBe('hidden');

        // 上方にスクロール
        act(() => {
            getByTestId('scroll-up').click();
        });
        expect(getByTestId('header-visible').textContent).toBe('visible');
        expect(getByTestId('footer-visible').textContent).toBe('visible');
    });
});
