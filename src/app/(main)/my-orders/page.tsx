'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuthStore } from '@/lib/store/useAuthStore';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { useCurrencySafe } from '@/lib/contexts/CurrencyContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    Package, Clock, Loader2, ChevronRight, ArrowLeft,
    Truck, CheckCircle, XCircle, Box, ClipboardCheck,
    ShoppingCart, RefreshCw, Search, Filter
} from 'lucide-react';
import type { Language } from '@/lib/translations';

// ── i18n ─────────────────────────────────────────────────────────
const TX: Record<string, Partial<Record<Language, string>>> = {
    pageTitle:     { uz: "Buyurtmalar tarixi", ru: 'История заказов', en: 'Order History', qr: "Buyırtpalar tariyxı", zh: '订单历史', tr: 'Sipariş Geçmişi', tg: 'Таърихи фармоишҳо', kk: 'Тапсырыстар тарихы', tk: 'Sargyt taryhy', fa: 'تاریخ سفارشات' },
    noOrders:      { uz: "Hali buyurtma bermadingiz", ru: 'У вас ещё нет заказов', en: 'No orders yet', qr: "Alı buyırtpa bermediñiz", zh: '暂无订单', tr: 'Henüz siparişiniz yok', tg: 'Ҳанӯз фармоиш надодаед', kk: 'Тапсырыстар жоқ', tk: 'Entek sargyt ýok', fa: 'هنوز سفارشی ندارید' },
    startShopping: { uz: "Xarid qilishni boshlang!", ru: 'Начните покупки!', en: 'Start shopping!', qr: "Xarıd qılıwdı baslań!", zh: '开始购物！', tr: 'Alışverişe başlayın!', tg: 'Харидро оғоз кунед!', kk: 'Сатып алуды бастаңыз!', tk: 'Söwda edip başlaň!', fa: '!خرید را شروع کنید' },
    goToCatalog:   { uz: "Katalogga o'tish", ru: 'Перейти в каталог', en: 'Go to Catalog', qr: "Katalogqa ótiw", zh: '前往目录', tr: 'Kataloğa git', tg: 'Ба каталог гузаред', kk: 'Каталогқа өту', tk: 'Kataloga geçiň', fa: 'رفتن به کاتالوگ' },
    details:       { uz: "Batafsil ko'rish", ru: 'Подробнее', en: 'View Details', qr: "Batafsil kóriw", zh: '查看详情', tr: 'Detayları Gör', tg: 'Муфассалтар', kk: 'Толығырақ', tk: 'Jikme-jik', fa: 'مشاهده جزئیات' },
    total:         { uz: 'Jami', ru: 'Итого', en: 'Total', qr: 'Jami', zh: '总计', tr: 'Toplam', tg: 'Ҷамъ', kk: 'Жиыны', tk: 'Jemi', fa: 'مجموع' },
    pcs:           { uz: 'ta mahsulot', ru: 'товаров', en: 'items', qr: 'mal', zh: '件商品', tr: 'ürün', tg: 'маҳсулот', kk: 'тауар', tk: 'haryt', fa: 'محصول' },
    refresh:       { uz: 'Yangilash', ru: 'Обновить', en: 'Refresh', qr: 'Jańalaw', zh: '刷新', tr: 'Yenile', tg: 'Навсозӣ', kk: 'Жаңарту', tk: 'Täzelemek', fa: 'تازه‌سازی' },
    loading:       { uz: "Yuklanmoqda...", ru: 'Загрузка...', en: 'Loading...', qr: "Júklenmoqda...", zh: '加载中...', tr: 'Yükleniyor...', tg: 'Боркунӣ...', kk: 'Жүктелуде...', tk: 'Ýüklenýär...', fa: 'بارگذاری...' },
    loginRequired: { uz: "Buyurtmalar tarixini ko'rish uchun tizimga kiring", ru: 'Для просмотра истории войдите в систему', en: 'Please login to view order history', qr: "Tizimge kiriń", zh: '请登录查看', tr: 'Giriş yapın', tg: 'Барои дидани таърих ворид шавед', kk: 'Жүйеге кіріңіз', tk: 'Ulgama giriň', fa: 'برای مشاهده وارد شوید' },
    loginBtn:      { uz: 'Kirish', ru: 'Войти', en: 'Login', qr: 'Kiriw', zh: '登录', tr: 'Giriş', tg: 'Даромад', kk: 'Кіру', tk: 'Giriş', fa: 'ورود' },
    all:           { uz: 'Barchasi', ru: 'Все', en: 'All', qr: 'Barlıǵı', zh: '全部', tr: 'Tümü', tg: 'Ҳама', kk: 'Барлығы', tk: 'Hemmesi', fa: 'همه' },
    active:        { uz: 'Faol', ru: 'Активные', en: 'Active', qr: 'Faol', zh: '进行中', tr: 'Aktif', tg: 'Фаъол', kk: 'Белсенді', tk: 'Işjeň', fa: 'فعال' },
    completed:     { uz: 'Yakunlangan', ru: 'Завершённые', en: 'Completed', qr: 'Jaqınlangan', zh: '已完成', tr: 'Tamamlanan', tg: 'Анҷомёфта', kk: 'Аяқталған', tk: 'Tamamlanan', fa: 'تکمیل‌شده' },
    cancelled:     { uz: 'Bekor qilingan', ru: 'Отменённые', en: 'Cancelled', qr: 'Biykar etilgen', zh: '已取消', tr: 'İptal edilen', tg: 'Бекоршуда', kk: 'Бас тартылған', tk: 'Ýatyrylan', fa: 'لغوشده' },
    searchHint:    { uz: "Buyurtma raqami yoki mahsulot nomi...", ru: 'Номер заказа или название товара...', en: 'Order number or product name...', qr: "Buyırtpa nomeri...", zh: '订单号或商品名...', tr: 'Sipariş no veya ürün adı...', tg: 'Рақами фармоиш ё номи маҳсулот...', kk: 'Тапсырыс нөмірі немесе тауар аты...', tk: 'Sargyt belgisi ýa-da haryt ady...', fa: 'شماره سفارش یا نام محصول...' },
    orderCount:    { uz: 'ta buyurtma', ru: 'заказов', en: 'orders', qr: 'buyırtpa', zh: '个订单', tr: 'sipariş', tg: 'фармоиш', kk: 'тапсырыс', tk: 'sargyt', fa: 'سفارش' },
};

