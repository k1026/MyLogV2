'use client';

import React, { createContext, useContext, ReactNode, useState, useEffect, useCallback } from 'react';
import { RarityCalculator } from '../lib/rarity/RarityCalculator';
import { CellRepository } from '../lib/db/operations';

interface RarityContextType {
    rarityData: Map<string, number>;
    isCalculating: boolean;
    calculateAndUpdate: () => Promise<void>;
}

const RarityContext = createContext<RarityContextType | undefined>(undefined);

const STORAGE_KEY = 'mylog_rarity_data_v2';

export function RarityProvider({ children }: { children: ReactNode }) {
    const [rarityData, setRarityData] = useState<Map<string, number>>(new Map());
    const [isCalculating, setIsCalculating] = useState(false);

    const calculateAndUpdate = useCallback(async () => {
        setIsCalculating(true);
        try {
            // 仕様 9.1: 最新3000件を取得
            const cells = await CellRepository.getRange(0, 3000);
            const newRarity = RarityCalculator.calculateRarity(cells);

            setRarityData(newRarity);

            // 仕様 9.3: localStorageに保存 (Mapは直接JSON化できないので配列に変換)
            localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(newRarity.entries())));
        } catch (e) {
            console.error('Rarity calculation failed', e);
        } finally {
            setIsCalculating(false);
        }
    }, []);

    // 仕様 9.3: 起動直後にlocalStorageから読み込み、最新データを再計算する
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const parsed = JSON.parse(saved) as [string, number][];
                setRarityData(new Map(parsed));
            } catch (e) {
                console.error('Failed to parse rarity data', e);
            }
        }
        // バックグラウンドで計算開始
        calculateAndUpdate();
    }, [calculateAndUpdate]);

    const value: RarityContextType = {
        rarityData,
        isCalculating,
        calculateAndUpdate,
    };

    return <RarityContext.Provider value={value}>{children}</RarityContext.Provider>;
}

export function useRarity() {
    const context = useContext(RarityContext);
    if (context === undefined) {
        throw new Error('useRarity must be used within a RarityProvider');
    }
    return context;
}
