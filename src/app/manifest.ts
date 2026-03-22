import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
    return {
        name:             'Pack24 — Qadoqlash Yechimlari',
        short_name:       'Pack24',
        description:      "O'zbekistonda eng sifatli qadoqlash mahsulotlari. Arzon narxlar, tez yetkazib berish.",
        start_url:        '/',
        display:          'standalone',
        background_color: '#ffffff',
        theme_color:      '#064E3B',
        orientation:      'portrait-primary',
        categories:       ['shopping', 'business', 'productivity'],
        lang:             'uz',
        icons: [
            { src: '/favicon.ico',   sizes: 'any',       type: 'image/x-icon' },
            { src: '/icon-192.png',  sizes: '192x192',   type: 'image/png', purpose: 'maskable' },
            { src: '/icon-512.png',  sizes: '512x512',   type: 'image/png', purpose: 'any' },
        ],
        screenshots: [
            {
                src:   '/screenshot-wide.png',
                sizes: '1280x720',
                type:  'image/png',
                label: 'Pack24 — Bosh sahifa',
            },
        ],
        shortcuts: [
            {
                name:      'Katalog',
                url:       '/catalog',
                icons: [{ src: '/favicon.ico', sizes: 'any' }],
            },
            {
                name:      'Savat',
                url:       '/cart',
                icons: [{ src: '/favicon.ico', sizes: 'any' }],
            },
        ],
        prefer_related_applications: false,
    };
}
