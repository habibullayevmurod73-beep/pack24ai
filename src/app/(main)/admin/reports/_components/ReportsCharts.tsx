'use client';

import Image from 'next/image';
import Link from 'next/link';
import {
    Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend,
    Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { Box, ChevronRight } from 'lucide-react';
import SalesFunnel from '../../dashboard/components/SalesFunnel';
import RegionSalesMap from '../../dashboard/components/RegionSalesMap';
import type { ReportData } from '../_lib/types';
import { STATUS_MAP } from '../_lib/types';
import { fmt, fmtM } from '../_lib/format';
import { EmptyChart } from './ReportUi';

type Props = {
    data: ReportData | null;
    loading: boolean;
};

export default function ReportsCharts({ data, loading }: Props) {
    const pieData = (data?.ordersByStatus ?? [])
        .filter(o => o.status !== 'draft')
        .map(o => ({
            name: STATUS_MAP[o.status]?.label ?? o.status,
            value: o._count.status,
            color: STATUS_MAP[o.status]?.color ?? '#9ca3af',
        }));

    return (
        <>
            <div className="grid lg:grid-cols-3 gap-5 mb-5">
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
                                        <stop offset="5%" stopColor="#064E3B" stopOpacity={0.15} />
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
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="font-bold text-gray-800 mb-4">Status taqsimoti</p>
                    {loading ? (
                        <div className="h-48 bg-gray-50 rounded-xl animate-pulse" />
                    ) : pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={200}>
                            <PieChart>
                                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={3} dataKey="value">
                                    {pieData.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
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

            <div className="grid lg:grid-cols-2 gap-5 mb-5">
                <SalesFunnel data={data?.funnelData ?? null} loading={loading} />
                <RegionSalesMap data={data?.regionSales ?? []} loading={loading} />
            </div>

            <div className="grid lg:grid-cols-3 gap-5">
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
                                    <span className={`w-5 text-[11px] font-extrabold ${i < 3 ? 'text-amber-500' : 'text-gray-400'}`}>{i + 1}</span>
                                    <div className="w-9 h-9 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 flex items-center justify-center">
                                        {p.image
                                            ? <Image src={p.image} alt={p.name} width={36} height={36} className="w-full h-full object-contain" unoptimized={p.image.startsWith('http')} />
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
        </>
    );
}
