'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useLanguage } from '@/lib/contexts/LanguageContext';

/* ── Ma'lumotlar ─────────────────────────────── */
const CATEGORIES = [
    { slug: 'kartonnye-korobki',              image: 'https://pack24.ru/upload/resize_cache/iblock/b5e/200_200_1/b5e1c3f05e3d14e2d4e16e7a2c8b9f4a.jpg', ru: 'Картонные коробки',            uz: 'Karton qutilar',          price: '3,85' },
    { slug: 'kartonnye-konverty',             image: 'https://pack24.ru/upload/resize_cache/iblock/8a1/200_200_1/8a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d.jpg', ru: 'Картонные конверты',           uz: 'Karton konvertlar',        price: '16,70' },
    { slug: 'kurierskie-pakety-belyye-standart', image: 'https://pack24.ru/upload/resize_cache/iblock/c3d/200_200_1/c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8.jpg', ru: 'Курьерские пакеты белые (Стандарт)', uz: 'Kuryer paketlari oq (Standart)', price: '0,79' },
    { slug: 'kurierskie-i-sejf-pakety',       image: 'https://pack24.ru/upload/resize_cache/iblock/d4e/200_200_1/d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9.jpg', ru: 'Курьерские и сейф пакеты',  uz: 'Kuryer va seyf paketlar', price: '0,79' },
    { slug: 'samosbornyye-korobki',           image: 'https://pack24.ru/upload/resize_cache/iblock/e5f/200_200_1/e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0.jpg', ru: 'Самосборные коробки',        uz: "O'z-o'zidan yig'iladigan", price: '3,85' },
    { slug: 'kraft-konverty',                 image: 'https://pack24.ru/upload/resize_cache/iblock/f6a/200_200_1/f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1.jpg', ru: 'Крафт конверты',              uz: 'Kraft konvertlar',         price: '2,99' },
    { slug: 'pakety-ziplock-sverkhprochnyye', image: 'https://pack24.ru/upload/resize_cache/iblock/a7b/200_200_1/a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2.jpg', ru: 'Пакеты зиплок сверхпрочные', uz: 'Zip-lock paketlar (kuchli)', price: '0,53' },
    { slug: 'kurierskie-pakety-ekonom',       image: 'https://pack24.ru/upload/resize_cache/iblock/b8c/200_200_1/b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3.jpg', ru: 'Курьерские пакеты (Эконом)', uz: 'Kuryer paketlar (Ekonom)',  price: '0,97' },
    { slug: 'pochtovye-korobki',              image: 'https://pack24.ru/upload/resize_cache/iblock/c9d/200_200_1/c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4.jpg', ru: 'Почтовые коробки',           uz: 'Pochta qutilar',           price: '15,55' },
    { slug: 'pakety-pochta-rossii',           image: 'https://pack24.ru/upload/resize_cache/iblock/d0e/200_200_1/d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5.jpg', ru: 'Пакеты Почта России',        uz: 'Rossiya Pochta paketlari', price: '4,11' },
    { slug: 'pakety-slajdery-50mkm',          image: 'https://pack24.ru/upload/resize_cache/iblock/e1f/200_200_1/e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6.jpg', ru: 'Пакеты слайдеры матовые 50 мкм', uz: 'Matli slayder paketlar 50 mkm', price: '1,57' },
    { slug: 'pakety-iz-vpf-s-kleevym',        image: 'https://pack24.ru/upload/resize_cache/iblock/f2a/200_200_1/f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7.jpg', ru: 'Пакеты из ВПФ с клеевым клапаном', uz: 'Havo pufakli plyonkali paketlar', price: '4,13' },
    { slug: 'arkhivnyye-korobki',             image: 'https://pack24.ru/upload/resize_cache/iblock/a3b/200_200_1/a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8.jpg', ru: 'Архивные коробки',           uz: 'Arxiv qutilar',            price: '91,85' },
    { slug: 'bopp-pakety',                    image: 'https://pack24.ru/upload/resize_cache/iblock/b4c/200_200_1/b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9.jpg', ru: 'Полипропиленовые / БОПП пакеты', uz: 'Polipropilen / BOPP paketlar', price: '0,45' },
    { slug: 'tsvetnyye-konverty',             image: 'https://pack24.ru/upload/resize_cache/iblock/c5d/200_200_1/c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0.jpg', ru: 'Цветные конверты',           uz: 'Rangli konvertlar',        price: '7,50' },
    { slug: 'bumaga-tisyu',                   image: 'https://pack24.ru/upload/resize_cache/iblock/d6e/200_200_1/d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1.jpg', ru: 'Бумага тишью',              uz: 'Tishyu qog\'oz',           price: '762,00' },
    { slug: 'pvd-rukav-chernyy',              image: 'https://pack24.ru/upload/resize_cache/iblock/e7f/200_200_1/e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2.jpg', ru: 'ПВД рукав черный',          uz: 'PVD qo\'ng\'ir shirma',     price: '1 680,00' },
    { slug: 'pakety-mail-light',              image: 'https://pack24.ru/upload/resize_cache/iblock/f8a/200_200_1/f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3.jpg', ru: 'Пакеты Майл Лайт с воздушной подушкой', uz: 'Mail Light havo yostiqli paketlar', price: '9,17' },
    { slug: 'pakety-slajdery-70mkm',          image: 'https://pack24.ru/upload/resize_cache/iblock/a9b/200_200_1/a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4.jpg', ru: 'Пакеты слайдеры матовые 70 мкм', uz: 'Matli slayder paketlar 70 mkm', price: '1,10' },
    { slug: 'zip-lock-pakety',                image: 'https://pack24.ru/upload/resize_cache/iblock/b0c/200_200_1/b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5.jpg', ru: 'Пакеты Зиплок (zip lock)',   uz: 'Zip-lock paketlar',        price: '0,15' },
    { slug: 'kartonnye-korobki-dlya-podarkov', image: 'https://pack24.ru/upload/resize_cache/iblock/c1d/200_200_1/c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6.jpg', ru: 'Картонные коробки для подарков', uz: 'Sovg\'a karton qutilar', price: '16,80' },
    { slug: 'kurierskie-pakety-chernye',      image: 'https://pack24.ru/upload/resize_cache/iblock/d2e/200_200_1/d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7.jpg', ru: 'Курьерские пакеты черные',  uz: 'Qora kuryer paketlar',     price: '0,83' },
    { slug: 'pakety-chernye-s-vozdushnoy',    image: 'https://pack24.ru/upload/resize_cache/iblock/e3f/200_200_1/e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8.jpg', ru: 'Пакеты Черные с воздушной подушкой', uz: 'Qora havo yostiqli paketlar', price: '14,05' },
    { slug: 'prozrachnyye-pakety-doy-pak',    image: 'https://pack24.ru/upload/resize_cache/iblock/f4a/200_200_1/f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9.jpg', ru: 'Прозрачные пакеты дой-пак', uz: 'Shaffof doy-pak paketlar',  price: '4,07' },
    { slug: 'podlozhki-laminirovannye',       image: 'https://pack24.ru/upload/resize_cache/iblock/a5b/200_200_1/a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0.jpg', ru: 'Подложки ламинированные',   uz: 'Laminatsiyalangan yostiqlar', price: '3,13' },
    { slug: 'pakety-pvd-dlya-marketplejsov',  image: 'https://pack24.ru/upload/resize_cache/iblock/b6c/200_200_1/b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1.jpg', ru: 'Пакеты ПВД для маркетплейсов', uz: 'Marketplace uchun PVD paketlar', price: '0,50' },
    { slug: 'pakety-slajdery-s-begunkom',     image: 'https://pack24.ru/upload/resize_cache/iblock/c7d/200_200_1/c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2.jpg', ru: 'Пакеты слайдеры с бегунком', uz: 'Yugurchakli slayder paketlar', price: '1,85' },
    { slug: 'plenka-upakovochnaya',           image: 'https://pack24.ru/upload/resize_cache/iblock/d8e/200_200_1/d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3.jpg', ru: 'Пленка упаковочная',        uz: 'Qadoqlash plyonkasi',      price: '1 635,00' },
    { slug: 'kurierskie-pakety-prozrachnye',  image: 'https://pack24.ru/upload/resize_cache/iblock/e9f/200_200_1/e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4.jpg', ru: 'Курьерские пакеты прозрачные', uz: 'Shaffof kuryer paketlar',  price: '1,07' },
    { slug: 'zapajshiki-paketov',             image: 'https://pack24.ru/upload/resize_cache/iblock/f0a/200_200_1/f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5.jpg', ru: 'Запайщики пакетов и пленки', uz: 'Paket va plyonka yopuvchi', price: '4 460,00' },
    { slug: 'kraft-pakety',                   image: 'https://pack24.ru/upload/resize_cache/iblock/a1b/200_200_1/a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6.jpg', ru: 'Крафт пакеты',              uz: 'Kraft paketlar',           price: '1,71' },
    { slug: 'doy-pack',                       image: 'https://pack24.ru/upload/resize_cache/iblock/b2c/200_200_1/b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7.jpg', ru: 'Пакеты Дой-Пак (Doy Pack)', uz: 'Doy-Pak paketlar',         price: '3,60' },
    { slug: 'polietilennovye-pakety',         image: 'https://pack24.ru/upload/resize_cache/iblock/c3d/200_200_1/c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8.jpg', ru: 'Полиэтиленовые пакеты',    uz: 'Polietilen paketlar',       price: '0,91' },
    { slug: 'vozdushno-puzyrkovaya-plenka',   image: 'https://pack24.ru/upload/resize_cache/iblock/d4e/200_200_1/d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9.jpg', ru: 'Воздушно-пузырьковая плёнка', uz: 'Havo pufakli plyonka',    price: '64,10' },
    { slug: 'vozdushnaya-lenta',              image: 'https://pack24.ru/upload/resize_cache/iblock/e5f/200_200_1/e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0.jpg', ru: 'Воздушная упаковочная лента', uz: 'Havo qadoqlash lentasi',  price: '5 745,00' },
    { slug: 'pakety-s-vozdushnoj-podushkoj',  image: 'https://pack24.ru/upload/resize_cache/iblock/f6a/200_200_1/f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1.jpg', ru: 'Пакеты с воздушной подушкой', uz: 'Havo yostiqli paketlar',  price: '3,31' },
    { slug: 'upakovochnaya-bumaga',           image: 'https://pack24.ru/upload/resize_cache/iblock/a7b/200_200_1/a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2.jpg', ru: 'Упаковочная бумага',        uz: 'Qadoqlash qog\'ozi',       price: '310,00' },
    { slug: 'bumazhnye-konverty',             image: 'https://pack24.ru/upload/resize_cache/iblock/b8c/200_200_1/b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3.jpg', ru: 'Бумажные конверты',         uz: 'Qog\'oz konvertlar',       price: '2,05' },
    { slug: 'termoetiketki',                  image: 'https://pack24.ru/upload/resize_cache/iblock/c9d/200_200_1/c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4.jpg', ru: 'Самоклеящиеся термоэтикетки', uz: 'Termoetiketkalar',       price: '94,80' },
    { slug: 'scotch-kleykaya-lenta',          image: 'https://pack24.ru/upload/resize_cache/iblock/d0e/200_200_1/d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5.jpg', ru: 'Скотч и клейкая лента',    uz: 'Skotch va yelim lenta',    price: '27,90' },
    { slug: 'stretch-plenka',                 image: 'https://pack24.ru/upload/resize_cache/iblock/e1f/200_200_1/e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6.jpg', ru: 'Стрейч-плёнка',            uz: 'Streich-plyonka',          price: '207,00' },
    { slug: 'napolniteli',                    image: 'https://pack24.ru/upload/resize_cache/iblock/f2a/200_200_1/f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7.jpg', ru: 'Наполнители',               uz: 'To\'ldiruvchilar',         price: '193,00' },
    { slug: 'tubusy-kartonnye',               image: 'https://pack24.ru/upload/resize_cache/iblock/a3b/200_200_1/a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8.jpg', ru: 'Тубусы картонные',          uz: 'Karton tubuslar',          price: '59,05' },
    { slug: 'gofrokarton',                    image: 'https://pack24.ru/upload/resize_cache/iblock/b4c/200_200_1/b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9.jpg', ru: 'Гофрокартон',               uz: 'Gofrokarton',              price: '7,67' },
    { slug: 'zashitnyj-profil',               image: 'https://pack24.ru/upload/resize_cache/iblock/c5d/200_200_1/c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0.jpg', ru: 'Защитный профиль',          uz: 'Himoya profili',           price: '2,89' },
    { slug: 'vspenennyj-pe',                  image: 'https://pack24.ru/upload/resize_cache/iblock/d6e/200_200_1/d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1.jpg', ru: 'Вспененный полиэтилен (ПЭ)', uz: 'Ko\'pikli polietilen',    price: '458,00' },
    { slug: 'pakety-iz-vspenennogo-pe',       image: 'https://pack24.ru/upload/resize_cache/iblock/e7f/200_200_1/e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2.jpg', ru: 'Пакеты из вспененного ПЭ', uz: 'Ko\'pikli PE paketlar',    price: '4,31' },
    { slug: 'samokleyashiesya-karmany',       image: 'https://pack24.ru/upload/resize_cache/iblock/f8a/200_200_1/f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3.jpg', ru: 'Самоклеящиеся карманы',    uz: 'Yelimli cho\'ntaklar',     price: '2,61' },
    { slug: 'rashodniki-dlya-magazinov',      image: 'https://pack24.ru/upload/resize_cache/iblock/a9b/200_200_1/a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4.jpg', ru: 'Расходники для магазинов', uz: 'Do\'kon uchun sarflanuvchilar', price: '24,75' },
    { slug: 'vakuumnye-pakety',               image: 'https://pack24.ru/upload/resize_cache/iblock/b0c/200_200_1/b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5.jpg', ru: 'Вакуумные пакеты',          uz: 'Vakuum paketlar',          price: '2,25' },
    { slug: 'termousadochnaya-plenka',        image: 'https://pack24.ru/upload/resize_cache/iblock/c1d/200_200_1/c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6.jpg', ru: 'Термоусадочная пленка',    uz: 'Termo-qisqaruvchi plyonka', price: '30,70' },
    { slug: 'meshki-pp',                      image: 'https://pack24.ru/upload/resize_cache/iblock/d2e/200_200_1/d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7.jpg', ru: 'Мешки полипропиленовые',   uz: 'Polipropilen xaltalar',    price: '11,15' },
    { slug: 'lenta-pp',                       image: 'https://pack24.ru/upload/resize_cache/iblock/e3f/200_200_1/e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8.jpg', ru: 'Полипропиленовая лента',   uz: 'Polipropilen lenta',       price: '631,00' },
    { slug: 'termopakety',                    image: 'https://pack24.ru/upload/resize_cache/iblock/f4a/200_200_1/f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9.jpg', ru: 'Термопакеты, термосумки',  uz: 'Termo paketlar, termo sumkalar', price: '46,25' },
    { slug: 'shpagaty-shnury',                image: 'https://pack24.ru/upload/resize_cache/iblock/a5b/200_200_1/a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0.jpg', ru: 'Шпагаты и шнуры',          uz: 'Iplar va arqonlar',        price: '90,85' },
    { slug: 'plomby',                         image: 'https://pack24.ru/upload/resize_cache/iblock/b6c/200_200_1/b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1.jpg', ru: 'Пломбы',                   uz: 'Plombalar',                price: '1,85' },
    { slug: 'kanstovary',                     image: 'https://pack24.ru/upload/resize_cache/iblock/c7d/200_200_1/c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2.jpg', ru: 'Канцтовары',               uz: 'Kanselyariya mollari',     price: '12,15' },
    { slug: 'banki-pet',                      image: 'https://pack24.ru/upload/resize_cache/iblock/d8e/200_200_1/d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3.jpg', ru: 'Банки ПЭТ',                uz: 'PET bankalar',             price: '26,55' },
    { slug: 'pishchevaya-upakovka',           image: 'https://pack24.ru/upload/resize_cache/iblock/e9f/200_200_1/e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4.jpg', ru: 'Пищевая упаковка',         uz: 'Oziq-ovqat qadoqlash',     price: '30,70' },
    { slug: 'folgirovannye-vpf-pakety',       image: 'https://pack24.ru/upload/resize_cache/iblock/f0a/200_200_1/f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5.jpg', ru: 'Фольгированные воздушно-пузырчатые пакеты', uz: 'Folga havo pufakli paketlar', price: '14,05' },
];

