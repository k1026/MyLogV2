export type FilterAttribute = 'Text' | 'Task' | 'Remove';
export type FilterTarget = 'both' | 'name' | 'value';

export interface FilterSettings {
    attributes: FilterAttribute[];
    keywords: {
        include: string[];
        exclude: string[];
        target: FilterTarget;
    };
    dateRange: {
        from: string | null; // ISO date string or similar
        to: string | null;
    };
}

export const DEFAULT_FILTER_SETTINGS: FilterSettings = {
    attributes: ['Text', 'Task'],
    keywords: {
        include: [],
        exclude: [],
        target: 'both',
    },
    dateRange: {
        from: null,
        to: null,
    },
};
