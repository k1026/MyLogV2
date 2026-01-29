import { useCallback } from 'react';
import { CellTitleEstimationService } from '../services/estimation/CellTitleEstimationService';
import { CellRepository } from '../db/operations';
import { Cell, CellAttribute } from '../models/cell';
import { getGeoKey, getTimeSlot } from '../services/estimation/utils';
import { LocationService } from '../services/LocationService';

export function useCellTitleEstimation() {
    // Service is singleton
    const service = CellTitleEstimationService.getInstance();

    const estimate = useCallback(async () => {
        // 1. Build Context
        // History: From DB (Recent 10, Exclude Card/Time)
        // Spec: "DB上の直近10個のセルタイトルを取得。※CardセルとTimeセルは除外"
        const recentCells = await CellRepository.getRecentCells(10, [CellAttribute.Card, CellAttribute.Time]);
        const historyTitles = recentCells.map(c => c.name).filter(n => n); // name must exist

        // Time: Current
        const now = new Date();
        const currentHour = getTimeSlot(now);

        // Location: Current
        const geoStr = LocationService.getInstance().getCurrentGeoString();
        const geoKey = getGeoKey(geoStr);

        // 2. Call Service
        return service.estimate({
            historyTitles,
            currentHour,
            geoKey
        });
    }, []);

    const learn = useCallback(async (cell: Cell) => {
        await service.learn([cell]);
    }, []);

    // Init function to be called at app startup
    const init = useCallback(async () => {
        await service.syncWithDB();
    }, []);

    return { estimate, learn, init };
}
