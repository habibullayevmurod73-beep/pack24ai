'use client';

import { useAuthStore } from '@/lib/store/useAuthStore';
import { useCartStore } from '@/lib/store/useCartStore';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCurrencySafe } from '@/lib/contexts/CurrencyContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
    LogOut, Package, User as UserIcon, Settings, Heart,
    ShoppingCart, ChevronRight, MapPin, Star,
    Phone, Shield, Bell, Gift, TrendingUp
} from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';

const PushNotificationButton = dynamic(() => import('@/components/PushNotificationButton'), { ssr: false });

const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    new:        { bg: 'bg-blue-50',    text: 'text-blue-700',   label: 'Yangi' },
    pending:    { bg: 'bg-amber-50',   text: 'text-amber-700',  label: 'Kutilmoqda' },
    processing: { bg: 'bg-indigo-50',  text: 'text-indigo-700', label: 'Jarayonda' },
    shipping:   { bg: 'bg-purple-50',  text: 'text-purple-700', label: "Yo'lda" },
    delivered:  { bg: 'bg-emerald-50', text: 'text-emerald-700',label: 'Yetkazildi' },
    cancelled:  { bg: 'bg-red-50',     text: 'text-red-700',    label: 'Bekor' },
};

type TabKey = 'orders' | 'cart' | 'settings';

