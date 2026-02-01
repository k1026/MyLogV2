/**
 * 緯度経度文字列 "lat lon alt" or "lat,lon" から丸められた GeoKey を生成する
 * 100m精度 => 小数点以下3桁
 */
export function getGeoKey(geo: string | null): string | null {
    if (!geo) return null;
    const parts = geo.trim().split(/[ ,]+/); // Handle space or comma
    if (parts.length < 2) return null;
    const lat = parseFloat(parts[0]);
    const lon = parseFloat(parts[1]);
    if (isNaN(lat) || isNaN(lon)) return null;

    // Round to 3 decimal places (approx 110m)
    const latKey = lat.toFixed(3);
    const lonKey = lon.toFixed(3);
    return `${latKey}_${lonKey}`;
}

export function getTimeSlot(date: Date): number {
    return date.getHours();
}
