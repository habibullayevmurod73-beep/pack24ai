'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid, ShoppingBag, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export function BottomNav() {
    const pathname = usePathname();

    const navItems = [
        { href: '/mobile', icon: Home, label: 'Bosh sahifa' },
        { href: '/mobile/catalog', icon: Grid, label: 'Katalog' },
        { href: '/mobile/cart', icon: ShoppingBag, label: 'Savat' },
        { href: '/mobile/favorites', icon: Heart, label: 'Sevimlilar' },
        { href: '/mobile/profile', icon: User, label: 'Profil' },
    ];

    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-4 py-2 pb-safe-area-inset-bottom z-50">
            <div className="flex justify-between items-center max-w-md mx-auto">
                {navItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex flex-col items-center gap-1 transition-colors min-w-[60px]",
                                isActive ? "text-[#5D5FEF]" : "text-gray-400 hover:text-gray-600"
                            )}
                        >
                            <item.icon
                                className={cn("w-6 h-6", isActive && "fill-current")}
                                strokeWidth={isActive ? 2 : 2}
                            />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
