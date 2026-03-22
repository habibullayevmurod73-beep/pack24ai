'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useBannerStore } from '@/lib/store/useBannerStore';
import { useLanguage } from '@/lib/contexts/LanguageContext';

const INTERVAL_MS = 3000;

export default function HeroBannerSlider() {
    const { language } = useLanguage();
    const allBanners = useBannerStore((s) => s.banners);
    const heroBanners = allBanners
        .filter((b) => b.location === 'hero' && b.isActive)
        .sort((a, b) => a.order - b.order);

    const [current, setCurrent] = useState(0);
    const [paused, setPaused] = useState(false);
    const [animating, setAnimating] = useState(false);

    const goTo = useCallback(
        (index: number) => {
            if (animating) return;
            setAnimating(true);
            setTimeout(() => {
                setCurrent(index);
                setAnimating(false);
            }, 300);
        },
        [animating]
    );

    const next = useCallback(() => {
        goTo((current + 1) % heroBanners.length);
    }, [current, heroBanners.length, goTo]);

    const prev = useCallback(() => {
        goTo((current - 1 + heroBanners.length) % heroBanners.length);
    }, [current, heroBanners.length, goTo]);

    // Auto-play
    useEffect(() => {
        if (paused || heroBanners.length <= 1) return;
        const timer = setInterval(next, INTERVAL_MS);
        return () => clearInterval(timer);
    }, [paused, next, heroBanners.length]);

    if (heroBanners.length === 0) return null;

    const banner = heroBanners[current];
    const t = (uz: string, ru: string) => language === 'ru' ? ru : uz;

    return (
        <section
            className="relative overflow-hidden text-white"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
        >
            {/* Slides */}
            <div
                className={`bg-gradient-to-br ${banner.gradient} transition-opacity duration-300 ${animating ? 'opacity-0' : 'opacity-100'}`}
            >
                {/* bg blobs */}
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-white/5 rounded-full blur-2xl -translate-x-1/2 translate-y-1/2 pointer-events-none" />
                <div className="absolute top-1/2 right-1/4 w-40 h-40 bg-white/5 rounded-full blur-xl pointer-events-none" />

                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 relative z-10">
                    <div className="flex flex-col lg:flex-row items-center gap-6">
                        <div className="flex-1 max-w-2xl">
                            {/* Badge */}
                            {banner.badge && (
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 border border-white/30 rounded-full text-xs font-semibold text-white mb-3 backdrop-blur-sm">
                                    {banner.emoji && <span>{banner.emoji}</span>}
                                    {t(banner.badge.uz, banner.badge.ru)}
                                </div>
                            )}

                            {/* Title */}
                            <h1 className="text-2xl lg:text-4xl font-extrabold leading-tight tracking-tight mb-3">
                                {banner.highlightText ? (
                                    (() => {
                                        const title = t(banner.title.uz, banner.title.ru);
                                        const highlight = t(banner.highlightText.uz, banner.highlightText.ru);
                                        const parts = title.split(highlight);
                                        return (
                                            <>
                                                {parts[0]}
                                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-white/90 to-white/60 underline decoration-white/40">
                                                    {highlight}
                                                </span>
                                                {parts[1]}
                                            </>
                                        );
                                    })()
                                ) : (
                                    t(banner.title.uz, banner.title.ru)
                                )}
                            </h1>

                            {/* Subtitle */}
                            <p className="text-sm text-white/75 mb-5 leading-relaxed max-w-xl">
                                {t(banner.subtitle.uz, banner.subtitle.ru)}
                            </p>

                            {/* CTA */}
                            <Link
                                href={banner.link}
                                className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 border border-white/30 text-white font-bold px-5 py-2.5 rounded-xl backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-0.5 active:scale-95 text-sm"
                            >
                                {t("Ko'rish", "Смотреть")}
                                <ArrowRight size={15} />
                            </Link>
                        </div>

                        {/* Emoji visual - compact */}
                        {banner.emoji && (
                            <div className="hidden lg:flex items-center justify-center w-32 h-32 bg-white/10 rounded-2xl border border-white/20 backdrop-blur text-[60px] select-none shrink-0">
                                {banner.emoji}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Controls — only show if multiple banners */}
            {heroBanners.length > 1 && (
                <>
                    {/* Prev / Next arrows */}
                    <button
                        onClick={prev}
                        aria-label="Oldingi banner"
                        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/15 hover:bg-white/30 border border-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <button
                        onClick={next}
                        aria-label="Keyingi banner"
                        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-10 h-10 bg-white/15 hover:bg-white/30 border border-white/20 rounded-full flex items-center justify-center transition-colors backdrop-blur"
                    >
                        <ChevronRight size={20} />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
                        {heroBanners.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => goTo(i)}
                                aria-label={`Banner ${i + 1}`}
                                className={`rounded-full transition-all duration-300 ${
                                    i === current
                                        ? 'w-6 h-2 bg-white'
                                        : 'w-2 h-2 bg-white/40 hover:bg-white/60'
                                }`}
                            />
                        ))}
                    </div>

                    {/* Progress bar */}
                    {!paused && (
                        <div className="absolute bottom-0 left-0 h-0.5 bg-white/20 w-full z-20 overflow-hidden">
                            <div
                                key={`progress-${current}`}
                                className="h-full bg-white/60 banner-progress"
                            />
                        </div>
                    )}
                </>
            )}

            <style jsx>{`
                @keyframes progress-fill {
                    from { width: 0%; }
                    to   { width: 100%; }
                }
            `}</style>
        </section>
    );
}
