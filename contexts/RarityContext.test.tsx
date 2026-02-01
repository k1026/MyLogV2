'use client';

import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RarityProvider, useRarity } from './RarityContext';
import { CellRepository } from '../lib/db/operations';
import { RarityCalculator } from '../lib/rarity/RarityCalculator';

// Mocks
vi.mock('../lib/db/operations');
vi.mock('../lib/rarity/RarityCalculator');

// Test component to access the hook
const TestComponent = () => {
    const { rarityData, isCalculating, calculateAndUpdate } = useRarity();
    return (
        <div>
            <div data-testid="is-calculating">{isCalculating.toString()}</div>
            <div data-testid="rarity-size">{rarityData.size}</div>
            <button data-testid="calc-button" onClick={() => calculateAndUpdate()}>Calc</button>
        </div>
    );
};

describe('RarityContext', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        localStorage.clear();
    });

    it('初期状態から計算完了までの状態遷移が正しいこと', async () => {
        const mockCells = [] as any;
        const mockRarity = new Map();
        vi.mocked(CellRepository.getRange).mockResolvedValue(mockCells);
        vi.mocked(RarityCalculator.calculateRarity).mockReturnValue(mockRarity);

        const { getByTestId } = await act(async () => render(
            <RarityProvider>
                <TestComponent />
            </RarityProvider>
        ));

        // Wait for initial background calculation to complete to avoid act warning
        await waitFor(() => {
            expect(getByTestId('is-calculating').textContent).toBe('false');
        });
    });

    it('calculateAndUpdateが呼ばれるとRepositoryからデータを取得し計算すること', async () => {
        const mockCells = [{ id: '1', name: 'A', attribute: 'Text' }] as any;
        const mockRarity = new Map([['A', 1.0]]);

        vi.mocked(CellRepository.getRange).mockResolvedValue(mockCells);
        vi.mocked(RarityCalculator.calculateRarity).mockReturnValue(mockRarity);

        const { getByTestId } = await act(async () => render(
            <RarityProvider>
                <TestComponent />
            </RarityProvider>
        ));

        // Wait for initial calculation to finish
        await waitFor(() => {
            expect(getByTestId('is-calculating').textContent).toBe('false');
        });

        await act(async () => {
            getByTestId('calc-button').click();
        });

        await waitFor(() => {
            expect(getByTestId('rarity-size').textContent).toBe('1');
        });

        expect(CellRepository.getRange).toHaveBeenCalled();
        expect(localStorage.getItem('mylog_rarity_data_v2')).not.toBeNull();
    });

    it('localStorageに以前のデータがある場合は起動時にロードすること', async () => {
        const savedData = [['A', 0.5]];
        localStorage.setItem('mylog_rarity_data_v2', JSON.stringify(savedData));

        const { getByTestId } = await act(async () => render(
            <RarityProvider>
                <TestComponent />
            </RarityProvider>
        ));

        // ロードは非同期（useEffect）で行われる想定
        await waitFor(() => {
            expect(getByTestId('rarity-size').textContent).toBe('1');
        });
    });
});
