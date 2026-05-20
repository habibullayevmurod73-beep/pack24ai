'use client';

import { useState, useEffect, useCallback } from 'react';
import { DollarSign, Package, ShoppingCart, TrendingUp } from 'lucide-react';
import type { ReportData } from './_lib/types';
import { fmt, fmtM } from './_lib/format';
import { ErrorBanner, StatCard } from './_components/ReportUi';
import ReportsHeader from './_components/ReportsHeader';
import BotReportsPanel from './_components/BotReportsPanel';
import ReportsCharts from './_components/ReportsCharts';

export default function ReportsPage() {
    const [data, setData] = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [period, setPeriod] = useState(30);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [online, setOnline] = useState(true);

    useEffect(() => {
        const onOnline = () => setOnline(true);
        const onOffline = () => setOnline(false);
        window.addEventListener('online', onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online', onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const params = new URLSearchParams({ period: String(period) });
            if (startDate && endDate) {
                params.set('from', startDate);
                params.set('to', endDate);
            }
            const res = await fetch(`/api/admin/reports?${params.toString()}`);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error ?? `Server xatosi (${res.status})`);
            }
            setData(await res.json());
        } catch (e: unknown) {
            setError(e instanceof Error ? e.message : "Noma'lum xato");
        } finally {
            setLoading(false);
        }
    }, [period, startDate, endDate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const s = data?.summary;

    return (
        <div className="p-6 bg-[#F9FAFB] min-h-screen">
            <ReportsHeader
                online={online}
                loading={loading}
                period={period}
                startDate={startDate}
                endDate={endDate}
                onPeriodChange={setPeriod}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onRefresh={fetchData}
            />

            {error && !loading && <ErrorBanner message={error} onRetry={fetchData} />}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Davr buyurtmalari"
                    value={loading ? '…' : fmt(s?.periodOrders ?? 0)}
                    sub={`${period} kunlik ko'rsatkich`}
                    icon={ShoppingCart}
                    color="bg-blue-500"
                    loading={loading}
                    trend={data?.trends?.ordersGrowth}
                />
                <StatCard
                    label="Davr daromadi"
                    value={loading ? '…' : `${fmtM(s?.periodRevenue ?? 0)} so'm`}
                    sub={`${fmt(s?.completedOrders ?? 0)} ta yetkazildi`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    loading={loading}
                    trend={data?.trends?.revenueGrowth}
                />
                <StatCard
                    label="Konversiya darajasi"
                    value={loading ? '…' : `${s?.conversionRate ?? 0}%`}
                    sub="Yetkazildi / Jami buyurtma"
                    icon={TrendingUp}
                    color="bg-purple-500"
                    loading={loading}
                    trend={data?.trends?.conversionChange}
                />
                <StatCard
                    label="Jami daromad"
                    value={loading ? '…' : `${fmtM(s?.totalRevenue ?? 0)} so'm`}
                    sub={`Jami ${fmt(s?.totalOrders ?? 0)} buyurtma`}
                    icon={Package}
                    color="bg-orange-500"
                    loading={loading}
                    trend={null}
                />
            </div>

            {!loading && s && (
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
                    {[
                        { label: 'Yangi buyurtmalar (24h)', value: fmt(s.newOrders), clr: 'text-blue-600' },
                        { label: 'Yetkazilgan', value: fmt(s.completedOrders), clr: 'text-emerald-600' },
                        { label: "O'rtacha buyurtma (AOV)", value: `${fmtM(s.aov)} so'm`, clr: 'text-purple-600' },
                        { label: 'Konversiya', value: `${s.conversionRate}%`, clr: s.conversionRate >= 50 ? 'text-emerald-600' : 'text-red-500' },
                        { label: '⏰ Eng faol soat', value: `${s.peakHour}:00`, clr: 'text-blue-600' },
                    ].map(({ label, value, clr }) => (
                        <div key={label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex flex-col">
                            <span className="text-[11px] text-gray-400 mb-1">{label}</span>
                            <span className={`text-lg font-extrabold ${clr}`}>{value}</span>
                        </div>
                    ))}
                </div>
            )}

            {!loading && data?.botReports && <BotReportsPanel botReports={data.botReports} />}

            <ReportsCharts data={data} loading={loading} />
        </div>
    );
}