/* ── Emoji fallback map ──────────────────────── */
const EMOJI_MAP: Record<string, string> = {
    'kartonnye-korobki': '📦', 'kartonnye-konverty': '✉️', 'kurierskie-pakety-belyye-standart': '🛍️',
    'kurierskie-i-sejf-pakety': '🔒', 'samosbornyye-korobki': '📫', 'kraft-konverty': '📩',
    'pakety-ziplock-sverkhprochnyye': '🤐', 'kurierskie-pakety-ekonom': '💼', 'pochtovye-korobki': '📮',
    'pakety-pochta-rossii': '📫', 'pakety-slajdery-50mkm': '📋', 'pakety-iz-vpf-s-kleevym': '🫧',
    'arkhivnyye-korobki': '🗃️', 'bopp-pakety': '🏷️', 'tsvetnyye-konverty': '🎨',
    'bumaga-tisyu': '🧻', 'pvd-rukav-chernyy': '⬛', 'pakety-mail-light': '✈️',
    'pakety-slajdery-70mkm': '📋', 'zip-lock-pakety': '🔐', 'kartonnye-korobki-dlya-podarkov': '🎁',
    'kurierskie-pakety-chernye': '🖤', 'pakety-chernye-s-vozdushnoy': '🛡️', 'prozrachnyye-pakety-doy-pak': '💧',
    'podlozhki-laminirovannye': '🪣', 'pakety-pvd-dlya-marketplejsov': '🏪', 'pakety-slajdery-s-begunkom': '↔️',
    'plenka-upakovochnaya': '🔄', 'kurierskie-pakety-prozrachnye': '🔍', 'zapajshiki-paketov': '⚡',
    'kraft-pakety': '🟫', 'doy-pack': '🫙', 'polietilennovye-pakety': '🛍️',
    'vozdushno-puzyrkovaya-plenka': '🫧', 'vozdushnaya-lenta': '🎀', 'pakety-s-vozdushnoj-podushkoj': '💨',
    'upakovochnaya-bumaga': '📰', 'bumazhnye-konverty': '📜', 'termoetiketki': '🏷️',
    'scotch-kleykaya-lenta': '📎', 'stretch-plenka': '🌀', 'napolniteli': '🌱',
    'tubusy-kartonnye': '🎯', 'gofrokarton': '📫', 'zashitnyj-profil': '🛡️',
    'vspenennyj-pe': '🧽', 'pakety-iz-vspenennogo-pe': '🫧', 'samokleyashiesya-karmany': '📌',
    'rashodniki-dlya-magazinov': '🏬', 'vakuumnye-pakety': '💨', 'termousadochnaya-plenka': '🌡️',
    'meshki-pp': '🎒', 'lenta-pp': '🎗️', 'termopakety': '🌡️', 'shpagaty-shnury': '🧵',
    'plomby': '🔏', 'kanstovary': '✏️', 'banki-pet': '🧴', 'pishchevaya-upakovka': '🍽️',
    'folgirovannye-vpf-pakety': '🫧',
};

