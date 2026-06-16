'use client';

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
    ym: any;
  }
}

const Analytics = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Google Analytics (GA4)
    const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (gaId && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(...args: any[]) { window.dataLayer.push(args); }
      window.gtag = gtag;
      gtag('js', new Date());
      gtag('config', gaId, { send_page_view: false });
    }
    // Yandex Metrika
    const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
    if (ymId && typeof window !== 'undefined') {
      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://mc.yandex.ru/metrika/tag.js';
      document.head.appendChild(script);
      
      window.ym = window.ym || function (...args: any[]) { 
        window.ym.a = window.ym.a || [];
        window.ym.a.push(args); 
      };
      window.ym(ymId, 'init', {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true,
      });
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && pathname) {
      let url = pathname;
      if (searchParams && searchParams.toString()) {
        url += `?${searchParams.toString()}`;
      }
      const gaId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
      if (gaId && typeof window.gtag === 'function') {
        window.gtag('event', 'page_view', { page_path: url });
      }
      const ymId = process.env.NEXT_PUBLIC_YANDEX_METRIKA_ID;
      if (ymId && typeof window.ym === 'function') {
        window.ym(ymId, 'hit', url);
      }
    }
  }, [pathname, searchParams]);

  return null;
};

export default Analytics;
