'use client';

import { useEffect } from 'react';
import { useProductStore } from '@/lib/store/useProductStore';
import { useHasMounted } from '@/lib/hooks/useHasMounted';

import HomeHero from '@/components/home/HomeHero';
import MobileCategoryStrip from '@/components/home/MobileCategoryStrip';
import FeatureCards from '@/components/home/FeatureCards';
import ConfiguratorSection from '@/components/home/ConfiguratorSection';
import ProductsSection from '@/components/home/ProductsSection';
import StatsSection from '@/components/home/StatsSection';
import ReviewsSection from '@/components/home/ReviewsSection';
import CTABanner from '@/components/home/CTABanner';

export default function Home() {
    const { fetchProducts } = useProductStore();
    const hasMounted = useHasMounted();

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    if (!hasMounted) return null;

    return (
        <div className="min-h-screen bg-[#f5f6fa]">
            {/* Slider + Category Showcase */}
            <HomeHero />

            {/* Mobil kategoriyalar */}
            <MobileCategoryStrip />

            {/* 6 xususiyat */}
            <FeatureCards />

            {/* 3D konfigurator + B2B */}
            <ConfiguratorSection />

            {/* Mashhur mahsulotlar */}
            <ProductsSection />

            {/* Statistika */}
            <StatsSection />

            {/* Sharhlar */}
            <ReviewsSection />

            {/* CTA */}
            <CTABanner />
        </div>
    );
}