import React from 'react';
import { cn } from '../../lib/utils';
import { useUIState } from '../../contexts/UIStateContext';
import { FooterButton } from './FooterButton';
import { MaterialIcon } from '../ui/MaterialIcon';

export const SortButton: React.FC = () => {
    const { sortOrder, toggleSortOrder } = useUIState();

    return (
        <FooterButton
            icon={<MaterialIcon
                icon="vertical_align_bottom"
                size={20}
                fill={sortOrder === 'asc'}
                weight={sortOrder === 'asc' ? 400 : 300}
                className={cn("transition-transform duration-300", sortOrder === 'asc' && "rotate-180")}
            />}
            label={sortOrder === 'desc' ? "Newest" : "Oldest"}
            onClick={toggleSortOrder}
            isActive={sortOrder === 'asc'}
        />
    );
};

