'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationService } from '../lib/services/LocationService';

export type LocationStatus = 'idle' | 'loading' | 'active' | 'error' | 'disabled';

export type LocationContextType = {
    location: { latitude: number; longitude: number; altitude: number | null } | null;
    geoString: string | null;
    status: LocationStatus;
    error: string | null;
};

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [status, setStatus] = useState<LocationStatus>('loading');
    const [location, setLocation] = useState<LocationContextType['location']>(null);
    const [error, setError] = useState<string | null>(null);

    // Derived state for formatted string
    const geoString = React.useMemo(() => {
        if (!location) return null;
        // Spec 14: 高度不明時は0とする
        const alt = location.altitude ?? 0;
        return `${location.latitude} ${location.longitude} ${alt}`;
    }, [location]);

    useEffect(() => {
        if (!('geolocation' in navigator)) {
            setStatus('error');
            setError('Geolocation is not supported by your browser');
            return;
        }

        const successCallback = (position: GeolocationPosition) => {
            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude,
            });
            setStatus('active');
            setError(null);

            // Update Singleton Service for non-React access
            LocationService.getInstance().updateLocation(
                position.coords.latitude,
                position.coords.longitude,
                position.coords.altitude
            );
        };

        const errorCallback = (err: GeolocationPositionError) => {
            setStatus('error');
            setError(err.message);
        };

        const options: PositionOptions = {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
        };

        const watchId = navigator.geolocation.watchPosition(
            successCallback,
            errorCallback,
            options
        );

        return () => {
            navigator.geolocation.clearWatch(watchId);
        };
    }, []);

    const value: LocationContextType = {
        location,
        geoString,
        status,
        error,
    };

    return <LocationContext.Provider value={value}>{children}</LocationContext.Provider>;
};

export const useLocation = () => {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error('useLocation must be used within a LocationProvider');
    }
    return context;
};
