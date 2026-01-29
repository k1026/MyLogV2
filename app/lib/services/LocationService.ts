
export class LocationService {
    // Singleton instance
    private static instance: LocationService;

    // State
    private _currentGeo: string | null = null;

    private constructor() { }

    public static getInstance(): LocationService {
        if (!LocationService.instance) {
            LocationService.instance = new LocationService();
        }
        return LocationService.instance;
    }

    public updateLocation(latitude: number, longitude: number, altitude: number | null): void {
        // Spec 14: Altitude defaults to 0 if null
        const alt = altitude ?? 0;
        this._currentGeo = `${latitude} ${longitude} ${alt}`;
    }

    public getCurrentGeoString(): string | null {
        return this._currentGeo;
    }
}
