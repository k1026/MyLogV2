'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LocationService } from '../lib/services/LocationService';

export type LocationStatus = 'idle' | 'loading' | 'active' | 'error' | 'disabled';

export type LocationContextType = {
    location: { latitude: number; longitude: number; altitude: number | null } | null;
    geoString: string | null;
    status: LocationStatus;
    error: string | null;
    toggleLocation: () => void;
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

    // Watch Control Effect
    useEffect(() => {
        if (!('geolocation' in navigator)) {
            setStatus('error');
            setError('Geolocation is not supported by your browser');
            return;
        }

        // If explicitly disabled, clear existing watch and do nothing
        if (status === 'disabled') {
            return;
        }

        // Only start watching if we are in a state that implies activity (or just not disabled)
        // If we just toggled from disabled -> loading, we want to start.
        // If we are already active/error, re-registering is redundant unless we want to "retry".
        // A simple pattern is: if disabled, stop. if not disabled and no watch, start.

        // But useEffect cleans up on re-run. So we can just rely on 'status' dependency IF we split the logic.
        // However, 'status' changes frequently (loading -> active -> maybe error -> active).
        // We don't want to re-register watch on every position update (which doesn't change status but..)
        // Actually position update doesn't change status if it stays 'active'.
        // But initial loading -> active changes status. We don't want to stop/start there.

        // Better approach: Use a separate 'enabled' state or similar?
        // Or check previous status?

        // Simpler: Manage watchId in a ref and manually control start/stop in useEffect based on a flag,
        // OR let React handle it but be careful with dependencies.

        // Let's us a ref to track if we *should* be watching.
        // Or simply: if status is 'disabled', do nothing (cleanup runs).
        // If status is NOT 'disabled', we ensure we are watching.

        // Problem: 'status' changes from 'loading' to 'active'. This triggers re-effect.
        // Code below will run again: clear OLD watch, start NEW watch.
        // This is actually fine for geolocation, maybe a bit wasteful but robust.

        const successCallback = (position: GeolocationPosition) => {
            // Only update if we are not disabled (guard against async callbacks after cleanup?)
            // Cleanup function handles clearWatch, so strictly speaking valid callbacks shouldn't fire?
            // Actually, clearWatch stops future ones.

            setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                altitude: position.coords.altitude,
            });
            setStatus('active');
            setError(null);

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
    }, [status === 'disabled']); // Only re-run if "disabled" status changed. 
    // Wait, if I use [status === 'disabled'], and status changes 'loading' -> 'active', the boolean is 'false' -> 'false'. No re-run!
    // But then 'successCallback' inside isn't updated? It doesn't capture anything special.
    // BUT, if I trigger setStatus('active') inside, does it cause issues?
    // It causes re-render. Effect deps check: (false === false). No re-run. Safe.

    // However, the initial state is 'loading'. (loading != disabled) -> Effect runs -> watchPosition -> success -> setStatus('active').
    // Render -> (active != disabled) -> false === false. No effect re-run. Perfect.

    const toggleLocation = () => {
        setStatus(prev => prev === 'disabled' ? 'loading' : 'disabled');
    };

    const value: LocationContextType = {
        location,
        geoString,
        status,
        error,
        toggleLocation,
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
