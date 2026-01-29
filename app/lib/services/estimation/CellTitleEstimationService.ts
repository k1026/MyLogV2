import { Cell, CellAttribute } from '../../models/cell';
import { CellRepository } from '../../db/operations';
import { TransitionMap, TimeMap, LocationMap, EstimationContext, EstimationCandidate } from './types';
import { getGeoKey, getTimeSlot } from './utils';

export class CellTitleEstimationService {
    private static instance: CellTitleEstimationService;
    private transitionMap: TransitionMap = {};
    private timeMap: TimeMap = {};
    private locationMap: LocationMap = {};

    private constructor() { }

    public static getInstance(): CellTitleEstimationService {
        if (!CellTitleEstimationService.instance) {
            CellTitleEstimationService.instance = new CellTitleEstimationService();
        }
        return CellTitleEstimationService.instance;
    }

    public async learn(cells: Cell[]): Promise<void> {
        if (cells.length === 0) return;

        // Sort by ID ascending (Chronological)
        // IDs are "${timestamp}-${random}" so string sort works for chronology
        const sorted = [...cells].sort((a, b) => a.id.localeCompare(b.id));

        for (let i = 0; i < sorted.length; i++) {
            const cell = sorted[i];
            const title = cell.name;
            if (!title) continue;

            // 1. Time Map Update
            // cell.id starts with timestamp
            const timestamp = parseInt(cell.id.split('-')[0]);
            if (!isNaN(timestamp)) {
                const hour = getTimeSlot(new Date(timestamp));
                if (!this.timeMap[hour]) this.timeMap[hour] = {};
                this.timeMap[hour][title] = (this.timeMap[hour][title] || 0) + 1;
            }

            // 2. Location Map Update
            const geoKey = getGeoKey(cell.geo);
            if (geoKey) {
                if (!this.locationMap[geoKey]) this.locationMap[geoKey] = {};
                this.locationMap[geoKey][title] = (this.locationMap[geoKey][title] || 0) + 1;
            }

            // 3. Transition Map Update
            if (i > 0) {
                const prevCell = sorted[i - 1];
                const prevTitle = prevCell.name;
                if (prevTitle) {
                    if (!this.transitionMap[prevTitle]) this.transitionMap[prevTitle] = {};
                    this.transitionMap[prevTitle][title] = (this.transitionMap[prevTitle][title] || 0) + 1;
                }
            }
        }
    }

    public estimate(context: EstimationContext): EstimationCandidate[] {
        const scores: Record<string, { seq: number, time: number, loc: number }> = {};

        // Helper to add score
        const addScore = (title: string, type: 'seq' | 'time' | 'loc', value: number) => {
            if (!scores[title]) scores[title] = { seq: 0, time: 0, loc: 0 };
            scores[title][type] += value;
        };

        // 1. Sequence Score
        // History: [Latest(k=1), Older(k=2)...]
        context.historyTitles.forEach((prevTitle, index) => {
            // History index 0 is k=1 (Prev)
            const k = index + 1;
            let weight = 0.1;
            if (k === 1) weight = 1.0;
            else if (k === 2) weight = 0.8;
            else if (k === 3) weight = 0.6;
            else if (k === 4) weight = 0.4;
            else if (k === 5) weight = 0.2;

            if (this.transitionMap[prevTitle]) {
                for (const [nextTitle, count] of Object.entries(this.transitionMap[prevTitle])) {
                    addScore(nextTitle, 'seq', count * weight);
                }
            }
        });

        // 2. Time Score
        const timeWeight = 0.5;
        if (this.timeMap[context.currentHour]) {
            for (const [title, count] of Object.entries(this.timeMap[context.currentHour])) {
                addScore(title, 'time', count * timeWeight);
            }
        }

        // 3. Location Score
        const locWeight = 0.5;
        if (context.geoKey && this.locationMap[context.geoKey]) {
            for (const [title, count] of Object.entries(this.locationMap[context.geoKey])) {
                addScore(title, 'loc', count * locWeight);
            }
        }

        // Convert to array and sort
        const candidates: EstimationCandidate[] = Object.entries(scores).map(([title, s]) => ({
            title,
            score: s.seq + s.time + s.loc,
            details: {
                seqScore: s.seq,
                timeScore: s.time,
                locScore: s.loc
            }
        }));

        return candidates.sort((a, b) => b.score - a.score).slice(0, 5); // Return top 5
    }

    public async syncWithDB(): Promise<void> {
        // Fetch recent 3000 cells (Newest first)
        const recentCells = await CellRepository.getRecentCells(3000, [CellAttribute.Card, CellAttribute.Time]);

        // learn() handles sorting, so we can pass as is. 
        // But learn() expects list to build transitions. 
        // Passing them as valid batch is fine.
        await this.learn(recentCells);
    }

    // For testing/debug
    public getMaps() {
        return {
            transition: this.transitionMap,
            time: this.timeMap,
            location: this.locationMap
        };
    }

    // Helper to reset internal state for testing
    public clear() {
        this.transitionMap = {};
        this.timeMap = {};
        this.locationMap = {};
    }
}
