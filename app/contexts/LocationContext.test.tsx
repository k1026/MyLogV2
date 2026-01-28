import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { LocationProvider, useLocation } from './LocationContext';
import React from 'react';

// Mock Geolocation API
const mockWatchPosition = vi.fn();
const mockClearWatch = vi.fn();

const mockGeolocation = {
    watchPosition: mockWatchPosition,
    clearWatch: mockClearWatch,
};

describe('LocationContext', () => {
    beforeAll(() => {
        vi.stubGlobal('navigator', {
            geolocation: mockGeolocation,
        });
    });

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    beforeEach(() => {
        mockWatchPosition.mockReset();
        mockClearWatch.mockReset();
    });

    it('should start with loading status', async () => {
        const { result } = renderHook(() => useLocation(), {
            wrapper: ({ children }) => <LocationProvider>{children}</LocationProvider>,
        });

        expect(result.current.status).toBe('loading');
        expect(result.current.location).toBeNull();
    });

    it('should update location and status on success with altitude', async () => {
        mockWatchPosition.mockImplementation((successCallback) => {
            successCallback({
                coords: {
                    latitude: 35.6895,
                    longitude: 139.6917,
                    altitude: 10.5,
                },
                timestamp: Date.now(),
            });
            return 123; // watchId
        });

        const { result } = renderHook(() => useLocation(), {
            wrapper: ({ children }) => <LocationProvider>{children}</LocationProvider>,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('active');
        });

        expect(result.current.location).toEqual({
            latitude: 35.6895,
            longitude: 139.6917,
            altitude: 10.5,
        });
        expect(result.current.geoString).toBe('35.6895 139.6917 10.5');
    });

    it('should use 0 for altitude if null', async () => {
        mockWatchPosition.mockImplementation((successCallback) => {
            successCallback({
                coords: {
                    latitude: 40.7128,
                    longitude: -74.0060,
                    altitude: null,
                },
                timestamp: Date.now(),
            });
            return 456;
        });

        const { result } = renderHook(() => useLocation(), {
            wrapper: ({ children }) => <LocationProvider>{children}</LocationProvider>,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('active');
        });

        expect(result.current.location).toEqual({
            latitude: 40.7128,
            longitude: -74.0060,
            altitude: null, // The raw object keeps null
        });
        // Important: geoString replaces null altitude with 0
        expect(result.current.geoString).toBe('40.7128 -74.006 0');
    });

    it('should handle errors', async () => {
        mockWatchPosition.mockImplementation((_, errorCallback) => {
            if (errorCallback) {
                errorCallback({
                    code: 1,
                    message: 'User denied Geolocation',
                });
            }
            return 789;
        });

        const { result } = renderHook(() => useLocation(), {
            wrapper: ({ children }) => <LocationProvider>{children}</LocationProvider>,
        });

        await waitFor(() => {
            expect(result.current.status).toBe('error');
        });

        expect(result.current.error).toBe('User denied Geolocation');
        expect(result.current.location).toBeNull();
    });
});
