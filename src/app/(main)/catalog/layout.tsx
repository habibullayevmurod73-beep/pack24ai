
'use client';

import { CATEGORIES } from '@/lib/catalog-data';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function CatalogLayout({ children }: { children: React.ReactNode }) {
    const { language } = useLanguage();
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <div className="min-h-screen bg-white flex flex-col md:flex-row max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-8 font-sans">
            {/* Mobile Category Toggle */}
            <div className="md:hidden w-full mb-4">
                <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="w-full flex justify-between items-center bg-[#e33326] text-white p-4 rounded shadow text-lg font-bold uppercase"
                >
                    {language === 'uz' ? 'Mahsulotlar Katalogi' : language === 'ru' ? 'Каталог Товаров' : 'Product Catalog'}
                    <svg className={`w-6 h-6 transition-transform ${mobileMenuOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                </button>
            </div>

            {/* Sidebar (Desktop Sticky / Mobile Toggle) */}
            <aside className={`
                ${mobileMenuOpen ? 'block' : 'hidden'} 
                md:block 
                w-full md:w-[280px] lg:w-[300px] 
                flex-shrink-0
            `}>
                <div className="bg-white md:sticky md:top-6 selection:bg-red-100">
                    {/* Sidebar Header */}
                    <div className="bg-[#e33326] text-white py-4 px-5 flex justify-between items-center mb-0">
                        <h3 className="font-extrabold text-[15px] uppercase tracking-wide leading-none">
                            {language === 'uz' ? 'Katalog' : language === 'ru' ? 'Каталог Товаров' : 'Catalog'}
                        </h3>
                        <svg className="w-5 h-5 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </div>

                    {/* Category List */}
                    <nav className="border-x border-b border-gray-200">
                        {CATEGORIES.map((category) => {
                            const isActive = pathname === `/catalog/${category.slug}`;
                            return (
                                <Link
                                    key={category.id}
                                    href={`/catalog/${category.slug}`}
                                    className={`
                                        group relative flex items-center justify-between px-5 py-3 border-b border-gray-100 text-[14px] transition-all leading-snug
                                        ${isActive
                                            ? 'text-[#e33326] border-l-[3px] border-l-[#e33326] bg-white font-bold pl-[17px]'
                                            : 'text-gray-600 bg-white hover:text-[#e33326] hover:bg-gray-50 border-l-[3px] border-l-transparent pl-[17px] font-medium'}
                                    `}
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    <span>
                                        {category.name[language] || category.name['en']}
                                    </span>

                                    <span className={`text-gray-300 transform group-hover:translate-x-1 transition-transform ${isActive ? 'text-[#e33326]' : ''}`}>
                                        <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 min-w-0 pt-0">
                {children}
            </main>
        </div>
    );
}
