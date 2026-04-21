"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// Server side render qilish mumkin emas, chunki Leaflet "window" ga ehtiyoj sezadi.
const AnalyticsMap = dynamic(
  () => import("@/components/admin/LogisticsMap"),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex h-[600px] items-center justify-center bg-gray-50 rounded-xl border">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }
);

export default function LogisticsPage() {
    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-gray-900">
                    Avtomatlashtirilgan Logistika Xaritasi
                </h1>
                <p className="text-gray-500 mt-2">
                    Faol makulatura arizalari, haydovchilar joylashuvi va marshrutlarni (Logistics Routing) real vaqtda kuzatib boring. Jami jarayonning raqamli vizualizatsiyasi.
                </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm border p-4 relative z-0">
               <AnalyticsMap />
            </div>
        </div>
    );
}
