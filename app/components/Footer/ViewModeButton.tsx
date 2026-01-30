import React from 'react';
import { LayoutList, Rows } from 'lucide-react';
import { useUIState } from '../../contexts/UIStateContext';
import { FooterButton } from './FooterButton';

export const ViewModeButton: React.FC = () => {
    const { viewMode, toggleViewMode } = useUIState();

    return (
        <FooterButton
            icon={viewMode === 'list' ? <LayoutList size={20} /> : <Rows size={20} />}
            label="List"
            onClick={toggleViewMode}
            isActive={viewMode === 'enum'}
        />
    );
};
