'use client';

import type { ReportData } from '../_lib/types';
import { fmt, fmtM } from '../_lib/format';

type BotReports = ReportData['botReports'];

export default function BotReportsPanel({ botReports }: { botReports: BotReports }) {
    return (
        <>
            <div className="grid md:grid-cols-3 gap-4 mb-5">
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-xs text-gray-400 mb-1">🤖 Customer Bot</p>
                    <p className="text-lg font-extrabold text-gray-900">{fmt(botReports.customer.totalRequests)} ariza</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {fmt(botReports.customer.uniqueUsers)} foydalanuvchi • Tasdiq: {fmt(botReports.customer.confirmedRequests)}
                    </p>
                    <p className="text-xs text-gray-500">
                        Pickup: {fmt(botReports.customer.pickupRequests)} • Self: {fmt(botReports.customer.selfDeliveryRequests)}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-xs text-gray-400 mb-1">🚚 Driver Bot</p>
                    <p className="text-lg font-extrabold text-gray-900">{fmt(botReports.driver.totalCollections)} yig&apos;ish</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {fmt(botReports.driver.totalWeight)} kg • {fmtM(botReports.driver.totalAmount)} so&apos;m
                    </p>
                    <p className="text-xs text-gray-500">
                        Kutilayotgan to&apos;lovlar: {fmt(botReports.driver.pendingPayments)}
                    </p>
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <p className="text-xs text-gray-400 mb-1">👷 Admin Bot</p>
                    <p className="text-lg font-extrabold text-gray-900">{fmt(botReports.admin.completedRequests)} yakunlangan</p>
                    <p className="text-xs text-gray-500 mt-1">
                        Tayinlangan: {fmt(botReports.admin.assignedRequests)} • To&apos;lovlar: {fmt(botReports.admin.approvedPaymentsCount)}
                    </p>
                    <p className="text-xs text-gray-500">
                        Tasdiqlangan summa: {fmtM(botReports.admin.approvedPaymentsAmount)} so&apos;m
                    </p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-5 mb-5">
                <LeaderboardTable
                    title="🚚 Top haydovchilar"
                    emptyColSpan={4}
                    headers={['Haydovchi', 'Yig\'ish', 'Og\'irlik', 'Summa']}
                    rows={botReports.topDrivers.slice(0, 8).map(row => ({
                        key: row.driverId,
                        name: row.name,
                        sub: row.phone,
                        cells: [
                            fmt(row.collections),
                            `${fmt(row.totalWeight)} kg`,
                            `${fmtM(row.totalAmount)} so'm`,
                        ],
                    }))}
                />
                <LeaderboardTable
                    title="👷 Top masullar"
                    emptyColSpan={4}
                    headers={['Masul', 'Tayinlangan', 'Yakunlangan', 'To\'lov']}
                    rows={botReports.topSupervisors.slice(0, 8).map(row => ({
                        key: row.supervisorId,
                        name: row.name,
                        sub: row.phone,
                        cells: [
                            fmt(row.assignedRequests),
                            fmt(row.completedRequests),
                            `${fmtM(row.approvedPaymentsAmount)} so'm`,
                        ],
                    }))}
                />
            </div>
        </>
    );
}

function LeaderboardTable({
    title,
    headers,
    rows,
    emptyColSpan,
}: {
    title: string;
    headers: string[];
    rows: { key: number; name: string; sub: string; cells: string[] }[];
    emptyColSpan: number;
}) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-50">
                <p className="font-bold text-gray-800 text-sm">{title}</p>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                        <tr>
                            {headers.map((h, i) => (
                                <th key={h} className={`px-4 py-2 ${i === 0 ? 'text-left' : 'text-right'}`}>{h}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.length === 0 ? (
                            <tr>
                                <td className="px-4 py-6 text-center text-gray-400" colSpan={emptyColSpan}>Ma&apos;lumot yo&apos;q</td>
                            </tr>
                        ) : (
                            rows.map(row => (
                                <tr key={row.key} className="border-t border-gray-50">
                                    <td className="px-4 py-2.5">
                                        <p className="font-semibold text-gray-800">{row.name}</p>
                                        <p className="text-xs text-gray-400">{row.sub}</p>
                                    </td>
                                    {row.cells.map((cell, i) => (
                                        <td key={i} className={`px-4 py-2.5 text-right ${i === row.cells.length - 1 ? 'font-bold text-emerald-700' : i === 0 ? 'font-semibold text-gray-700' : 'text-gray-600'}`}>
                                            {cell}
                                        </td>
                                    ))}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
