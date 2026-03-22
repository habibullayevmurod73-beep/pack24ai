'use client';

import Script from 'next/script';

const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? '';

export default function GoogleAnalytics() {
    if (!GA_ID) return null;

    return (
        <>
            <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
                strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', '${GA_ID}', {
                        page_path: window.location.pathname,
                        send_page_view: true,
                    });
                `}
            </Script>
        </>
    );
}

// ─── Event tracking helper — client-side ishlating ───────────────────────────
// usage: trackEvent('add_to_cart', { product_name: 'Box', value: 15000 });
export function trackEvent(eventName: string, params?: Record<string, unknown>) {
    if (typeof window !== 'undefined' && window.gtag) {
        window.gtag('event', eventName, params);
    }
}

// TypeScript window extension
declare global {
    interface Window {
        gtag?: (...args: unknown[]) => void;
        dataLayer?: unknown[];
    }
}
