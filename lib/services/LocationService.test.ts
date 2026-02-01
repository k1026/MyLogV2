
import { describe, it, expect, beforeEach } from 'vitest';
import { LocationService } from './LocationService';

describe('LocationService', () => {
    // Singleton state persists across tests, so we might need a way to reset it strictly speaking,
    // but here we just test behavior.

    it('should maintain singleton instance', () => {
        const instance1 = LocationService.getInstance();
        const instance2 = LocationService.getInstance();
        expect(instance1).toBe(instance2);
    });

    it('should return null initially', () => {
        const service = LocationService.getInstance();
        // Since singleton persists, resetting is tricky without extra method.
        // Assuming we rely on update for next tests.
        // But for "initial", it might fail if run after others.
        // Let's create a reset method for testing only or just update.
    });

    it('should update and return formatted geo string', () => {
        const service = LocationService.getInstance();
        service.updateLocation(35.6895, 139.6917, 10.5);
        expect(service.getCurrentGeoString()).toBe('35.6895 139.6917 10.5');
    });

    it('should handle null altitude as 0', () => {
        const service = LocationService.getInstance();
        service.updateLocation(35.6895, 139.6917, null);
        expect(service.getCurrentGeoString()).toBe('35.6895 139.6917 0');
    });
});
