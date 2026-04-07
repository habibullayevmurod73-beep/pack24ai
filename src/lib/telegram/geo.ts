// ─── Haversine Formula — Ikki nuqta orasidagi masofani hisoblash (km) ────────

const R = 6371; // Yer radiusi km

export function haversineDistance(
    lat1: number, lon1: number,
    lat2: number, lon2: number
): number {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
        Math.sin(dLon / 2) ** 2;

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // 1 kasr gacha
}

function toRad(deg: number): number {
    return deg * (Math.PI / 180);
}