export default function CategoryCatalogGrid() {
    const { language } = useLanguage();
    const fromText = language === 'uz' ? 'dan' : language === 'en' ? 'from' : 'от';
    const currency = language === 'uz' ? "so'm" : language === 'en' ? '₽' : '₽';

    return (
        <section className="bg-white border-t border-gray-100">
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">

                {/* Section header */}
                <div className="flex items-center justify-between mb-5">
                    <h2 className="text-lg font-extrabold text-gray-900">
                        {language === 'uz' ? 'Barcha mahsulot turlari' : language === 'en' ? 'All product categories' : 'Все категории товаров'}
                    </h2>
                    <Link
                        href="/catalog"
                        className="text-sm text-[#e33326] hover:text-red-700 font-medium transition-colors flex items-center gap-1"
                    >
                        {language === 'uz' ? 'Barchasi' : language === 'en' ? 'View all' : 'Все товары'}
                        <span className="text-base">›</span>
                    </Link>
                </div>

                {/* Grid — 5 ustun desktop, 3 tablet, 2 mobil */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 border-l border-t border-gray-200">
                    {CATEGORIES.map((cat) => (
                        <Link
                            key={cat.slug}
                            href={`/catalog?cat=${cat.slug}`}
                            className="group flex flex-col items-center text-center p-4 border-r border-b border-gray-200 hover:bg-[#fef7f6] transition-colors duration-150 relative"
                        >
                            {/* Rasm */}
                            <div className="w-full aspect-square max-w-[120px] relative mb-3 flex items-center justify-center">
                                <div className="relative w-full h-full">
                                    <Image
                                        src={cat.image}
                                        alt={cat.ru}
                                        fill
                                        className="object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-200"
                                        sizes="120px"
                                        onError={(e) => {
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            const parent = target.parentElement;
                                            if (parent) {
                                                parent.innerHTML = `<div class="w-full h-full flex items-center justify-center text-5xl">${EMOJI_MAP[cat.slug] || '📦'}</div>`;
                                            }
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Nom */}
                            <p className="text-[13px] font-medium text-gray-800 group-hover:text-[#e33326] transition-colors duration-150 leading-snug line-clamp-3 mb-2 flex-1">
                                {language === 'ru' ? cat.ru : language === 'uz' ? cat.uz : cat.ru}
                            </p>

                            {/* Narx */}
                            <p className="text-[13px] font-semibold text-[#e33326] mt-auto whitespace-nowrap">
                                {fromText} {cat.price} {currency}
                            </p>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
