'use client';

import React from 'react';
import { render, waitFor, act } from '@testing-library/react';
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

    it('初期状態では計算中フラグがfalseで、rarityDataが空であること', () => {
        const { getByTestId } = render(
            <RarityProvider>
                <TestComponent />
            </RarityProvider>
        );
        expect(getByTestId('is-calculating').textContent).toBe('false');
        expect(getByTestId('rarity-size').textContent).toBe('0');
    });

    it('calculateAndUpdateが呼ばれるとRepositoryからデータを取得し計算すること', async () => {
        const mockCells = [{ id: '1', name: 'A', attribute: 'Text' }] as any;
        const mockRarity = new Map([['A', 1.0]]);

        vi.mocked(CellRepository.getRange).mockResolvedValue(mockCells);
        vi.mocked(RarityCalculator.calculateRarity).mockReturnValue(mockRarity);

        const { getByTestId } = render(
            <RarityProvider>
                <TestComponent />
            </RarityProvider>
        );

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

        const { getByTestId } = render(
            <RarityProvider>
                <TestComponent />
            </RarityProvider>
        );

        // ロードは非同期（useEffect）で行われる想定
        await waitFor(() => {
            expect(getByTestId('rarity-size').textContent).toBe('1');
        });
    });
});
