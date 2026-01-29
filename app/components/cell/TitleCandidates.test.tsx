import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TitleCandidates } from './TitleCandidates';
import { EstimationCandidate } from '@/app/lib/services/estimation/types';

describe('TitleCandidates', () => {
    const mockCandidates: EstimationCandidate[] = [
        { title: 'Test 1', score: 10, details: { seqScore: 5, timeScore: 3, locScore: 2 } },
        { title: 'Test 2', score: 8, details: { seqScore: 4, timeScore: 2, locScore: 2 } },
    ];

    it('候補が表示されること', () => {
        render(<TitleCandidates candidates={mockCandidates} onSelect={() => { }} />);
        expect(screen.getByText('Test 1')).toBeDefined();
        expect(screen.getByText('Test 2')).toBeDefined();
    });

    it('候補をタップすると onSelect が呼ばれること', () => {
        const onSelect = vi.fn();
        render(<TitleCandidates candidates={mockCandidates} onSelect={onSelect} />);

        const chip = screen.getByText('Test 1');
        fireEvent.click(chip);

        expect(onSelect).toHaveBeenCalledWith('Test 1');
    });

    it('候補が空の場合は何も表示されないこと', () => {
        const { container } = render(<TitleCandidates candidates={[]} onSelect={() => { }} />);
        expect(container.firstChild).toBeNull();
    });
});
