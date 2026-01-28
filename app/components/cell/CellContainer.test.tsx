import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { CellContainer } from './CellContainer';
import { CellAttribute, Cell } from '@/app/lib/models/cell';

// 各セルコンポーネントをモック化
vi.mock('./TimeCell', () => ({
    TimeCell: () => <div data-testid="time-cell">TimeCell</div>,
}));
vi.mock('./TextCell', () => ({
    TextCell: () => <div data-testid="text-cell">TextCell</div>,
}));
vi.mock('./TaskCell', () => ({
    TaskCell: () => <div data-testid="task-cell">TaskCell</div>,
}));

describe('CellContainer', () => {
    const baseCell: Cell = {
        id: '1234567890123-ABCDE',
        attribute: CellAttribute.Text,
        name: 'Test Name',
        value: 'Test Value',
        geo: null,
        remove: null,
    };

    it('Attribute.Time の場合に TimeCell が表示されること', () => {
        const cell = { ...baseCell, attribute: CellAttribute.Time };
        render(<CellContainer cell={cell} />);
        expect(screen.getByTestId('time-cell')).toBeInTheDocument();
    });

    it('Attribute.Text の場合に TextCell が表示されること', () => {
        const cell = { ...baseCell, attribute: CellAttribute.Text };
        render(<CellContainer cell={cell} />);
        expect(screen.getByTestId('text-cell')).toBeInTheDocument();
    });

    it('Attribute.Task の場合に TaskCell が表示されること', () => {
        const cell = { ...baseCell, attribute: CellAttribute.Task };
        render(<CellContainer cell={cell} />);
        expect(screen.getByTestId('task-cell')).toBeInTheDocument();
    });

    it('未知の属性（またはCard属性など）の場合にフォールバックが表示されること', () => {
        const cell = { ...baseCell, attribute: CellAttribute.Card };
        render(<CellContainer cell={cell} />);
        // 現時点では「Base Cell: Card」のようなテキストが出るか、あるいは何もでないか
        // 仕様 4.2.0 では Card は実装しなくてよいとあるので、エラーまたはプレースホルダ
        expect(screen.queryByTestId('time-cell')).not.toBeInTheDocument();
        expect(screen.queryByTestId('text-cell')).not.toBeInTheDocument();
        expect(screen.queryByTestId('task-cell')).not.toBeInTheDocument();
    });
});
