
import { Language } from './translations';

export interface Category {
    id: string;
    slug: string;
    name: Partial<Record<Language, string>>;
    icon?: string; // We can add icons later
}

// User provided list, converted to structured data
// Note: Using Russian-Latin transliteration as requested for slugs, 
// providing proper labels for Uz/Ru/En where possible (auto-filling basics)
export const CATEGORIES: Category[] = [
    { id: '1', slug: 'kartonnye-korobki', name: { uz: 'Karton Qutilar', ru: 'Картонные коробки', en: 'Cardboard Boxes', qr: 'Karton Qutilar', zh: '纸箱', tr: 'Karton Kutular' } },
    { id: '2', slug: 'kurierskie-pakety', name: { uz: 'Kuryer Paketlari', ru: 'Курьерские пакеты', en: 'Courier Bags', qr: 'Kuryer Paketleri', zh: '快递袋', tr: 'Kurye Çantaları' } },
    { id: '3', slug: 'pakety-pochta-rossii', name: { uz: 'Rossiya Pochta Paketlari', ru: 'Пакеты Почта России', en: 'Russian Post Bags', qr: 'Rossiya Pochta Paketleri', zh: '俄罗斯邮政袋', tr: 'Rusya Posta Çantaları' } },
    { id: '4', slug: 'bopp-pakety', name: { uz: 'BOPP Paketlar', ru: 'БОПП пакеты', en: 'BOPP Bags', qr: 'BOPP Paketler', zh: 'BOPP袋', tr: 'BOPP Çantalar' } },
    { id: '5', slug: 'zip-lock-pakety', name: { uz: 'Zip-Lock Paketlar', ru: 'Пакеты ZIP-LOCK', en: 'Zip-Lock Bags', qr: 'Zip-Lock Paketler', zh: '自封袋', tr: 'Kilitli Torbalar' } },
    { id: '6', slug: 'pakety-pvd', name: { uz: 'PVD Paketlar (Marketpleys)', ru: 'Пакеты ПВД для маркетплейсов', en: 'LDPE Bags', qr: 'PVD Paketler', zh: '低密度聚乙烯袋', tr: 'LDPE Çantalar' } },
    { id: '7', slug: 'pakety-slajdery', name: { uz: 'Slayder Paketlar', ru: 'Пакеты слайдеры', en: 'Slider Bags', qr: 'Slayder Paketler', zh: '滑块袋', tr: 'Sürgülü Çantalar' } },
    { id: '8', slug: 'plenka-upakovochnaya', name: { uz: 'Qadoqlash Plyonkasi', ru: 'Пленка упаковочная', en: 'Packaging Film', qr: 'Qadaqlaw Plyonkası', zh: '包装膜', tr: 'Ambalaj Filmi' } },
    { id: '9', slug: 'zapajshiki', name: { uz: 'Paket Payvandlagichlar', ru: 'Запайщики пакетов', en: 'Bag Sealers', qr: 'Paket Jalǵaǵıshlar', zh: '封口机', tr: 'Torba Kapatıcılar' } },
    { id: '10', slug: 'kraft-pakety', name: { uz: 'Kraft Paketlar', ru: 'Крафт пакеты', en: 'Kraft Bags', qr: 'Kraft Paketler', zh: '牛皮纸袋', tr: 'Kraft Çantalar' } },
    { id: '11', slug: 'doy-pack', name: { uz: 'Doy-Pak (Doy Pack)', ru: 'Пакеты Дой-Пак', en: 'Doy Bags', qr: 'Doy-Pak', zh: '自立袋', tr: 'Doypack' } },
    { id: '12', slug: 'polietilenovye-pakety', name: { uz: 'Polietilen Paketlar', ru: 'Полиэтиленовые пакеты', en: 'Polyethylene Bags', qr: 'Polietilen Paketler', zh: '聚乙烯袋', tr: 'Polietilen Çantalar' } },
    { id: '13', slug: 'vozdushno-puzyrkovaya-plenka', name: { uz: 'Pufakchali Plyonka', ru: 'Воздушно-пузырьковая плёнка', en: 'Bubble Wrap', qr: 'Pufakchalı Plyonka', zh: '气泡膜', tr: 'Balonlu Naylon' } },
    { id: '14', slug: 'vozdushnaya-lenta', name: { uz: 'Havo Yostig\'i Lentasi', ru: 'Воздушная упаковочная лента', en: 'Air Cushion Film', qr: 'Hawa Jastıǵı Lentası', zh: '气垫膜', tr: 'Hava Yastığı Filmi' } },
    { id: '15', slug: 'pakety-s-vozdushnoj-podushkoj', name: { uz: 'Havo Yostiqli Paketlar', ru: 'Пакеты с воздушной подушкой', en: 'Air Cushion Bags', qr: 'Hawa Jastıqlı Paketler', zh: '气柱袋', tr: 'Hava Yastıklı Çantalar' } },
    { id: '16', slug: 'upakovochnaya-bumaga', name: { uz: 'Qadoqlash Qog\'ozi', ru: 'Упаковочная бумага', en: 'Wrapping Paper', qr: 'Qadaqlaw Qaǵazı', zh: '包装纸', tr: 'Ambalaj Kağıdı' } },
    { id: '17', slug: 'bumazhnye-konverty', name: { uz: 'Qog\'oz Konvertlar', ru: 'Бумажные конверты', en: 'Paper Envelopes', qr: 'Qaǵaz Konvertler', zh: '信封', tr: 'Kağıt Zarflar' } },
    { id: '18', slug: 'termoetiketki', name: { uz: 'Termoetiketkalar', ru: 'Самоклеящиеся термоэтикетки', en: 'Thermal Labels', qr: 'Termoetiketkalar', zh: '热敏标签', tr: 'Termal Etiketler' } },
    { id: '19', slug: 'scotch-kleykaya-lenta', name: { uz: 'Skotch va Yelim Lenta', ru: 'Скотч и клейкая лента', en: 'Adhesive Tape', qr: 'Skotch hám Jelil Lenta', zh: '胶带', tr: 'Yapışkan Bant' } },
    { id: '20', slug: 'stretch-plenka', name: { uz: 'Streich-Plyonka', ru: 'Стрейч-плёнка', en: 'Stretch Film', qr: 'Stretch-Plyonka', zh: '拉伸膜', tr: 'Streç Film' } },
    { id: '21', slug: 'napolniteli', name: { uz: 'To\'ldiruvchilar', ru: 'Наполнители', en: 'Fillers', qr: 'Toldırıwshılar', zh: '填充物', tr: 'Dolgu Malzemeleri' } },
    { id: '22', slug: 'tubusy-kartonnye', name: { uz: 'Karton Tubuslar', ru: 'Тубусы картонные', en: 'Cardboard Tubes', qr: 'Karton Tubuslar', zh: '纸筒', tr: 'Karton Tüpler' } },
    { id: '23', slug: 'gofrokarton', name: { uz: 'Gofrokarton', ru: 'Гофрокартон', en: 'Corrugated Cardboard', qr: 'Gofrokarton', zh: '瓦楞纸板', tr: 'Oluklu Mukavva' } },
    { id: '24', slug: 'zashitnyj-profil', name: { uz: 'Himoya Profili', ru: 'Защитный профиль', en: 'Protective Profile', qr: 'Qorǵaw Profili', zh: '保护型材', tr: 'Koruyucu Profil' } },
    { id: '25', slug: 'plastikovye-korobki', name: { uz: 'Plastik Qutilar', ru: 'Пластиковые коробки', en: 'Plastic Boxes', qr: 'Plastik Qutilar', zh: '塑料盒', tr: 'Plastik Kutular' } },
    { id: '26', slug: 'vspenennyj-pe', name: { uz: 'Ko\'pikli Polietilen', ru: 'Вспененный полиэтилен', en: 'PE Foam', qr: 'Kópikli Polietilen', zh: 'PE泡沫', tr: 'PE Köpük' } },
    { id: '27', slug: 'pakety-iz-vspenennogo-pe', name: { uz: 'Ko\'pikli PE Paketlar', ru: 'Пакеты из вспененного ПЭ', en: 'PE Foam Bags', qr: 'Kópikli PE Paketler', zh: 'PE泡沫袋', tr: 'PE Köpük Torbalar' } },
    { id: '28', slug: 'samokleyashiesya-karmany', name: { uz: 'Yelimli Cho\'ntaklar', ru: 'Самоклеящиеся карманы', en: 'Adhesive Pockets', qr: 'Jelilli Qaltalar', zh: '自粘袋', tr: 'Yapışkanlı Cepler' } },
    { id: '29', slug: 'rashodniki-dlya-magazinov', name: { uz: 'Do\'konlar uchun mollar', ru: 'Расходники для магазинов', en: 'Retail Supplies', qr: 'Dukanlar ushın zatlar', zh: '零售用品', tr: 'Mağaza Malzemeleri' } },
    { id: '30', slug: 'vakuumnye-pakety', name: { uz: 'Vakuum Paketlar', ru: 'Вакуумные пакеты', en: 'Vacuum Bags', qr: 'Vakuum Paketler', zh: '真空袋', tr: 'Vakum Poşetleri' } },
    { id: '31', slug: 'termousadochnaya-plenka', name: { uz: 'Termo-qisqaruvchi Plyonka', ru: 'Термоусадочная пленка', en: 'Shrink Film', qr: 'Termo-qısqarıwshı Plyonka', zh: '收缩膜', tr: 'Shrink Film' } },
    { id: '32', slug: 'meshki-pp', name: { uz: 'PP Qoplar', ru: 'Мешки полипропиленовые', en: 'PP Bags (Woven)', qr: 'PP Qaplar', zh: 'PP编织袋', tr: 'PP Çuval' } },
    { id: '33', slug: 'lenta-pp', name: { uz: 'PP Lenta (Tasma)', ru: 'Полипропиленовая лента', en: 'PP Strap', qr: 'PP Lenta', zh: 'PP打包带', tr: 'PP Şerit' } },
    { id: '34', slug: 'termopakety', name: { uz: 'Termo Paketlar (Sumka)', ru: 'Термопакеты, термосумки', en: 'Thermal Bags', qr: 'Termo Paketler', zh: '保温袋', tr: 'Termal Çantalar' } },
    { id: '35', slug: 'shpagaty-shnury', name: { uz: 'Iplar va Arqonlar', ru: 'Шпагаты и шнуры', en: 'Twines and Cords', qr: 'Jıpler hám Arqanlar', zh: '绳索', tr: 'İpler ve Kordonlar' } },
    { id: '36', slug: 'plomby', name: { uz: 'Plombalar', ru: 'Пломбы', en: 'Security Seals', qr: 'Plombalar', zh: '安全封条', tr: 'Güvenlik Mühürleri' } },
    { id: '37', slug: 'kanstovary', name: { uz: 'Kanselyariya', ru: 'Канцтовары', en: 'Stationery', qr: 'Kanselyariya', zh: '文具', tr: 'Kırtasiye' } },
    { id: '38', slug: 'banki-pet', name: { uz: 'PET Bankalar', ru: 'Банки ПЭТ', en: 'PET Jars', qr: 'PET Bankalar', zh: 'PET罐', tr: 'PET Kavanozlar' } },
    { id: '39', slug: 'sredstva-zashity', name: { uz: 'Himoya Vositalari', ru: 'Одноразовые средства защиты', en: 'Disposable Protection', qr: 'Qorǵaw Quralları', zh: '一次性防护用品', tr: 'Tek Kullanımlık Koruma' } },
    { id: '40', slug: 'pallety', name: { uz: 'Palletlar', ru: 'Паллеты / Поддоны', en: 'Pallets', qr: 'Palletlar', zh: '托盘', tr: 'Paletler' } }
];
