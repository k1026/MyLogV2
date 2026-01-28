'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

type LocationStatus = 'idle' | 'loading' | 'active' | 'error';

interface LocationContextType {
    status: LocationStatus;
    toggleLocation: () => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [status, setStatus] = useState<LocationStatus>('idle');

    const toggleLocation = () => {
        setStatus(prev => {
            switch (prev) {
                case 'idle': return 'loading'; // Mimic starting loading
                case 'loading': return 'active'; // Mimic success
                case 'active': return 'error'; // Mimic error
                case 'error': return 'idle'; // Reset
                default: return 'idle';
            }
        });

        // In a real app, this would trigger geolocation API
        // For now, we simulate async transition if we wanted, but the requirement 
        // says "toggle" so shifting states is enough for the UI integration.
        // Actually, let's make it simpler for the toggle: 
        // if active -> inactive (idle), if idle/error -> active (loading then active)
        // But for the purpose of the test "toggle status", cycling is fine or specific logic.
        // Let's implement a cycle to showcase all states in the UI easily.
    };

    return (
        <LocationContext.Provider value={{ status, toggleLocation }}>
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
}
