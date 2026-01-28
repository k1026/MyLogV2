import React from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { useUIState } from '../../contexts/UIStateContext';
import { FooterButton } from './FooterButton';

export const ViewModeButton: React.FC = () => {
    const { viewMode, toggleViewMode } = useUIState();

    return (
        <FooterButton
            icon={viewMode === 'list' ? <LayoutList size={20} /> : <LayoutGrid size={20} />}
            label={viewMode === 'list' ? "List" : "Grid"}
            onClick={toggleViewMode}
            isActive={viewMode === 'grid'}
        />
    );
};
