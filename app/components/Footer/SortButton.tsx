import React from 'react';
import { ArrowUpDown } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUIState } from '../../contexts/UIStateContext';
import { FooterButton } from './FooterButton';

export const SortButton: React.FC = () => {
    const { sortOrder, toggleSortOrder } = useUIState();

    return (
        <FooterButton
            icon={<ArrowUpDown size={20} className={cn("transition-transform duration-300", sortOrder === 'asc' && "rotate-180")} />}
            label={sortOrder === 'desc' ? "Newest" : "Oldest"}
            onClick={toggleSortOrder}
            isActive={sortOrder === 'asc'}
        />
    );
};
