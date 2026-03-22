'use client';

import { useState, useEffect, useCallback } from 'react';
import {
    TrendingUp, ShoppingCart, DollarSign, Package,
    RefreshCw, ArrowUp, ArrowDown,
    ChevronRight, Box, AlertCircle, Wifi, WifiOff,
    type LucideIcon
} from 'lucide-react';
import {
    AreaChart, Area, BarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReportData {
    summary: {
        totalOrders: number;
        newOrders: number;
        totalRevenue: number;
        periodOrders: number;
        periodRevenue: number;
        completedOrders: number;
        conversionRate: number;
    };
    topProducts: {
        productId: number;
        name: string;
        image: string | null;
        price: number;
        totalSold: number;
        orderCount: number;
    }[];
    ordersByStatus: { status: string; _count: { status: number } }[];
    dailyRevenue: { date: string; revenue: number; orders: number }[];
    period: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number)  { return n.toLocaleString('ru-RU'); }
function fmtM(n: number) {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000)     return `${(n / 1_000).toFixed(0)}K`;
    return fmt(n);
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon: Icon, color, loading, trend }: {
    label: string; value: string; sub?: string; icon: LucideIcon;
    color: string; loading: boolean; trend?: 'up' | 'down' | null;
}) {
    if (loading) return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
            <div className="h-4 bg-gray-100 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-100 rounded w-32 mb-2" />
            <div className="h-3 bg-gray-50 rounded w-20" />
        </div>
    );
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
                {trend === 'up'   && <span className="flex items-center gap-0.5 text-emerald-600 text-xs font-bold mb-0.5"><ArrowUp size={12} /> Yuqori</span>}
                {trend === 'down' && <span className="flex items-center gap-0.5 text-red-500    text-xs font-bold mb-0.5"><ArrowDown size={12} /> Past</span>}
            </div>
            {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
    );
}

// ─── Status colors ────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
    new:        { label: 'Yangi',       color: '#3b82f6' },
    processing: { label: 'Jarayonda',   color: '#8b5cf6' },
    shipping:   { label: "Yo'lda",      color: '#f59e0b' },
    delivered:  { label: 'Yetkazildi',  color: '#10b981' },
    cancelled:  { label: 'Bekor',       color: '#ef4444' },
    draft:      { label: 'Draft',       color: '#9ca3af' },
};

// ─── Error Banner ─────────────────────────────────────────────────────────────
function ErrorBanner({ message, onRetry }: { message: string; onRetry: () => void }) {
    return (
        <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 mb-6">
            <AlertCircle size={18} className="text-red-500 shrink-0" />
            <div className="flex-1">
                <p className="text-sm font-semibold text-red-700">Ma&apos;lumot yuklanmadi</p>
                <p className="text-xs text-red-400 mt-0.5">{message}</p>
            </div>
            <button
                onClick={onRetry}
                className="flex items-center gap-1.5 text-xs font-bold text-red-600 hover:text-red-700 border border-red-200 px-3 py-1.5 rounded-xl hover:bg-red-50 transition-colors"
            >
                <RefreshCw size={12} /> Qayta urinish
            </button>
        </div>
    );
}

