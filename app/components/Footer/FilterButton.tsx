import React from 'react';
import { Filter } from 'lucide-react';
import { cn } from '../../lib/utils';
import { useUIState } from '../../contexts/UIStateContext';
import { FooterButton } from './FooterButton';

interface FilterButtonProps {
    onClick?: () => void;
}

export const FilterButton: React.FC<FilterButtonProps> = ({ onClick }) => {
    const { filterState } = useUIState();

    const renderIcon = () => {
        if (filterState === 'on') {
            return <Filter size={20} fill="currentColor" />;
        }
        if (filterState === 'disabled') {
            return (
                <div className="relative flex items-center justify-center w-5 h-5">
                    <Filter size={20} color="currentColor" />
                    <svg
                        className="absolute inset-0 w-full h-full pointer-events-none"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                    >
                        <line x1="4" y1="4" x2="20" y2="20" />
                    </svg>
                </div>
            );
        }
        return <Filter size={20} />;
    };

    return (
        <FooterButton
            icon={renderIcon()}
            label="Filter"
            onClick={onClick}
            isActive={filterState === 'on'}
        />
    );
};
