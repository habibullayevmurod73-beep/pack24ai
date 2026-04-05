'use client';

import { useEffect, useRef, useState } from 'react';

interface MapPickerProps {
    initialLat?: number;
    initialLng?: number;
    onSelect: (lat: number, lng: number, address: string) => void;
}

/**
 * Leaflet + OpenStreetMap asosida harita pin tanlash komponenti.
 * API key shart emas — bepul. Leaflet CDN orqali yuklash.
 */
export default function MapPicker({ initialLat = 41.2995, initialLng = 69.2401, onSelect }: MapPickerProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<unknown>(null);
    const markerRef = useRef<unknown>(null);
    const [loaded, setLoaded] = useState(false);
    const [coordText, setCoordText] = useState('');
    const [loading, setLoading] = useState(false);

    // Reverse geocoding: koordinatadan manzil olish (Nominatim — bepul)
    async function reverseGeocode(lat: number, lng: number): Promise<string> {
        try {
            const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json&accept-language=uz`,
                { headers: { 'User-Agent': 'Pack24-Recycling/1.0' } }
            );
            const data = await res.json();
            if (data.display_name) return data.display_name;
        } catch { /* fallback */ }
        return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    useEffect(() => {
        // Leaflet CSS va JS ni CDN dan yuklash
        function loadScript(src: string): Promise<void> {
            return new Promise(resolve => {
                if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
                const script = document.createElement('script');
                script.src = src;
                script.onload = () => resolve();
                document.head.appendChild(script);
            });
        }

        function loadCSS(href: string) {
            if (document.querySelector(`link[href="${href}"]`)) return;
            const link = document.createElement('link');
            link.rel = 'stylesheet';
            link.href = href;
            document.head.appendChild(link);
        }

        async function initMap() {
            loadCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');
            await loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');

            if (!containerRef.current) return;

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const L = (window as any).L;
            if (!L) return;

            // Xaritani yaratish
            const map = L.map(containerRef.current).setView([initialLat, initialLng], 13);
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© OpenStreetMap contributors',
                maxZoom: 19,
            }).addTo(map);

            // Boshlang'ich marker
            const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
            marker.bindPopup('📍 Bu yerdan olib kelinadi').openPopup();

            // Marker siljiganda
            marker.on('dragend', async () => {
                const { lat, lng } = marker.getLatLng();
                setCoordText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                setLoading(true);
                const address = await reverseGeocode(lat, lng);
                setLoading(false);
                onSelect(lat, lng, address);
                marker.setPopupContent(`📍 ${address}`).openPopup();
            });

            // Xaritaga bosib yangi nuqta qo'yish
            map.on('click', async (e: { latlng: { lat: number; lng: number } }) => {
                const { lat, lng } = e.latlng;
                marker.setLatLng([lat, lng]).openPopup();
                setCoordText(`${lat.toFixed(5)}, ${lng.toFixed(5)}`);
                setLoading(true);
                const address = await reverseGeocode(lat, lng);
                setLoading(false);
                onSelect(lat, lng, address);
                marker.setPopupContent(`📍 ${address}`).openPopup();
            });

            mapRef.current = map;
            markerRef.current = marker;
            setLoaded(true);
            setCoordText(`${initialLat.toFixed(5)}, ${initialLng.toFixed(5)}`);

            // Boshlang'ich manzilni olish
            reverseGeocode(initialLat, initialLng).then(address => {
                onSelect(initialLat, initialLng, address);
                marker.setPopupContent(`📍 ${address}`).openPopup();
            });
        }

        initMap();

        return () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (mapRef.current) (mapRef.current as any).remove();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
            {/* Xarita */}
            <div ref={containerRef} className="h-[280px] w-full relative z-0" />

            {/* Status bar */}
            <div className="bg-gray-50 border-t border-gray-200 px-3 py-2 flex items-center gap-2">
                <span className="text-base">📍</span>
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <span className="text-xs text-gray-400 animate-pulse">Manzil aniqlanmoqda...</span>
                    ) : coordText ? (
                        <span className="text-xs text-gray-600 font-medium">{coordText}</span>
                    ) : (
                        <span className="text-xs text-gray-400">Xaritaga bosib yoki marker sudrab nuqta tanlang</span>
                    )}
                </div>
                {!loaded && (
                    <span className="text-[10px] text-gray-400">Xarita yuklanmoqda...</span>
                )}
            </div>
        </div>
    );
}