export default function ProfilePage() {
    const { user, isAuthenticated, logout, orders } = useAuthStore();
    const cartItems = useCartStore(s => s.items);
    const { language } = useLanguage();
    const { format } = useCurrencySafe();
    const router = useRouter();
    const [tab, setTab] = useState<TabKey>('orders');
    const [editName, setEditName] = useState('');
    const [saving, setSaving] = useState(false);

    const t = (uz: string, ru: string) => language === 'ru' ? ru : uz;

    useEffect(() => {
        const timer = setTimeout(() => {
            if (!useAuthStore.getState().isAuthenticated) router.push('/login');
        }, 100);
        return () => clearTimeout(timer);
    }, [isAuthenticated, router]);

    useEffect(() => {
        if (user) setEditName(user.name);
    }, [user]);

    if (!user) return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="animate-spin h-8 w-8 border-4 border-blue-500 rounded-full border-t-transparent" />
        </div>
    );

    const totalSpent = orders.reduce((acc, o) => acc + (o.totalAmount ?? 0), 0);
    const cartTotal  = cartItems.reduce((acc, i) => acc + i.price * i.quantity, 0);

    const TABS: { key: TabKey; label: string; icon: React.ElementType; badge?: number }[] = [
        { key: 'orders',   label: t("Buyurtmalar", "Заказы"),   icon: Package,      badge: orders.length },
        { key: 'cart',     label: t("Savat", "Корзина"),        icon: ShoppingCart, badge: cartItems.length },
        { key: 'settings', label: t("Sozlamalar", "Настройки"), icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#f5f6fa]">
            {/* Hero banner */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-700 py-12">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-end gap-5">
                        <div className="w-20 h-20 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center text-3xl font-extrabold text-white border-4 border-white/30 shadow-xl">
                            {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 pb-1">
                            <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-blue-200 text-sm flex items-center gap-1"><Phone size={12} />{user.phone}</span>
                                <span className="text-[10px] bg-white/20 text-white px-2 py-0.5 rounded-full font-bold">
                                    {user.role === 'admin' ? '👑 Admin' : '⭐ Mijoz'}
                                </span>
                            </div>
                        </div>
                        <div className="hidden sm:grid grid-cols-2 gap-3 pb-1">
                            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center">
                                <p className="text-xl font-extrabold text-white">{orders.length}</p>
                                <p className="text-blue-200 text-xs">{t("Buyurtma", "Заказов")}</p>
                            </div>
                            <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-2 text-center">
                                <p className="text-xl font-extrabold text-white">{format(totalSpent)}</p>
                                <p className="text-blue-200 text-xs">{t("Jami xarid", "Всего куплено")}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-5">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="flex border-b border-gray-100">
                        {TABS.map(tb => {
                            const Icon = tb.icon;
                            return (
                            <button
                                key={tb.key}
                                onClick={() => setTab(tb.key)}
                                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-semibold transition-colors relative ${
                                    tab === tb.key
                                        ? 'text-blue-600 border-b-2 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700'
                                }`}
                            >
                                <Icon size={15} />
                                <span className="hidden sm:inline">{tb.label}</span>
                                {tb.badge !== undefined && tb.badge > 0 && (
                                    <span className="w-5 h-5 text-[10px] font-extrabold bg-blue-600 text-white rounded-full flex items-center justify-center">
                                        {tb.badge}
                                    </span>
                                )}
                            </button>
                            );
                        })}
                    </div>
                </div>

                <div className="mt-4 pb-12">
                    {/* ── Tab: Buyurtmalar ─────────────────────────────── */}
                    {tab === 'orders' && (
                        <div className="space-y-3">
                            {orders.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                                    <Package size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-500 font-semibold">{t("Buyurtmalar yo'q", "Нет заказов")}</p>
                                    <Link href="/catalog" className="mt-4 inline-flex items-center gap-1 text-blue-600 font-bold text-sm hover:underline">
                                        {t("Xarid qilish", "Начать покупки")} <ChevronRight size={14} />
                                    </Link>
                                </div>
                            ) : (
                                orders.map((order, i) => {
                                    const s = STATUS_STYLES[order.status] ?? STATUS_STYLES.new;
                                    return (
                                        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                                <div>
                                                    <span className="font-extrabold text-gray-900 text-sm">#{i + 1}</span>
                                                    <span className="text-xs text-gray-400 ml-2">{order.date ? new Date(order.date).toLocaleDateString('uz-UZ') : ''}</span>
                                                </div>
                                                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>{s.label}</span>
                                            </div>
                                            <div className="px-5 py-3">
                                                {(order.items ?? []).slice(0, 2).map((item: any, j: number) => (
                                                    <div key={j} className="flex items-center gap-3 py-2">
                                                        <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                                                            {item.product?.image ? <img src={item.product.image} alt="" className="w-full h-full object-contain" /> : <Package size={14} className="text-gray-300" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-semibold text-gray-800 truncate">{item.product?.name ?? item.name ?? 'Mahsulot'}</p>
                                                            <p className="text-xs text-gray-400">{item.quantity} {t("dona", "шт.")}</p>
                                                        </div>
                                                        <p className="font-bold text-gray-900 text-sm shrink-0">{format(item.price * item.quantity)}</p>
                                                    </div>
                                                ))}
                                                {(order.items ?? []).length > 2 && (
                                                    <p className="text-xs text-gray-400 pb-2">+{(order.items ?? []).length - 2} {t("ta mahsulot", "товара")}</p>
                                                )}
                                            </div>
                                            <div className="flex items-center justify-between px-5 py-3 bg-gray-50">
                                                <div>
                                                    <p className="text-xs text-gray-400">{t("Jami", "Итого")}</p>
                                                    <p className="font-extrabold text-gray-900">{format(order.totalAmount ?? 0)}</p>
                                                </div>
                                                <Link href={`/orders/${order.id}`} className="text-sm text-blue-600 font-bold hover:underline flex items-center gap-1">
                                                    {t("Batafsil", "Подробнее")} <ChevronRight size={14} />
                                                </Link>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    )}

                    {/* ── Tab: Savat ───────────────────────────────────── */}
                    {tab === 'cart' && (
                        <div>
                            {cartItems.length === 0 ? (
                                <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                                    <ShoppingCart size={48} className="mx-auto text-gray-200 mb-4" />
                                    <p className="text-gray-500 font-semibold">{t("Savat bo'sh", "Корзина пуста")}</p>
                                    <Link href="/catalog" className="mt-4 inline-flex items-center gap-1 text-blue-600 font-bold text-sm hover:underline">
                                        {t("Xarid qilish", "Начать покупки")} <ChevronRight size={14} />
                                    </Link>
                                </div>
                            ) : (
                                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                    <div className="divide-y divide-gray-50">
                                        {cartItems.map((item, i) => (
                                            <div key={i} className="flex items-center gap-4 p-4">
                                                <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 shrink-0">
                                                    {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" /> : <Package size={18} className="m-auto mt-2 text-gray-300" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                                                    <p className="text-xs text-gray-400">{item.quantity} {t("dona", "шт.")}</p>
                                                </div>
                                                <p className="font-bold text-gray-900 shrink-0">{format(item.price * item.quantity)}</p>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="p-4 bg-gray-50 flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-gray-500">{t("Jami", "Итого")}</p>
                                            <p className="text-xl font-extrabold text-gray-900">{format(cartTotal)}</p>
                                        </div>
                                        <Link href="/cart" className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl text-sm transition-colors">
                                            {t("Savatga o'tish", "Перейти в корзину")}
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── Tab: Sozlamalar ──────────────────────────────── */}
                    {tab === 'settings' && (
                        <div className="space-y-4">
                            {/* Push Notifications */}
                            <PushNotificationButton />

                            {/* Shaxsiy ma'lumot */}
                            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                                <h3 className="font-bold text-gray-800 mb-5 flex items-center gap-2">
                                    <UserIcon size={16} className="text-blue-500" />
                                    {t("Shaxsiy ma'lumot", "Личные данные")}
                                </h3>
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="profile-name" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                            {t("Ism", "Имя")}
                                        </label>
                                        <input
                                            id="profile-name"
                                            title={t("Ismingizni kiriting", "Введите имя")}
                                            value={editName}
                                            onChange={e => setEditName(e.target.value)}
                                            className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-blue-400"
                                            placeholder={t("Ismingizni kiriting", "Введите имя")}
                                        />
                                    </div>
                                    <div>
                                        <label htmlFor="profile-phone" className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1.5">
                                            {t("Telefon", "Телефон")}
                                        </label>
                                        <input
                                            id="profile-phone"
                                            title={t("Telefon raqam", "Номер телефона")}
                                            value={user.phone}
                                            readOnly
                                            className="w-full border border-gray-100 rounded-xl px-3 py-2.5 text-sm bg-gray-50 text-gray-400"
                                            placeholder={t("Telefon", "Телефон")}
                                        />
                                    </div>
                                    <button
                                        onClick={async () => {
                                            setSaving(true);
                                            try {
                                                const res = await fetch('/api/auth/me', {
                                                    method: 'PATCH',
                                                    headers: { 'Content-Type': 'application/json' },
                                                    body: JSON.stringify({ phone: user.phone, name: editName.trim() }),
                                                });
                                                if (!res.ok) {
                                                    const err = await res.json();
                                                    toast.error(err.error || t("Saqlab bo'lmadi", "Не удалось сохранить"));
                                                } else {
                                                    const { user: updated } = await res.json();
                                                    useAuthStore.getState().updateUser({ name: updated.name });
                                                    toast.success(t("Saqlandi ✓", "Сохранено ✓"));
                                                }
                                            } catch {
                                                toast.error(t("Xatolik yuz berdi", "Произошла ошибка"));
                                            } finally {
                                                setSaving(false);
                                            }
                                        }}
                                        disabled={saving || editName.trim() === user.name}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-colors"
                                    >
                                        {saving ? t("Saqlanmoqda...", "Сохраняется...") : t("Saqlash", "Сохранить")}
                                    </button>
                                </div>
                            </div>

                            {/* Quick links */}
                            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                                {[
                                    { icon: Shield, label: t("Xavfsizlik", "Безопасность"), href: '#' },
                                    { icon: Bell, label: t("Bildirishnomalar", "Уведомления"), href: '#' },
                                    { icon: Gift, label: t("Bonus dasturi", "Бонусная программа"), href: '#' },
                                ].map((item, i) => (
                                    <Link
                                        key={i}
                                        href={item.href}
                                        className="flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-xl bg-blue-50 flex items-center justify-center">
                                                <item.icon size={14} className="text-blue-500" />
                                            </div>
                                            <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                                        </div>
                                        <ChevronRight size={14} className="text-gray-400" />
                                    </Link>
                                ))}
                            </div>

                            {/* Logout */}
                            <button
                                onClick={() => {
                                    logout();
                                    router.push('/');
                                    toast.success(t("Tizimdan chiqdingiz", "Вы вышли из системы"));
                                }}
                                className="w-full flex items-center justify-center gap-2 py-3.5 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-2xl border border-red-100 text-sm transition-colors"
                            >
                                <LogOut size={15} /> {t("Tizimdan chiqish", "Выйти из системы")}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
