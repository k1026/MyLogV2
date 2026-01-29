import '@testing-library/jest-dom';
import 'fake-indexeddb/auto';
import { vi } from 'vitest';

// JSDOM で未実装の window メソッドのモック
window.alert = vi.fn();
window.confirm = vi.fn(() => true);
window.URL.createObjectURL = vi.fn(() => 'blob:url');
window.URL.revokeObjectURL = vi.fn();

// ナビゲーション警告を抑止するための a.click() モック
const originalCreateElement = document.createElement;
document.createElement = vi.fn().mockImplementation((tagName) => {
    const element = originalCreateElement.call(document, tagName);
    if (tagName.toLowerCase() === 'a') {
        (element as any).click = vi.fn();
    }
    return element;
});

// ResizeObserver のモック
global.ResizeObserver = class ResizeObserver {
    observe = vi.fn();
    unobserve = vi.fn();
    disconnect = vi.fn();
};

// scrollTo のモック
Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
    configurable: true,
    value: vi.fn(),
});

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
