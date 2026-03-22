'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    Folders,
    Package,
    Users,
    Settings,
    Bell,
    Search,
    Menu,
    X,
    Phone,
    PhoneIncoming,
    PhoneOff,
    CheckCircle,
    ScanLine,
    ClipboardList,
    Percent,
    Barcode,
    ShoppingCart,
    Factory,
    MessageSquare,
    Box,
    TrendingUp,
    Bot,
    CreditCard,
    Truck,
    MapPin,
    UserCog,
    Crown,
    Store,
    Plus,
    ChevronDown,
    LogOut,
    ExternalLink,
    Newspaper
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { useCategoryStore } from '@/lib/store/useCategoryStore';
import { useProductStore } from '@/lib/store/useProductStore';
import { useHasMounted } from '@/lib/hooks/useHasMounted';

interface NavItem {
    name: string;
    href: string;
    icon: any;
    badge?: string;
    subItems?: { name: string; href: string; badge?: string }[];
    hasDropdown?: boolean;
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const hasMounted = useHasMounted();
    const router = useRouter(); // Restored router

    // Rehydrate stores if needed (for skipHydration: true)
    useEffect(() => {
        useCategoryStore.persist.rehydrate();
    }, []);

    const [sidebarOpen, setSidebarOpen] = useState(false);
    const pathname = usePathname();
    const [openDropdowns, setOpenDropdowns] = useState<Record<string, boolean>>({});
    const [newOrdersCount, setNewOrdersCount] = useState(0);
    const [lastChecked, setLastChecked] = useState(new Date().toISOString());

    // Fixed type to include all used properties
    const [incomingCall, setIncomingCall] = useState<{
        name: string;
        phone: string;
        avatar: string;
        lastOrder: string;
    } | null>(null);

    // ── Real-time polling: yangi buyurtmalar har 30 sekundda ────────────
    useEffect(() => {
        const poll = async () => {
            try {
                const res = await fetch(`/api/admin/notifications?since=${lastChecked}`);
                if (!res.ok) return;
                const data = await res.json();
                if (data.newOrdersCount > newOrdersCount) {
                    toast(`🔔 ${data.newOrdersCount - newOrdersCount} ta yangi buyurtma!`, { duration: 4000 });
                }
                setNewOrdersCount(data.newOrdersCount ?? 0);
                setLastChecked(data.timestamp ?? new Date().toISOString());
            } catch { /* silent fail */ }
        };
        poll(); // initial
        const interval = setInterval(poll, 30_000);
        return () => clearInterval(interval);
    }, []); // eslint-disable-line

