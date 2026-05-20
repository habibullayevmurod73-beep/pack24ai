'use client';

import dynamic from 'next/dynamic';

const LogisticsMap = dynamic(() => import('@/components/admin/LogisticsMap'), { ssr: false });

export default function MapTab() {
    return (
        <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                    🗺️ Logistika Xaritasi
                    <span className="text-xs font-normal text-gray-400">Bazalar, mashinalar va arizalar real-vaqtda</span>
                </h2>
                <LogisticsMap />
            </div>
        </div>
    );
}
