'use client';

import Link from 'next/link';
import { Star, ChevronRight, ArrowRight, Quote } from 'lucide-react';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import type { Language } from '@/lib/translations';

type L = Record<Language, string>;

const REVIEWS = [
    {
        name: 'Aziz Toshmatov',
        role: { uz: 'Savdo kompaniyasi', ru: 'Торговая компания', en: 'Trading company', qr: 'Sawda kompaniyası', zh: '贸易公司', tr: 'Ticaret şirketi', tg: 'Ширкати тиҷоратӣ', kk: 'Сауда компаниясы', tk: 'Söwda kompaniýasy', fa: 'شرکت تجاری' } as L,
        text: {
            uz: "Pack24 dan 3 yildan beri xarid qilamiz. Sifat va tezkorlik ajoyib! Har safar kutilgan muddat oldidan yetkazib berishadi.",
            ru: "Покупаем у Pack24 уже 3 года. Качество и скорость — отличные! Всегда доставляют раньше срока.",
            en: "We've been buying from Pack24 for 3 years. Quality and speed are amazing! They always deliver ahead of schedule.",
            qr: "Pack24 den 3 jıldan beri satıp alamız. Sapa hám tezlik ajayıp! Hárbir waqıt mıynetden aldın jetkezip beredi.",
            zh: "我们从Pack24购买已经3年了。质量和速度都太棒了！每次都提前送达。",
            tr: "3 yıldır Pack24'ten alışveriş yapıyoruz. Kalite ve hız mükemmel! Her zaman beklenenden erken teslim ediyorlar.",
            tg: "Мо аз Pack24 3 сол боз харид мекунем. Сифат ва суръат аъло! Ҳамеша пеш аз мӯҳлат мерасонанд.",
            kk: "Pack24-тен 3 жылдан бері сатып аламыз. Сапа мен жылдамдық керемет! Әрдайым мерзімінен бұрын жеткізеді.",
            tk: "Pack24-den 3 ýyldan bäri satyn alýarys. Hil we tizlik ajaýyp! Her gezek möhletden öň eltip berýärler.",
            fa: "ما ۳ سال است از Pack24 خرید می‌کنیم. کیفیت و سرعت عالی است! همیشه زودتر از موعد تحویل می‌دهند.",
        } as L,
        rating: 5, avatar: 'A', color: 'bg-blue-500',
    },
    {
        name: 'Malika Yusupova',
        role: { uz: 'Restoran egasi', ru: 'Владелица ресторана', en: 'Restaurant owner', qr: 'Restoran iyesi', zh: '餐厅老板', tr: 'Restoran sahibi', tg: 'Соҳиби ресторан', kk: 'Мейрамхана иесі', tk: 'Restoran eýesi', fa: 'صاحب رستوران' } as L,
        text: {
            uz: "Oshxonamiz uchun qadoq materiallarini shu yerdan olamiz. Narxlar bozordan 20% arzon, sifat esa yuqori!",
            ru: "Берём упаковочные материалы для ресторана здесь. Цены на 20% ниже рынка, качество отличное!",
            en: "We get packaging materials for our restaurant here. Prices are 20% below market, and quality is excellent!",
            qr: "Ashanamız ushin qadawlaw materialların sol jerde alamız. Bahalar bazardan 20% arzan, sapa joqarı!",
            zh: "我们从这里为餐厅购买包装材料。价格比市场低20%，质量优秀！",
            tr: "Restoran için ambalaj malzemelerini buradan alıyoruz. Fiyatlar piyasadan %20 düşük, kalite mükemmel!",
            tg: "Мо барои тарабхона маводи бастабандӣ мегирем. Нархҳо аз бозор 20% арзон, сифат олӣ!",
            kk: "Мейрамхана үшін қаптама материалдарын осы жерден аламыз. Бағалар нарықтан 20% арзан, сапасы керемет!",
            tk: "Restoran üçin gaplama materiallaryny şu ýerden alýarys. Bahalar bazardan 20% arzan, hil ýokary!",
            fa: "ما مواد بسته‌بندی رستوران را از اینجا می‌گیریم. قیمت‌ها ۲۰٪ کمتر از بازار و کیفیت عالی است!",
        } as L,
        rating: 5, avatar: 'M', color: 'bg-emerald-500',
    },
    {
        name: 'Jasur Rahimov',
        role: { uz: "Online do'kon", ru: 'Интернет-магазин', en: 'Online store', qr: "Online duken", zh: '网店', tr: 'Online mağaza', tg: 'Мағозаи онлайн', kk: 'Онлайн дүкен', tk: 'Onlaýn dükan', fa: 'فروشگاه آنلاین' } as L,
        text: {
            uz: "Bulk import funksiyasi hayotimni osonlashtirdi. 500 ta mahsulotni bir vaqtda yuklab oldim. Juda qulay platforma!",
            ru: "Функция массового импорта облегчила жизнь. Загрузил 500 товаров за раз. Очень удобная платформа!",
            en: "The bulk import feature made my life easier. Uploaded 500 products at once. Very convenient platform!",
            qr: "Bulk import funksiyası ómirdi jéniletti. 500 ta mahsulottı bir waqıtta júktep aldım. Juda qolay platforma!",
            zh: "批量导入功能让我的生活更轻松。一次上传了500件产品。非常方便的平台！",
            tr: "Toplu içe aktarma özelliği hayatımı kolaylaştırdı. Bir seferde 500 ürün yükledim. Çok kullanışlı platform!",
            tg: "Функсияи воридоти оммавӣ ҳаётро осон кард. 500 маҳсулотро якбора бор кардам. Платформаи хеле қулай!",
            kk: "Жаппай импорт функциясы өмірімді жеңілдетті. Бір уақытта 500 тауар жүктедім. Өте ыңғайлы платформа!",
            tk: "Köpçülikleýin import funksiýasy durmuşymy aňsatlaşdyrdy. Bir gezekde 500 haryt ýükledim. Gaty amatly platforma!",
            fa: "قابلیت وارد کردن انبوه زندگی‌ام را آسان‌تر کرد. ۵۰۰ محصول را یک‌باره آپلود کردم. پلتفرم بسیار راحت!",
        } as L,
        rating: 5, avatar: 'J', color: 'bg-purple-500',
    },
];