const t = (key: string, lang: Language): string =>
    TX[key]?.[lang] ?? TX[key]?.['en'] ?? key;

// ── Status config ────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, {
    icon: typeof Package;
    color: string;
    bgColor: string;
    labels: Partial<Record<Language, string>>;
}> = {
    new:        { icon: ClipboardCheck, color: 'text-blue-600',    bgColor: 'bg-blue-50 border-blue-200',    labels: { uz: 'Yangi',        ru: 'Новый',       en: 'New' } },
    processing: { icon: Box,            color: 'text-indigo-600',  bgColor: 'bg-indigo-50 border-indigo-200',labels: { uz: 'Jarayonda',    ru: 'В обработке', en: 'Processing' } },
    shipping:   { icon: Truck,          color: 'text-purple-600',  bgColor: 'bg-purple-50 border-purple-200',labels: { uz: "Yo'lda",       ru: 'В пути',      en: 'Shipping' } },
    delivered:  { icon: CheckCircle,    color: 'text-emerald-600', bgColor: 'bg-emerald-50 border-emerald-200', labels: { uz: 'Yetkazildi', ru: 'Доставлен',   en: 'Delivered' } },
    cancelled:  { icon: XCircle,        color: 'text-red-600',     bgColor: 'bg-red-50 border-red-200',      labels: { uz: 'Bekor',        ru: 'Отменён',     en: 'Cancelled' } },
};

type FilterKey = 'all' | 'active' | 'completed' | 'cancelled';

interface DBOrder {
    id: number;
    status: string;
    customerName: string | null;
    contactPhone: string | null;
    totalAmount: number | null;
    paymentMethod: string | null;
    deliveryMethod: string | null;
    createdAt: string;
    items: {
        id: number;
        quantity: number;
        price: number;
        product: { id: number; name: string; image: string } | null;
    }[];
}

