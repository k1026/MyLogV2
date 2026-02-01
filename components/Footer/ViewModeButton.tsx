import React from 'react';
import { useUIState } from '../../contexts/UIStateContext';
import { FooterButton } from './FooterButton';
import { MaterialIcon } from '../UI/MaterialIcon';

export const ViewModeButton: React.FC = () => {
    const { viewMode, toggleViewMode } = useUIState();

    return (
        <FooterButton
            aria-label="View Mode Options"
            icon={viewMode === 'list'
                ? <MaterialIcon icon="list" size={20} weight={300} />
                : <MaterialIcon icon="dashboard" size={20} fill={true} />}
            label={viewMode === 'list' ? "List" : "Dashboard"}
            onClick={toggleViewMode}
            isActive={viewMode === 'enum'}
        />
    );
};

