// ─── Mahsulot atamalari va UI tarjimalari ────────────────────────────────────
import type { Language } from '../translations';

// UI so'zlari tarjimasi
export const PRODUCT_UI: Record<string, Record<Language, string>> = {
    price:       { uz: 'Narx',          ru: 'Цена',         en: 'Price',    qr: 'Bahası',    zh: '价格',  tr: 'Fiyat',      tg: 'Нарх',         kk: 'Баға',         tk: 'Baha',        fa: 'قیمت' },
    addToCart:   { uz: "Qo'sh",         ru: 'В корзину',    en: 'Add',      qr: 'Qos',       zh: '加入',  tr: 'Ekle',       tg: 'Илова',        kk: 'Қосу',         tk: 'Goş',         fa: 'افزودن' },
    inStock:     { uz: "Bor",           ru: 'В наличии',    en: 'In stock', qr: 'Bar',       zh: '现货',  tr: 'Mevcut',     tg: 'Мавҷуд',       kk: 'Бар',          tk: 'Bar',         fa: 'موجود' },
    outOfStock:  { uz: "Mavjud emas",   ru: 'Нет в наличии', en: 'Out of stock', qr: 'Joq', zh: '缺货',  tr: 'Mevcut değil', tg: 'Мавҷуд нест', kk: 'Жоқ',         tk: 'Ýok',         fa: 'ناموجود' },
    hit:         { uz: 'Hit',           ru: 'Хит',          en: 'Hit',      qr: 'Hit',       zh: '热销',  tr: 'Hit',        tg: 'Хит',          kk: 'Хит',          tk: 'Hit',         fa: 'پرفروش' },
    order:       { uz: 'Buyurtma',      ru: 'Заказать',     en: 'Order',    qr: 'Buyırtpa',  zh: '订购',  tr: 'Sipariş',    tg: 'Фармоиш',      kk: 'Тапсырыс',     tk: 'Sargyt',      fa: 'سفارش' },
    pcs:         { uz: 'dona',          ru: 'шт.',          en: 'pcs',      qr: 'dana',      zh: '件',    tr: 'adet',       tg: 'дона',         kk: 'дана',         tk: 'sany',        fa: 'عدد' },
    currency:    { uz: "so'm",          ru: 'сум',          en: 'UZS',      qr: "so'm",      zh: '苏姆',  tr: 'sum',        tg: 'сӯм',          kk: 'сум',          tk: 'sum',         fa: 'سوم' },
    viewAll:     { uz: "Barchasini ko'rish", ru: 'Смотреть все', en: 'View all', qr: "Bárin kóriw", zh: '查看全部', tr: 'Tümünü gör', tg: 'Ҳамаашро дидан', kk: 'Барлығын көру', tk: 'Hemmesini gör', fa: 'مشاهده همه' },
    popular:     { uz: 'Mashhur Mahsulotlar', ru: 'Популярные товары', en: 'Popular Products', qr: 'Mashqur mahsulotlar', zh: '热门产品', tr: 'Popüler Ürünler', tg: 'Маҳсулоти машҳур', kk: 'Танымал тауарлар', tk: 'Meşhur harytlar', fa: 'محصولات محبوب' },
    popularSub:  { uz: "Eng ko'p sotilayotgan qadoqlash materiallari", ru: 'Самые продаваемые упаковочные материалы', en: 'Best-selling packaging materials', qr: 'Eń kóp satılatın qadowlaw materiallari', zh: '最畅销的包装材料', tr: 'En çok satan ambalaj malzemeleri', tg: 'Маводҳои бастабандии пурфурӯш', kk: 'Ең көп сатылатын қаптама материалдар', tk: 'Iň köp satylýan gaplama serişdeleri', fa: 'پرفروش‌ترین مواد بسته‌بندی' },
    notFound:    { uz: 'Mahsulotlar topilmadi', ru: 'Товары не найдены', en: 'No products found', qr: 'Mahsulotlar tabılmadı', zh: '未找到产品', tr: 'Ürün bulunamadı', tg: 'Маҳсулот ёфт нашуд', kk: 'Тауар табылмады', tk: 'Haryt tapylmady', fa: 'محصولی یافت نشد' },
    addedToCart: { uz: "Savatga qo'shildi! 🎉", ru: 'Добавлено в корзину! 🎉', en: 'Added to cart! 🎉', qr: 'Sebetke qosıldı! 🎉', zh: '已加入购物车! 🎉', tr: 'Sepete eklendi! 🎉', tg: 'Ба сабад илова шуд! 🎉', kk: 'Себетке қосылды! 🎉', tk: 'Sebede goşuldy! 🎉', fa: 'به سبد اضافه شد! 🎉' },
    details:     { uz: "Batafsil",      ru: 'Подробнее',    en: 'Details',  qr: 'Batafsıl', zh: '详情',   tr: 'Detaylar',   tg: 'Тафсилот',     kk: 'Толығырақ',    tk: 'Jikme-jik',   fa: 'جزئیات' },
    spec:        { uz: 'Xarakteristikalar', ru: 'Характеристики', en: 'Specifications', qr: 'Xarakteristikalar', zh: '规格', tr: 'Özellikler', tg: 'Хусусиятҳо', kk: 'Сипаттамалар', tk: 'Häsiýetlikler', fa: 'مشخصات' },
};

// ── Atama tarjima lug'ati (translateProductName uchun) ────────────────────────
export const TERM_MAP: Record<string, Partial<Record<Language, string>>> = {
    "quti":      { ru: "коробка",  en: "box",    qr: "qutı",    zh: "箱",  tr: "kutu",    tg: "қуттӣ",    kk: "қорап",   tk: "guty",    fa: "جعبه" },
    "karton":    { ru: "картон",   en: "cardboard", qr: "karton", zh: "纸板", tr: "karton",  tg: "картон",   kk: "картон",  tk: "karton",  fa: "مقوا" },
    "gofro":     { ru: "гофро",    en: "corrugated", qr: "gofro", zh: "瓦楞", tr: "oluklu",  tg: "гофро",    kk: "гофро",   tk: "gofro",   fa: "موج‌دار" },
    "paket":     { ru: "пакет",    en: "bag",    qr: "paket",   zh: "袋",  tr: "poşet",   tg: "халта",    kk: "пакет",   tk: "paket",   fa: "کیسه" },
    "plyonka":   { ru: "плёнка",   en: "film",   qr: "plyonka", zh: "膜",  tr: "film",    tg: "лента",    kk: "пленка",  tk: "plýonka", fa: "فیلم" },
    "lenta":     { ru: "лента",    en: "tape",   qr: "lenta",   zh: "带",  tr: "bant",    tg: "навор",    kk: "лента",   tk: "lenta",   fa: "نوار" },
};