const UI: Record<string, L> = {
    heading:  { uz: 'Mijozlar sharhlari', ru: 'Отзывы клиентов', en: 'Customer Reviews', qr: 'Mijozlar pikirlerı', zh: '客户评价', tr: 'Müşteri Yorumları', tg: 'Шарҳҳои мизоҷон', kk: 'Клиент пікірлері', tk: 'Müşderi teswirleri', fa: 'نظرات مشتریان' },
    sub:      { uz: 'Haqiqiy mijozlarning fikrlari', ru: 'Мнения реальных покупателей', en: 'Real buyer opinions', qr: "Haqıyqıy mijozlardıń pikirlerı", zh: '真实买家意见', tr: 'Gerçek alıcı görüşleri', tg: 'Назари мизоҷони воқеӣ', kk: 'Нақты сатып алушылар пікірлері', tk: 'Hakyky alyjylaryň pikirleri', fa: 'نظرات خریداران واقعی' },
    viewAll:  { uz: 'Barcha sharhlar', ru: 'Все отзывы', en: 'All reviews', qr: 'Barlıq sharhlar', zh: '所有评价', tr: 'Tüm yorumlar', tg: 'Ҳама шарҳҳо', kk: 'Барлық пікірлер', tk: 'Ähli teswirler', fa: 'همه نظرات' },
    viewAllBtn: { uz: "Barcha sharhlarni ko'rish", ru: 'Смотреть все отзывы', en: 'View all reviews', qr: "Barlıq sharhlardı kóriw", zh: '查看所有评价', tr: 'Tüm yorumları gör', tg: 'Дидани ҳама шарҳҳо', kk: 'Барлық пікірлерді көру', tk: 'Ähli teswirleri gör', fa: 'مشاهده همه نظرات' },
};

export default function ReviewsSection() {
    const { language } = useLanguage();

    return (
        <section className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-extrabold text-gray-900">
                        {UI.heading[language] ?? UI.heading.uz}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {UI.sub[language] ?? UI.sub.uz}
                    </p>
                </div>
                <Link
                    href="/reviews"
                    className="hidden sm:flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
                >
                    {UI.viewAll[language] ?? UI.viewAll.uz} <ChevronRight size={16} />
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {REVIEWS.map((review, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow duration-300 flex flex-col">
                        <div className="flex gap-0.5 mb-4">
                            {[1, 2, 3, 4, 5].map((s) => (
                                <Star
                                    key={s}
                                    size={16}
                                    className={s <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'}
                                />
                            ))}
                        </div>
                        <div className="relative flex-1">
                            <Quote size={32} className="text-blue-100 absolute -top-1 -left-1 pointer-events-none" />
                            <p className="text-sm text-gray-700 leading-relaxed relative z-10">
                                {review.text[language] ?? review.text.uz}
                            </p>
                        </div>
                        <div className="flex items-center gap-3 mt-5 pt-4 border-t border-gray-50">
                            <div className={`w-10 h-10 rounded-full ${review.color} flex items-center justify-center text-white font-bold text-sm shrink-0`}>
                                {review.avatar}
                            </div>
                            <div>
                                <p className="font-bold text-gray-900 text-sm">{review.name}</p>
                                <p className="text-xs text-gray-400">{review.role[language] ?? review.role.uz}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 text-center">
                <Link
                    href="/reviews"
                    className="inline-flex items-center gap-2 bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white font-bold px-8 py-3 rounded-xl text-sm transition-all duration-200"
                >
                    {UI.viewAllBtn[language] ?? UI.viewAllBtn.uz} <ArrowRight size={15} />
                </Link>
            </div>
        </section>
    );
}
