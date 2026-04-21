"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { MapPin, User, Phone, PackageSearch } from "lucide-react";

const createRequestIcon = (status: string) => {
    const color = status === "new" ? "#ef4444" : "#10b981";
    return L.divIcon({
        className: 'custom-div-icon',
        html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 5px rgba(0,0,0,0.5);"><div style="width: 8px; height: 8px; background: white; border-radius: 50%; margin: 6px auto;"></div></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
    });
};

export default function LogisticsMap() {
    const [requests, setRequests] = useState<any[]>([]);
    const [center, setCenter] = useState<[number, number]>([41.311081, 69.240562]); // Tashkent default

    useEffect(() => {
        fetch("/api/admin/logistics")
        .then(res => res.json())
        .then(data => {
            if(data.success && data.requests) {
                setRequests(data.requests);
                if(data.requests.length > 0) {
                   setCenter([data.requests[0].pickupLat, data.requests[0].pickupLng]);
                }
            }
        });
    }, []);

    // Connect lines to visualize "proposed route" simply
    const routeCoords: [number, number][] = requests.map(r => [r.pickupLat, r.pickupLng]);

    return (
        <div className="relative z-0">
            <style jsx global>{`
                .leaflet-container {
                    width: 100%;
                    height: 600px;
                    border-radius: 0.75rem;
                    z-index: 1 !important;
                }
            `}</style>
            
            <MapContainer center={center} zoom={12} scrollWheelZoom={true}>
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                />

                {/* Draw Route Line if there are multiple requests */}
                {routeCoords.length > 1 && (
                     <Polyline 
                        positions={routeCoords} 
                        pathOptions={{ color: '#3b82f6', weight: 4, dashArray: '10, 10', opacity: 0.6 }} 
                     />
                )}

                {/* Draw Requests */}
                {requests.map(req => (
                    <Marker 
                        key={req.id} 
                        position={[req.pickupLat, req.pickupLng]}
                        icon={createRequestIcon(req.status)}
                    >
                        <Popup className="rounded-xl">
                            <div className="p-1 min-w-[200px] font-sans">
                                <h3 className="font-bold flex items-center gap-2 border-b pb-2 mb-2 text-sm">
                                   <PackageSearch size={16} className="text-blue-500" /> #{req.id} - Jami: {req.volume || "?"} kg
                                </h3>
                                <div className="space-y-2 text-xs">
                                    <p className="flex items-center gap-2"><User size={14}/> <b>{req.name}</b></p>
                                    <p className="flex items-center gap-2"><Phone size={14}/> {req.phone}</p>
                                    <p className="flex items-center gap-2 text-gray-500"><MapPin size={14} /> {req.address || "Manzilsiz/Faqat GPS"}</p>
                                    
                                    <div className="mt-3 bg-gray-50 p-2 rounded border font-semibold text-center uppercase tracking-wider text-gray-700">
                                        Holat: {req.status === 'new' ? <span className="text-red-500">Mijoz kutyapti</span> : <span className="text-green-500">Yo'naltirilgan</span>}
                                    </div>
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
}