    if (!hasMounted) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
                    <p className="text-sm font-medium text-slate-500 animate-pulse">Tizim yuklanmoqda...</p>
                </div>
            </div>
        );
    }



    const toggleDropdown = (name: string) => {
        setOpenDropdowns(prev => ({
            ...prev,
            [name]: !prev[name]
        }));
    };

    const handleAnswerCall = () => {
        toast.success("Qo'ng'iroq qabul qilindi");
        setIncomingCall(null);
    };

    const handleDeclineCall = () => {
        setIncomingCall(null);
    };

    const navItems: NavItem[] = [
        { name: 'Boshqaruv paneli', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Buyurtmalar', href: '/admin/orders', icon: ShoppingCart },
        { name: 'Hisobotlar', href: '/admin/reports', icon: TrendingUp },
        { name: 'Ishlab chiqarish (B2B)', href: '/admin/production', icon: Factory },
        {
            name: 'Mijozlar (CRM)',
            href: '/admin/customers',
            icon: Users,
            hasDropdown: true,
            subItems: [
                { name: 'Mijozlar bazasi', href: '/admin/customers' },
                { name: 'Call Center', href: '/admin/customers/calls' }
            ]
        },
        { name: 'Chat', href: '/admin/chat', icon: MessageSquare },
        {
            name: 'Mahsulotlar',
            href: '/admin/products',
            icon: Box,
            hasDropdown: true,
            subItems: [
                { name: 'Каталог товаров', href: '/admin/products/categories' },
                { name: 'Mahsulotlar', href: '/admin/products' },
                { name: 'Import (CSV/Excel)', href: '/admin/products/import', badge: 'NEW' },
                { name: 'Chegirma (Pro)', href: '/admin/products/discounts', badge: 'PRO' },
                { name: 'IKPU', href: '/admin/products/ikpu', badge: 'PRO' },
                { name: 'Omborxona (Pro)', href: '/admin/products/warehouse', badge: 'PRO' }
            ]
        },
        {
            name: 'Marketing',
            href: '/admin/marketing',
            icon: TrendingUp,
            hasDropdown: true,
            subItems: [
                { name: 'Rassilka', href: '/admin/marketing/newsletter' },
                { name: 'Promokod', href: '/admin/marketing/promo' },
                { name: 'Manbalar', href: '/admin/marketing/sources', badge: 'PRO' },
                { name: 'SMS rassilka', href: '/admin/marketing/sms' },
                { name: 'Kanal uchun post', href: '/admin/marketing/posts' },
                { name: 'Banner', href: '/admin/marketing/banners' },
                { name: 'Sharhlar', href: '/admin/marketing/reviews' }
            ]
        },
        { name: 'Yangiliklar', href: '/admin/news', icon: Newspaper },

        {
            name: 'Platformalar',
            href: '/admin/platforms',
            icon: Bot,
            hasDropdown: true,
            subItems: [
                { name: 'Telegram bot', href: '/admin/platforms/telegram' },
                { name: 'Veb-sayt', href: '/admin/platforms/website' },
                { name: 'QR katalog', href: '/admin/platforms/qr', badge: 'PRO' }
            ]
        },
        { name: 'To‘lov turi', href: '/admin/payments', icon: CreditCard },
        { name: 'Yetkazib berish', href: '/admin/delivery', icon: Truck },
        { name: 'Filiallar', href: '/admin/branches', icon: MapPin },
        {
            name: 'Xodimlar',
            href: '/admin/staff',
            icon: UserCog,
            hasDropdown: true,
            subItems: [
                { name: 'Xodimlar', href: '/admin/staff' },
                { name: 'Rollar', href: '/admin/staff/roles', badge: 'PRO' },
                { name: 'Kuryer', href: '/admin/staff/couriers', badge: 'PRO' }
            ]
        },
        { name: 'Tarif rejasi', href: '/admin/subscription', icon: Crown },
        { name: 'Robo market', href: '/admin/market', icon: Store },
    ];

    return (
        <div className="min-h-screen bg-[#f3f4f6] flex font-sans text-slate-900">
            {/* Fixed Sidebar */}
            <aside className="w-[260px] h-screen bg-white border-r border-gray-200 flex flex-col fixed left-0 top-0 z-50 overflow-hidden shadow-[2px_0_24px_rgba(0,0,0,0.02)]">
                {/* Header: Project Selector */}
                <div className="h-16 flex items-center px-5 border-b border-gray-100 justify-between shrink-0 bg-white z-10">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center shrink-0">
                            <span className="font-bold text-sm">A</span>
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900 truncate">Antigravity AI</span>
                            <span className="text-[10px] text-slate-400">Project ID: #8832</span>
                        </div>
                    </div>
                    <button className="text-emerald-500 hover:bg-emerald-50 p-1.5 rounded-md transition-colors" aria-label="Add New" title="Add New">
                        <Plus size={18} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-4 overflow-y-auto scrollbar-hide">
                    <ul className="space-y-0.5 px-3">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            // Check exact match for dashboard, inclusive for others to support sub-routes
                            const isActive = item.href === '/admin/dashboard'
                                ? pathname === item.href
                                : pathname.startsWith(item.href);

                            return (
                                <li key={item.name}>
                                    <div className="relative">
                                        <Link
                                            href={item.href}
                                            onClick={(e) => {
                                                if (item.hasDropdown) {
                                                    e.preventDefault();
                                                    toggleDropdown(item.name);
                                                }
                                            }}
                                            className={cn(
                                                "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200 group cursor-pointer",
                                                isActive
                                                    ? "bg-blue-50 text-blue-700 font-semibold" // Matches "Mijozlar" style request
                                                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                {Icon && <Icon size={18} strokeWidth={isActive ? 2 : 1.8} className={cn(isActive ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />}
                                                <span className="text-[14px]">{item.name}</span>
                                            </div>
                                            {item.hasDropdown && (
                                                <ChevronDown
                                                    size={14}
                                                    className={cn(
                                                        "text-slate-400 transition-transform duration-200",
                                                        openDropdowns[item.name] ? "rotate-180" : ""
                                                    )}
                                                />
                                            )}
                                        </Link>
                                    </div>
                                    {/* Dropdown Items Mock */}
                                    {item.hasDropdown && openDropdowns[item.name] && (
                                        <ul className="pl-9 pr-2 py-1 space-y-1 animate-in slide-in-from-top-1 duration-200">
                                            {item.subItems ? (
                                                item.subItems.map((sub) => (
                                                    <li key={sub.name}>
                                                        <Link href={sub.href} className="flex items-center justify-between px-3 py-1.5 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-md transition-colors">
                                                            <span>{sub.name}</span>
                                                            {sub.badge && (
                                                                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-600 px-1.5 py-0.5 rounded ml-2">{sub.badge}</span>
                                                            )}
                                                        </Link>
                                                    </li>
                                                ))
                                            ) : (
                                                ['Ro\'yxat', 'Qo\'shish'].map((sub) => (
                                                    <li key={sub}>
                                                        <Link href="#" className="block px-3 py-1.5 text-sm text-slate-500 hover:text-blue-600 hover:bg-blue-50/50 rounded-md transition-colors">
                                                            {sub}
                                                        </Link>
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    )}
                                </li>
                            );
                        })}
                    </ul>

                    {/* Settings Separator */}
                    <div className="my-4 border-t border-gray-100 mx-5"></div>

                    <ul className="px-3">
                        <li>
                            <Link
                                href="/admin/settings"
                                className={cn(
                                    "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
                                    pathname === '/admin/settings'
                                        ? "bg-blue-50 text-blue-700 font-semibold"
                                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                )}
                            >
                                <Settings size={18} strokeWidth={1.8} className={cn(pathname === '/admin/settings' ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600")} />
                                <span className="text-[14px]">Sozlamalar</span>
                            </Link>
                        </li>
                    </ul>
                </nav>

                {/* Footer / Logout */}
                <div className="p-4 border-t border-gray-100 shrink-0 bg-white">
                    <button
                        onClick={() => {
                            // Cookie o'chirish (middleware uchun)
                            document.cookie = 'admin_auth=; path=/; max-age=0; SameSite=Strict';
                            // Legacy localStorage ham tozalash
                            localStorage.removeItem('admin_auth');
                            router.push('/admin/login');
                        }}
                        className="flex w-full items-center justify-center space-x-2 text-slate-500 hover:text-red-600 hover:bg-red-50 py-2 rounded-lg transition-all text-sm font-medium"
                    >
                        <LogOut size={16} />
                        <span>Tizimdan chiqish</span>
                    </button>
                </div>

            </aside>

            {/* Main Content Area (Offset by Sidebar width) */}
            <div className="flex-1 flex flex-col min-w-0 ml-[260px] bg-[#f8fafc]">
                {/* Clean Header */}
                <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm transition-all">
                    <div>
                        <h2 className="text-xl font-bold text-slate-800 tracking-tight">
                            {navItems.find(i => pathname.startsWith(i.href))?.name || 'Boshqaruv Paneli'}
                        </h2>
                    </div>

                    {/* Global Search */}
                    <div className="flex-1 max-w-xl mx-12 hidden md:block">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Global qidiruv (Mijoz, Buyurtma ID, Telefon)..."
                                className="w-full bg-gray-50/50 border border-gray-200 rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all placeholder:text-gray-400"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                                <kbd className="hidden group-focus-within:inline-flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-medium text-gray-500 bg-gray-100 rounded border border-gray-200">
                                    <span className="text-xs">⌘</span>K
                                </kbd>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors" aria-label="Bildirishnomalar">
                            <Bell size={20} />
                            {newOrdersCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center border-2 border-white px-0.5">
                                    {newOrdersCount > 99 ? '99+' : newOrdersCount}
                                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75" />
                                </span>
                            )}
                        </button>

                        <div className="flex items-center space-x-3 h-10 cursor-pointer hover:bg-gray-50 px-2 rounded-lg transition-colors border border-transparent hover:border-gray-100">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold border border-blue-200">
                                A
                            </div>
                            <div className="text-left hidden sm:block">
                                <p className="text-sm font-bold text-slate-800 leading-none">Abror</p>
                                <p className="text-[11px] text-slate-400 mt-0.5">Administrator</p>
                            </div>
                            <ChevronDown size={14} className="text-slate-400" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {children}
                    </div>
                </main>
            </div>
            {/* Incoming Call Popup */}
            {incomingCall && (
                <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
                    <div className="bg-slate-900/95 backdrop-blur-md text-white p-5 rounded-2xl shadow-2xl border border-slate-700 w-80">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2 text-emerald-400">
                                <span className="relative flex h-3 w-3">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                                </span>
                                <span className="text-xs font-bold uppercase tracking-wider">Kiruvchi qo'ng'iroq...</span>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold shadow-lg">
                                {incomingCall.avatar}
                            </div>
                            <div>
                                <h3 className="text-lg font-bold leading-tight">{incomingCall.name}</h3>
                                <p className="text-slate-400 text-sm mt-0.5">{incomingCall.phone}</p>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-xl p-3 mb-6 border border-slate-700/50">
                            <p className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Oxirgi xarid:</p>
                            <div className="flex items-center gap-2">
                                <Box size={14} className="text-blue-400" />
                                <span className="text-sm font-medium text-slate-200">{incomingCall.lastOrder}</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={handleDeclineCall}
                                className="flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-3 rounded-xl font-semibold transition-colors border border-red-500/20"
                            >
                                <X size={20} />
                                Rad etish
                            </button>
                            <button
                                onClick={handleAnswerCall}
                                className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all transform hover:scale-[1.02]"
                            >
                                <Phone size={20} />
                                Qabul qilish
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Toaster position="top-right" expand={true} richColors />
        </div>
    );
}
