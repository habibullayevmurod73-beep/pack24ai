'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Phone, MapPin } from 'lucide-react';
import {
    EMPTY_POINT,
    POINT_COLORS,
    type PointFormState,
    type RecyclePoint,
} from '../_lib/types';

type Props = {
    points: RecyclePoint[];
    loading: boolean;
    selectedPointId: number | null;
    onRefresh: () => void | Promise<void>;
    onSwitchToPointsTab: () => void;
};

export default function PointsTab({
    points,
    loading,
    selectedPointId,
    onRefresh,
    onSwitchToPointsTab,
}: Props) {
    const [showPointForm, setShowPointForm] = useState(false);
    const [editingPoint, setEditingPoint] = useState<number | null>(null);
    const [pointForm, setPointForm] = useState<PointFormState>(EMPTY_POINT);
    const [savingPoint, setSavingPoint] = useState(false);

    const filteredPoints = selectedPointId
        ? points.filter((point) => point.id === selectedPointId)
        : points;

    const handlePointSubmit = async () => {
        if (!pointForm.regionUz.trim() || !pointForm.cityUz.trim() || !pointForm.phone.trim()) {
            toast.error('Viloyat, shahar va telefon majburiy!');
            return;
        }
        setSavingPoint(true);
        try {
            const method = editingPoint ? 'PUT' : 'POST';
            const url = editingPoint
                ? `/api/admin/recycling/points/${editingPoint}`
                : '/api/admin/recycling/points';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(pointForm),
            });
            if (res.ok) {
                toast.success(editingPoint ? 'Baza yangilandi ✓' : 'Baza qo\'shildi ✓');
                setPointForm(EMPTY_POINT);
                setShowPointForm(false);
                setEditingPoint(null);
                await onRefresh();
            } else {
                toast.error('Xatolik yuz berdi');
            }
        } finally {
            setSavingPoint(false);
        }
    };

    const handlePointDelete = async (id: number) => {
        if (!confirm('Bu bazani o\'chirishni tasdiqlaysizmi?')) return;
        try {
            const res = await fetch(`/api/admin/recycling/points/${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success('Baza o\'chirildi');
                await onRefresh();
            } else {
                toast.error('Xatolik');
            }
        } catch {
            toast.error('Server xatosi');
        }
    };

    const startEditPoint = (point: RecyclePoint) => {
        onSwitchToPointsTab();
        setEditingPoint(point.id);
        setPointForm({
            regionUz: point.regionUz,
            regionRu: point.regionRu,
            cityUz: point.cityUz,
            cityRu: point.cityRu,
            phone: point.phone,
            address: point.address || '',
            lat: String(point.lat ?? ''),
            lng: String(point.lng ?? ''),
            status: point.status,
            color: point.color,
        });
        setShowPointForm(true);
    };

    const openNewPointForm = () => {
        onSwitchToPointsTab();
        setShowPointForm(!showPointForm);
        setEditingPoint(null);
        setPointForm(EMPTY_POINT);
    };

    const cancelForm = () => {
        setShowPointForm(false);
        setEditingPoint(null);
        setPointForm(EMPTY_POINT);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-end">
                <button
                    type="button"
                    onClick={openNewPointForm}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-xl transition-colors"
                >
                    <Plus size={16} /> Yangi baza
                </button>
            </div>

            {showPointForm && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-5">
                        {editingPoint ? 'Bazani tahrirlash' : 'Yangi baza qo\'shish'}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Viloyat (UZ) *
                            </label>
                            <input
                                value={pointForm.regionUz}
                                onChange={(e) => setPointForm((f) => ({ ...f, regionUz: e.target.value }))}
                                placeholder="Toshkent"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Viloyat (RU)
                            </label>
                            <input
                                value={pointForm.regionRu}
                                onChange={(e) => setPointForm((f) => ({ ...f, regionRu: e.target.value }))}
                                placeholder="Ташкент"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Shahar (UZ) *
                            </label>
                            <input
                                value={pointForm.cityUz}
                                onChange={(e) => setPointForm((f) => ({ ...f, cityUz: e.target.value }))}
                                placeholder="Toshkent sh."
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Shahar (RU)
                            </label>
                            <input
                                value={pointForm.cityRu}
                                onChange={(e) => setPointForm((f) => ({ ...f, cityRu: e.target.value }))}
                                placeholder="г. Ташкент"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Telefon *
                            </label>
                            <input
                                value={pointForm.phone}
                                onChange={(e) => setPointForm((f) => ({ ...f, phone: e.target.value }))}
                                placeholder="+998 71 234-56-78"
                                type="tel"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                            />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Manzil (to&apos;liq)
                            </label>
                            <input
                                value={pointForm.address}
                                onChange={(e) => setPointForm((f) => ({ ...f, address: e.target.value }))}
                                placeholder="Toshkent sh., Yunusobod tumani, 5-ko'cha 12-uy"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                📍 Kenglik (Latitude)
                            </label>
                            <input
                                value={pointForm.lat}
                                onChange={(e) => setPointForm((f) => ({ ...f, lat: e.target.value }))}
                                placeholder="41.2995"
                                type="number"
                                step="0.0001"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                📍 Uzunlik (Longitude)
                            </label>
                            <input
                                value={pointForm.lng}
                                onChange={(e) => setPointForm((f) => ({ ...f, lng: e.target.value }))}
                                placeholder="69.2401"
                                type="number"
                                step="0.0001"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400"
                            />
                            <p className="text-[10px] text-gray-400 mt-1">
                                Google Maps dan nusxalash: O&apos;ng klik → &quot;Bu joy haqida&quot;
                            </p>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                                Status
                            </label>
                            <select
                                value={pointForm.status}
                                onChange={(e) => setPointForm((f) => ({ ...f, status: e.target.value }))}
                                title="Status tanlash"
                                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-400 bg-white"
                            >
                                <option value="active">✅ Faol</option>
                                <option value="planned">🟡 Rejalashtirilgan</option>
                            </select>
                        </div>

                        <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Rang</label>
                            <div className="flex flex-wrap gap-2">
                                {POINT_COLORS.map((c) => (
                                    <button
                                        key={c}
                                        type="button"
                                        onClick={() => setPointForm((f) => ({ ...f, color: c }))}
                                        className={`w-8 h-8 rounded-lg ${c} transition-all ${
                                            pointForm.color === c ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : 'hover:scale-105'
                                        }`}
                                        title={c}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-5">
                        <button
                            type="button"
                            onClick={handlePointSubmit}
                            disabled={savingPoint}
                            className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors"
                        >
                            {savingPoint ? 'Saqlanmoqda...' : editingPoint ? 'Saqlash' : 'Qo\'shish'}
                        </button>
                        <button
                            type="button"
                            onClick={cancelForm}
                            className="border border-gray-200 text-gray-600 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-gray-50 transition-colors"
                        >
                            Bekor qilish
                        </button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />
                    ))}
                </div>
            ) : filteredPoints.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-2xl border border-gray-100">
                    <MapPin size={40} className="mx-auto text-gray-200 mb-3" />
                    <p className="text-gray-400 font-medium">Hali bazalar yo&apos;q</p>
                    <button
                        type="button"
                        onClick={() => { onSwitchToPointsTab(); setShowPointForm(true); }}
                        className="text-emerald-600 text-sm font-semibold mt-2 hover:underline"
                    >
                        Birinchi bazani qo&apos;shing →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredPoints.map((point) => (
                        <div
                            key={point.id}
                            className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div
                                        className={`w-10 h-10 ${point.color} rounded-xl flex items-center justify-center text-white font-extrabold text-sm shadow-md`}
                                    >
                                        {point.id}
                                    </div>
                                    <div>
                                        <p className="font-extrabold text-gray-900">{point.regionUz}</p>
                                        <p className="text-xs text-gray-400">{point.cityUz}</p>
                                    </div>
                                </div>
                                <span
                                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                        point.status === 'active'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-yellow-100 text-yellow-700'
                                    }`}
                                >
                                    {point.status === 'active' ? '✅ Faol' : '🟡 Reja'}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm text-blue-600 mb-3">
                                <Phone size={12} />
                                {point.phone}
                            </div>

                            {point.regionRu && (
                                <p className="text-xs text-gray-400 mb-3">
                                    {point.regionRu} / {point.cityRu}
                                </p>
                            )}

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    type="button"
                                    onClick={() => startEditPoint(point)}
                                    className="flex items-center gap-1 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Pencil size={12} /> Tahrirlash
                                </button>
                                <button
                                    type="button"
                                    onClick={() => handlePointDelete(point.id)}
                                    className="flex items-center gap-1 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors"
                                >
                                    <Trash2 size={12} /> O&apos;chirish
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
