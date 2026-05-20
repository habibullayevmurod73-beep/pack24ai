'use client';

import { AlertCircle, ArrowDown, ArrowUp, RefreshCw, WifiOff, type LucideIcon } from 'lucide-react';

export function StatCard({ label, value, sub, icon: Icon, color, loading, trend }: {
    label: string; value: string; sub?: string; icon: LucideIcon;
    color: string; loading: boolean; trend?: number | null;
}) {
    if (loading) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
                <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
                <div className="h-8 bg-gray-100 rounded w-32 mb-2" />
                <div className="h-3 bg-gray-50 rounded w-20" />
            </div>
        );
    }
    const isUp = (trend ?? 0) >= 0;
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm text-gray-500 font-medium">{label}</p>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
                    <Icon size={16} className="text-white" />
                </div>
            </div>
            <div className="flex items-end gap-2">
                <p className="text-2xl font-extrabold text-gray-900">{value}</p>
                {trend !== undefined && trend !== null && (
                    <span className={`flex items-center gap-0.5 text-xs font-bold px-2 py-0.5 rounded-full mb-0.5 ${isUp ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'}`}>
                        {isUp ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
                        {Math.abs(trend)}%
                    </span>
                )}
            </div>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

export function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">Ma&apos;lumot yuklanmadi</p>
                <p className="text-xs text-red-400 mt-0.5">{message}</p>
            </div>
            <button
                type="button"
                onClick={onRetry}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
            >
                <RefreshCw size={12} /> Qayta urinish
            </button>
        </div>
    );
}

export function EmptyChart({ height = 200 }: { height?: number }) {
    return (
        <div
            className="flex flex-col items-center justify-center gap-2 bg-gray-50 rounded-xl text-gray-400 text-sm"
            style={{ height }}
        >
            <WifiOff size={24} className="text-gray-300" />
            <span>Ma&apos;lumot yo&apos;q</span>
        </div>
    );
}