// ─── Empty Chart Placeholder ──────────────────────────────────────────────────
function EmptyChart({ height = 200 }: { height?: number }) {
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

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ReportsPage() {
    const [data, setData]       = useState<ReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState<string | null>(null);
    const [period, setPeriod]   = useState(30);
    const [online, setOnline]   = useState(true);

    // Network status listener
    useEffect(() => {
        const onOnline  = () => setOnline(true);
        const onOffline = () => setOnline(false);
        window.addEventListener('online',  onOnline);
        window.addEventListener('offline', onOffline);
        return () => {
            window.removeEventListener('online',  onOnline);
            window.removeEventListener('offline', onOffline);
        };
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`/api/admin/reports?period=${period}`);
            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.error ?? `Server xatosi (${res.status})`);
            }
            const json = await res.json();
            setData(json);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : "Noma'lum xato";
            setError(msg);
        } finally {
            setLoading(false);
        }
    }, [period]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const s = data?.summary;
    const pieData = (data?.ordersByStatus ?? [])
        .filter(o => o.status !== 'draft')
        .map(o => ({
            name:  STATUS_MAP[o.status]?.label ?? o.status,
            value: o._count.status,
            color: STATUS_MAP[o.status]?.color ?? '#9ca3af',
        }));

    // Trend: yangi buyurtmalar soni > umumiy ortacha bo'lsa up
    const convTrend = s
        ? s.conversionRate >= 50 ? 'up' : 'down'
        : null;

    return (
        <div className="p-6 bg-[#F9FAFB] min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                <div>
                    <div className="flex items-center gap-2">
                        <h1 className="text-2xl font-extrabold text-gray-900">Hisobotlar & Analitika</h1>
                        {/* Network indicator */}
                        {online
                            ? <span title="Tarmoq ulanishi bor"><Wifi size={14} className="text-emerald-500" /></span>
                            : <span title="Tarmoq yo'q"><WifiOff size={14} className="text-red-400" /></span>
                        }
                    </div>
                    <p className="text-sm text-gray-400 mt-0.5">Biznes ko&apos;rsatkichlari va tendentsiyalar</p>
                </div>
                <div className="flex items-center gap-3">
                    {/* Period selector */}
                    <div className="flex rounded-xl overflow-hidden border border-gray-200 bg-white">
                        {[7, 30, 90].map(d => (
                            <button
                                key={d}
                                onClick={() => setPeriod(d)}
                                className={`px-4 py-2 text-sm font-semibold transition-colors ${
                                    period === d
                                        ? 'bg-[#064E3B] text-white'
                                        : 'text-gray-600 hover:bg-gray-50'
                                }`}
                            >
                                {d} kun
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={fetchData}
                        disabled={loading}
                        title="Yangilash"
                        aria-label="Ma'lumotlarni yangilash"
                        className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={15} className={`text-gray-500 ${loading ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Error banner */}
            {error && !loading && <ErrorBanner message={error} onRetry={fetchData} />}

            {/* Stat Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                <StatCard
                    label="Davr buyurtmalari"
                    value={loading ? '…' : fmt(s?.periodOrders ?? 0)}
                    sub={`${period} kunlik ko'rsatkich`}
                    icon={ShoppingCart}
                    color="bg-blue-500"
                    loading={loading}
                    trend={s ? (s.periodOrders > 0 ? 'up' : null) : null}
                />
                <StatCard
                    label="Davr daromadi"
                    value={loading ? '…' : `${fmtM(s?.periodRevenue ?? 0)} so'm`}
                    sub={`${fmt(s?.completedOrders ?? 0)} ta yetkazildi`}
                    icon={DollarSign}
                    color="bg-emerald-500"
                    loading={loading}
                    trend={s ? (s.periodRevenue > 0 ? 'up' : 'down') : null}
                />
                <StatCard
                    label="Konversiya darajasi"
                    value={loading ? '…' : `${s?.conversionRate ?? 0}%`}
                    sub="Yetkazildi / Jami buyurtma"
                    icon={TrendingUp}
                    color="bg-purple-500"
                    loading={loading}
                    trend={convTrend as 'up' | 'down' | null}
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

            {/* Quick info row */}
            {!loading && s && (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                    {[
                        { label: "Yangi buyurtmalar (24h)", value: fmt(s.newOrders),        clr: 'text-blue-600'   },
                        { label: "Yetkazilgan",             value: fmt(s.completedOrders),  clr: 'text-emerald-600'},
                        { label: "Davr buyurtmalari",       value: fmt(s.periodOrders),     clr: 'text-purple-600' },
                        { label: "Konversiya",              value: `${s.conversionRate}%`,  clr: s.conversionRate >= 50 ? 'text-emerald-600' : 'text-red-500' },
                    ].map(({ label, value, clr }) => (
                        <div key={label} className="bg-white rounded-xl border border-gray-100 px-4 py-3 flex flex-col">
                            <span className="text-[11px] text-gray-400 mb-1">{label}</span>
                            <span className={`text-lg font-extrabold ${clr}`}>{value}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* Charts row */}
            <div className="grid lg:grid-cols-3 gap-5 mb-5">
                {/* Revenue area chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="font-bold text-gray-800 mb-4">Kunlik daromad (so&apos;m)</p>
                    {loading ? (
                        <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
                    ) : (data?.dailyRevenue ?? []).length === 0 ? (
                        <EmptyChart height={200} />
                    ) : (
                        <ResponsiveContainer width="100%" height={200}>
                            <AreaChart data={data?.dailyRevenue ?? []}>
                                <defs>
                                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#064E3B" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#064E3B" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tickFormatter={v => fmtM(Number(v))} tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={48} />
                                <Tooltip
                                    formatter={(value) => [`${fmt(Number(value ?? 0))} so'm`, 'Daromad']}
                                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#064E3B" strokeWidth={2} fill="url(#revGrad)" dot={{ r: 3, fill: '#064E3B', strokeWidth: 0 }} activeDot={{ r: 5 }} />
                            </AreaChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Status pie */}
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="font-bold text-gray-800 mb-4">Status taqsimoti</p>
                    {loading ? (
                        <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
                    ) : pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%" cy="50%"
                                    innerRadius={50} outerRadius={80}
                                    paddingAngle={3}
                                    dataKey="value"
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: 10, fontSize: 12 }} />
                                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyChart height={200} />
                    )}
                </div>
            </div>

            {/* Orders bar + Top products */}
            <div className="grid lg:grid-cols-3 gap-5">
                {/* Bar chart */}
                <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="font-bold text-gray-800 mb-4">Kunlik buyurtmalar soni</p>
                    {loading ? (
                        <div className="h-44 bg-gray-50 rounded-xl animate-pulse" />
                    ) : (data?.dailyRevenue ?? []).length === 0 ? (
                        <EmptyChart height={180} />
                    ) : (
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={data?.dailyRevenue ?? []}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                                <Tooltip
                                    formatter={(v) => [Number(v ?? 0), 'Buyurtmalar']}
                                    contentStyle={{ borderRadius: 12, border: 'none', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', fontSize: 12 }}
                                />
                                <Bar dataKey="orders" fill="#3b82f6" radius={[6, 6, 0, 0]} maxBarSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    )}
                </div>

                {/* Top products */}
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-50 flex items-center justify-between">
                        <p className="font-bold text-gray-800 text-sm">🏆 Top mahsulotlar</p>
                        <Link href="/admin/products" className="text-xs text-blue-600 hover:underline flex items-center gap-0.5">
                            Barchasi <ChevronRight size={12} />
                        </Link>
                    </div>
                    <div className="divide-y divide-gray-50">
                        {loading ? (
                            Array.from({ length: 5 }).map((_, i) => (
                                <div key={i} className="p-3 flex items-center gap-3 animate-pulse">
                                    <div className="w-9 h-9 bg-gray-100 rounded-xl" />
                                    <div className="flex-1">
                                        <div className="h-3 bg-gray-100 rounded w-24 mb-1.5" />
                                        <div className="h-2.5 bg-gray-50 rounded w-16" />
                                    </div>
                                    <div className="h-3 bg-gray-100 rounded w-10" />
                                </div>
                            ))
                        ) : !data || data.topProducts.length === 0 ? (
                            <div className="p-8 text-center text-gray-400 text-sm">Ma&apos;lumot yo&apos;q</div>
                        ) : (
                            data.topProducts.slice(0, 6).map((p, i) => (
                                <div key={p.productId} className="px-4 py-3 flex items-center gap-3 hover:bg-gray-50 transition-colors">
                                    <span className={`w-5 text-[11px] font-extrabold ${i < 3 ? 'text-amber-500' : 'text-gray-400'}`}>
                                        {i + 1}
                                    </span>
                                    <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                        {p.image
                                            /* eslint-disable-next-line @next/next/no-img-element */
                                            ? <img src={p.image} alt={p.name} className="w-full h-full object-contain" />
                                            : <Box size={14} className="text-gray-300" />
                                        }
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-semibold text-gray-800 truncate">{p.name}</p>
                                        <p className="text-[10px] text-gray-400">{p.orderCount} buyurtma</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-xs font-extrabold text-gray-900">{fmt(p.totalSold)}</p>
                                        <p className="text-[10px] text-gray-400">dona</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
