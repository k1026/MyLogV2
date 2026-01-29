import { CellAttribute } from '../../models/cell';

// 3.1 Transition Map
// Key: PrevTitle, Value: { NextTitle: Count }
export type TransitionMap = Record<string, Record<string, number>>;

// 3.2 Time Map
// Key: Hour(0-23), Value: { Title: Count }
export type TimeMap = Record<number, Record<string, number>>;

// 3.3 Location Map
// Key: "Lat_Lon", Value: { Title: Count }
export type LocationMap = Record<string, Record<string, number>>;

export interface EstimationContext {
    historyTitles: string[]; // 直近の履歴(新しい順: index 0 is latest)
    currentHour: number;
    geoKey: string | null;
}

export interface EstimationCandidate {
    title: string;
    score: number;
    details: {
        seqScore: number;
        timeScore: number;
        locScore: number;
    }
}