export default function MyOrdersPage() {
    const { user, isAuthenticated } = useAuthStore();
    const { language } = useLanguage();
    const { format } = useCurrencySafe();
    const router = useRouter();

    const [orders, setOrders] = useState<DBOrder[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<FilterKey>('all');
    const [search, setSearch] = useState('');

    const fetchOrders = useCallback(async () => {
        if (!user?.phone) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/orders?contactPhone=${encodeURIComponent(user.phone)}`);
            if (res.ok) {
                const data = await res.json();
                setOrders(data);
            }
        } catch (e) {
            console.error('Failed to fetch orders', e);
        } finally {
            setLoading(false);
        }
    }, [user?.phone]);

    useEffect(() => {
        if (isAuthenticated && user?.phone) {
            fetchOrders();
        } else {
            setLoading(false);
        }
    }, [isAuthenticated, user?.phone, fetchOrders]);

    // ── Login talab qilinadi ──
    if (!isAuthenticated || !user) {
        return (
            <div className="min-h-[70vh] bg-[#f5f6fa] flex flex-col items-center justify-center p-8 text-center">
                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mb-5 shadow-sm border border-gray-100">
                    <Package size={40} className="text-gray-200" />
                </div>
                <h1 className="text-xl font-extrabold text-gray-900 mb-2">{t('loginRequired', language)}</h1>
                <Link href="/login" className="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold px-8 py-3 rounded-xl text-sm transition-colors">
                    {t('loginBtn', language)}
                </Link>
            </div>
        );
    }

    // ── Filtr ──
    const filtered = orders.filter(o => {
        if (filter === 'active') return ['new', 'processing', 'shipping'].includes(o.status);
        if (filter === 'completed') return o.status === 'delivered';
        if (filter === 'cancelled') return o.status === 'cancelled';
        return true;
    }).filter(o => {
        if (!search.trim()) return true;
        const q = search.toLowerCase();
        if (`#${o.id}`.includes(q) || `${o.id}`.includes(q)) return true;
        return o.items.some(item => item.product?.name?.toLowerCase().includes(q));
    });

    const FILTERS: { key: FilterKey; labelKey: string; count: number }[] = [
        { key: 'all',       labelKey: 'all',       count: orders.length },
        { key: 'active',    labelKey: 'active',     count: orders.filter(o => ['new', 'processing', 'shipping'].includes(o.status)).length },
        { key: 'completed', labelKey: 'completed',  count: orders.filter(o => o.status === 'delivered').length },
        { key: 'cancelled', labelKey: 'cancelled',  count: orders.filter(o => o.status === 'cancelled').length },
    ];

    return (
        <div className="min-h-screen bg-[#f5f6fa]">
            {/* Breadcrumb */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <nav className="flex items-center gap-1.5 text-xs text-gray-500">
                    <Link href="/" className="hover:text-blue-600">🏠</Link>
                    <ChevronRight size={12} />
                    <Link href="/profile" className="hover:text-blue-600">Profil</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-800 font-medium">{t('pageTitle', language)}</span>
                </nav>
            </div>

            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {/* Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <Link href="/profile" className="p-2 bg-white rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                            <ArrowLeft size={16} className="text-gray-600" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-extrabold text-gray-900">{t('pageTitle', language)}</h1>
                            <p className="text-xs text-gray-400">{orders.length} {t('orderCount', language)}</p>
                        </div>
                    </div>
                    <button
                        onClick={fetchOrders}
                        disabled={loading}
                        className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 font-semibold px-4 py-2 rounded-xl text-sm hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                        <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
                        {t('refresh', language)}
                    </button>
                </div>

                {/* Search + Filter bar */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-5">
                    <div className="flex flex-col sm:flex-row gap-3">
                        {/* Search */}
                        <div className="relative flex-1">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-blue-400"
                                placeholder={t('searchHint', language)}
                            />
                        </div>
                        {/* Filter pills */}
                        <div className="flex gap-2 overflow-x-auto">
                            {FILTERS.map(f => (
                                <button
                                    key={f.key}
                                    onClick={() => setFilter(f.key)}
                                    className={`flex items-center gap-1.5 whitespace-nowrap px-3.5 py-2 rounded-xl text-xs font-bold transition-colors ${
                                        filter === f.key
                                            ? 'bg-blue-600 text-white'
                                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {t(f.labelKey, language)}
                                    {f.count > 0 && (
                                        <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-extrabold ${
                                            filter === f.key ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'
                                        }`}>
                                            {f.count}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 size={28} className="animate-spin text-blue-500" />
                    </div>
                )}

                {/* Empty state */}
                {!loading && filtered.length === 0 && (
                    <div className="bg-white rounded-2xl border border-gray-100 p-16 text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-5">
                            <ShoppingCart size={36} className="text-gray-200" />
                        </div>
                        <h2 className="text-lg font-extrabold text-gray-900 mb-2">{t('noOrders', language)}</h2>
                        <p className="text-sm text-gray-400 mb-6">{t('startShopping', language)}</p>
                        <Link
                            href="/catalog"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl text-sm transition-colors"
                        >
                            {t('goToCatalog', language)}
                            <ChevronRight size={14} />
                        </Link>
                    </div>
                )}

                {/* Orders list */}
                {!loading && filtered.length > 0 && (
                    <div className="space-y-4">
                        {filtered.map(order => {
                            const statusCfg = STATUS_CONFIG[order.status] ?? STATUS_CONFIG.new;
                            const StatusIcon = statusCfg.icon;
                            const date = new Date(order.createdAt);

                            return (
                                <Link
                                    key={order.id}
                                    href={`/orders/${order.id}`}
                                    className="block bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:border-blue-200 transition-all group"
                                >
                                    {/* Top row */}
                                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${statusCfg.bgColor} border`}>
                                                <StatusIcon size={16} className={statusCfg.color} />
                                            </div>
                                            <div>
                                                <div className="flex items-center gap-2">
                                                    <span className="font-extrabold text-gray-900 text-sm">#{order.id}</span>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusCfg.bgColor} ${statusCfg.color}`}>
                                                        {statusCfg.labels[language] ?? statusCfg.labels.en}
                                                    </span>
                                                </div>
                                                <p className="text-[11px] text-gray-400 flex items-center gap-1 mt-0.5">
                                                    <Clock size={10} />
                                                    {date.toLocaleDateString('uz-UZ', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    {' · '}
                                                    {date.toLocaleTimeString('uz-UZ', { hour: '2-digit', minute: '2-digit' })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-extrabold text-gray-900">{format(order.totalAmount ?? 0)}</p>
                                            <p className="text-[10px] text-gray-400">{order.items.length} {t('pcs', language)}</p>
                                        </div>
                                    </div>

                                    {/* Products preview */}
                                    <div className="px-5 py-3">
                                        <div className="flex items-center gap-2">
                                            {/* Product thumbnails */}
                                            <div className="flex -space-x-2">
                                                {order.items.slice(0, 4).map((item, i) => (
                                                    <div
                                                        key={i}
                                                        className="w-10 h-10 rounded-xl bg-gray-50 border-2 border-white overflow-hidden shrink-0"
                                                        title={item.product?.name}
                                                    >
                                                        {item.product?.image
                                                            ? <img src={item.product.image} alt="" className="w-full h-full object-contain" />
                                                            : <Box size={14} className="m-auto mt-2 text-gray-300" />
                                                        }
                                                    </div>
                                                ))}
                                                {order.items.length > 4 && (
                                                    <div className="w-10 h-10 rounded-xl bg-gray-100 border-2 border-white flex items-center justify-center shrink-0">
                                                        <span className="text-[10px] font-bold text-gray-500">+{order.items.length - 4}</span>
                                                    </div>
                                                )}
                                            </div>

                                            {/* Product names */}
                                            <div className="flex-1 min-w-0 ml-2">
                                                <p className="text-xs text-gray-600 truncate">
                                                    {order.items.map(i => i.product?.name ?? 'Mahsulot').join(', ')}
                                                </p>
                                            </div>

                                            {/* Arrow */}
                                            <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                                        </div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
