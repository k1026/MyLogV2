import React from 'react';
import { cn } from '../../lib/utils';
import { useUIState } from '../../contexts/UIStateContext';
import { FooterButton } from './FooterButton';
import { MaterialIcon } from '../UI/MaterialIcon';

interface FilterButtonProps {
    onClick?: () => void;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ onClick }) => {
    const { filterState } = useUIState();

    const renderIcon = () => {
        if (filterState === 'on') {
            return <MaterialIcon icon="filter_alt" size={20} fill />;
        }
        if (filterState === 'disabled') {
            return <MaterialIcon icon="filter_alt_off" size={20} weight={300} />;
        }
        return <MaterialIcon icon="filter_alt" size={20} weight={300} />;
    };

    return (
        <FooterButton
            aria-label="Filter Options"
            icon={renderIcon()}
            label="Filter"
            onClick={onClick}
            isActive={filterState === 'on'}
        />
    );
};

