import React from 'react';
import { Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUIState } from '../../contexts/UIStateContext';
import { FooterButton } from './FooterButton';

interface FilterButtonProps {
    onClick?: () => void;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ onClick }) => {
    const { filterState, toggleFilterState } = useUIState();

    const handleClick = () => {
        if (onClick) onClick();
        // toggleFilterState is handled in Footer now for specific logic,
        // but if we want it here, we should be careful.
        // The spec says 'on' toggles to 'disabled'.
    };

    return (
        <FooterButton
            icon={<Filter size={20} />}
            label="Filter"
            onClick={handleClick}
            isActive={filterState === 'on'}
            className={cn(
                filterState === 'disabled' && "opacity-50 grayscale"
            )}
        />
    );
};
