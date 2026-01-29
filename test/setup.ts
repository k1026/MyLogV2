import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { vi } from 'vitest';

// モック: FilterContext
vi.mock('@/app/contexts/FilterContext', () => ({
    useFilter: () => ({
        filterSettings: {
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
        },
        setAttributes: vi.fn(),
        setIncludeKeywords: vi.fn(),
        setExcludeKeywords: vi.fn(),
        setKeywordTarget: vi.fn(),
        setDateRange: vi.fn(),
        resetFilter: vi.fn(),
    }),
    FilterProvider: ({ children }: { children: React.ReactNode }) => children,
}));
