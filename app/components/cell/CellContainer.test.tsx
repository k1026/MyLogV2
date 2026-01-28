import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CellContainer } from './CellContainer';
import { CellAttribute, Cell } from '@/app/lib/models/cell';
import { RarityProvider } from '@/app/contexts/RarityContext';

describe('CellContainer', () => {
    const timeCell: Cell = {
        id: '1',
        attribute: CellAttribute.Time,
        name: 'Time',
        value: new Date().toISOString(),
        geo: null,
        remove: null,
    };

    const textCell: Cell = {
        id: '2',
        attribute: CellAttribute.Text,
        name: 'Text',
        value: 'Hello',
        geo: null,
        remove: null,
    };

    it('Timeセルの場合、背景色が透明であること', () => {
        render(
            <RarityProvider>
                <CellContainer cell={timeCell} />
            </RarityProvider>
        );
        const container = screen.getByTestId('cell-container');
        expect(container.style.backgroundColor).toBe('transparent');
    });

    it('Textセルの場合、デフォルト背景色が白系であること', () => {
        render(
            <RarityProvider>
                <CellContainer cell={textCell} />
            </RarityProvider>
        );
        const container = screen.getByTestId('cell-container');
        // 'rgba(255, 255, 255, 0.8)' is expected
        expect(container.style.backgroundColor).toContain('255, 255, 255');
    });
});
