import React from 'react';
import { useUIState } from '../../contexts/UIStateContext';
import { FooterButton } from './FooterButton';
import { MaterialIcon } from '../ui/MaterialIcon';

export const ViewModeButton: React.FC = () => {
    const { viewMode, toggleViewMode } = useUIState();

    return (
        <FooterButton
            icon={viewMode === 'list'
                ? <MaterialIcon icon="list" size={20} weight={300} />
                : <MaterialIcon icon="dashboard" size={20} fill={true} />}
            label={viewMode === 'list' ? "List" : "Dashboard"}
            onClick={toggleViewMode}
            isActive={viewMode === 'enum'}
        />
    );
};

