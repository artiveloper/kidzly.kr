const EARTH_RADIUS_KM = 6371;

function toRadians(deg: number): number {
    return (deg * Math.PI) / 180;
}

/** 두 좌표 간 직선 거리(km) — Haversine 공식 */
export function haversineDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);
    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return EARTH_RADIUS_KM * c;
}

/** 거리(km) → 화면 표시 문자열 — 1km 미만은 m 단위 */
export function formatDistanceKm(km: number): string {
    if (km < 1) return `${Math.round(km * 1000)}m`;
    return `${km.toFixed(1)}km`;
}
