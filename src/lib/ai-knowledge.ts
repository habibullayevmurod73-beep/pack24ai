import { Language } from './translations';

export type Intent = 'price' | 'delivery' | 'contact' | 'material' | 'model_info' | 'greeting' | 'moq' | 'validation' | 'design_ai' | 'export_decree' | 'standards' | 'product_catalog' | 'printing' | 'payment' | 'materials_detail' | 'dimensions' | 'affirmative' | 'negative' | 'unknown';

export interface KnowledgeArticle {
    id: Intent;
    keywords: Partial<Record<Language, string[]>>;
    responses: Partial<Record<Language, string>>;
}

export const KNOWLEDGE_BASE: KnowledgeArticle[] = [
    {
        id: 'price',
        keywords: {
            uz: ['narx', 'qancha', 'summa', 'pul', 'necha pul', 'hisob'],
            ru: ['цена', 'сколько', 'стоимость', 'деньги', 'почем', 'расчет'],
            en: ['price', 'cost', 'how much', 'money', 'calculate'],
            qr: ['baha', 'qansha', 'pul'],
            zh: ['价格', '多少钱', '成本'],
            tr: ['fiyat', 'kac para', 'ucret']
        },
        responses: {
            uz: "Siz tanlagan konfiguratsiya bo'yicha taxminiy jami narx: {{totalPrice}}. Bir dona uchun: {{unitPrice}}. Aniq hisob-kitob uchun buyurtma tugmasini bosishingiz mumkin.",
            ru: "Примерная общая стоимость: {{totalPrice}}. За штуку: {{unitPrice}}. Для точного расчета нажмите кнопку заказа.",
            en: "Estimated total price: {{totalPrice}}. Per unit: {{unitPrice}}.",
            qr: "Jami baha: {{totalPrice}}. Bir dana ushın: {{unitPrice}}.",
            zh: "预计总价: {{totalPrice}}. 单价: {{unitPrice}}.",
            tr: "Tahmini toplam fiyat: {{totalPrice}}. Birim fiyatı: {{unitPrice}}."
        }
    },
    {
        id: 'moq',
        keywords: {
            uz: ['kam', 'oz', 'minimum', 'moq', 'dona', 'zakaz', 'partiya'],
            ru: ['мало', 'минимум', 'минимальный', 'партия', 'тираж', 'moq'],
            en: ['moq', 'minimum', 'small batch', 'order quantity'],
            qr: ['az', 'minimum'],
            zh: ['最小', '批量'],
            tr: ['minimum', 'adet']
        },
        responses: {
            uz: "Bizda 'Minimal Buyurtma' (MOQ) yo'q! Boshqalar 2000+ talab qilganda, siz bizdan biznesingiz uchun kerakli bo'lgan 72 dona yoki undan kam qutini ham buyurtma qilishingiz mumkin. Bu sizga katta xarajatlarsiz bozorni sinab ko'rish imkonini beradi.",
            ru: "У нас нет минимального заказа (Zero MOQ)! В отличие от других заводов (2000+ шт), мы предлагаем партии от 72 шт. Это позволяет вам провести валидацию рынка без рисков.",
            en: "We offer Zero MOQ! Unlike traditional manufacturers requiring 2000+ units, you can order tailored small batches (e.g., 72 units). Perfect for market validation and SMEs.",
            qr: "Bizde minimal buyırtpa sheklewi joq. 72 dana bolsada tayarlap beremiz.",
            zh: "我们需要零最小起订量！您可以订购小批量（例如72件）。",
            tr: "Minimum sipariş miktarımız yoktur! 72 adet gibi küçük partilerle sipariş verebilirsiniz."
        }
    },
    {
        id: 'validation',
        keywords: {
            uz: ['startup', 'startap', 'sinov', 'yangilik', 'test', 'xavf', 'risk'],
            ru: ['стартап', 'тест', 'проверка', 'риск', 'валидация'],
            en: ['startup', 'validation', 'test', 'risk'],
            qr: ['startap', 'test'],
            zh: ['启动', '测试'],
            tr: ['girisim', 'test']
        },
        responses: {
            uz: "Pack24 AI startaplar uchun ideal yechim. 'Market Validation' (Bozorni tekshirish) uchun 1 dona namunani o'z logotipingiz bilan raqamli formatda bepul oling va kichik partiya bilan savdoni boshlang.",
            ru: "Pack24 AI идеально подходит для стартапов. Проведите 'Market Validation' без риска: получите цифровой прототип с вашим логотипом и начните с малой партии.",
            en: "Perfect for Market Validation. Mitigate risk by ordering small batches. We help you test your product fit before heavy investment.",
            qr: "Startaplar ushın qolaylı. Bozardı tekseriw ushın kishi partiya menen baslań.",
            zh: "非常适合市场验证。通过小批量订购降低风险。",
            tr: "Pazar doğrulaması için mükemmel. Küçük partilerle risk almadan başlayın."
        }
    },
    {
        id: 'design_ai',
        keywords: {
            uz: ['dizayn', 'dizayner', 'logo', 'chizma', '3d', 'konstruktor'],
            ru: ['дизайн', 'дизайнер', 'лого', 'чертеж', '3d', 'конструктор'],
            en: ['design', 'designer', 'logo', 'drawing', '3d'],
            qr: ['dizayn', 'suwret'],
            zh: ['设计', '商标'],
            tr: ['tasarim', 'logo']
        },
        responses: {
            uz: "Qimmat dizaynerlar shart emas! Pack24 AI va Packdora texnologiyasi yordamida o'z qutingiz chizmasi (dieline) va 3D modelini soniyalar ichida yarating. Oyiga atigi ~$20 evaziga professional AI-dizayn xizmatidan foydalanishingiz mumkin.",
            ru: "Забудьте о дорогих дизайнерах! С технологией Packdora AI вы получите чертеж и 3D модель за секунды. Рекомендуем нашу AI-подписку (~$20/мес) для профессионального дизайна.",
            en: "No need for expensive designers. Our integration with Packdora AI generates dielines and 3D models instantly. Ask about our AI-design subscription (~$20/mo).",
            qr: "Dizaynerge pul shashpań. AI arqalı o'z qutińizdi jaratıń.",
            zh: "无需昂贵的设计师。我们的AI即时生成图纸和3D模型。",
            tr: "Pahalı tasarımcılara gerek yok. AI teknolojimizle saniyeler içinde tasarım yapın."
        }
    },
    {
        id: 'export_decree',
        keywords: {
            uz: ['eksport', 'export', 'chet el', 'rossiya', 'yevropa', 'pq', 'qaror', 'subsidiya'],
            ru: ['экспорт', 'за рубеж', 'россия', 'европа', 'пк', 'постановление', 'субсидия'],
            en: ['export', 'abroad', 'decree', 'subsidy', 'government'],
            qr: ['eksport', 'qarar'],
            zh: ['出口', '补贴'],
            tr: ['ihracat', 'tesvik']
        },
        responses: {
            uz: "O'zbekiston meva-sabzavot eksportchilari diqqatiga! PQ-136 qaroriga asosan 2028-yilgacha eksport uchun qadoqlash xarajatlarini qoplash bo'yicha imtiyozlardan foydalaning. Bizning qutilar xalqaro talablarga javob beradi.",
            ru: "Для экспортеров Узбекистана! Согласно ПК-136, действуют субсидии и льготы для экспортеров плодоовощной продукции до 2028 года. Наши упаковки соответствуют международным стандартам.",
            en: "Attention Exporters! Under Decree PQ-136, Uzbekistan supports fruit & veg exporters until 2028. We provide compliant packaging that helps you qualify for government incentives.",
            qr: "Eksportshılar ushın PQ-136 qararı boyınsha jeńillikler bar.",
            zh: "出口商请注意！根据PQ-136法令，乌兹别克斯坦支持果蔬出口商。",
            tr: "İhracatçılar için PQ-136 kararnamesi kapsamında teşvikler mevcuttur."
        }
    },
    {
        id: 'standards',
        keywords: {
            uz: ['standart', 'gap', 'global', 'gigiena', 'ekologiya', 'eco', 'qr'],
            ru: ['стандарт', 'гап', 'глобал', 'гигиена', 'экология', 'эко', 'qr'],
            en: ['standard', 'gap', 'hygiene', 'eco', 'sustainable', 'qr'],
            qr: ['standart', 'taza'],
            zh: ['标准', '卫生'],
            tr: ['standart', 'hijyen']
        },
        responses: {
            uz: "Yevropa va Yaqin Sharq bozorlari uchun GLOBAL G.A.P standartlari: Gigienik toza qadoq va QR-kod orqali mahsulot kuzatuvi (traceability). Biz plastik o'rniga ekologik toza kartonni tavsiya qilamiz.",
            ru: "Соответствие GLOBAL G.A.P для рынков Европы и Ближнего Востока: Гигиеничная упаковка и прослеживаемость через QR-коды. Экологичный картон — глобальная альтернатива пластику.",
            en: "We focus on GLOBAL G.A.P compliance for EU/Middle East markets: Hygienic packaging, traceability via QR codes, and sustainable eco-friendly materials replacing plastic.",
            qr: "Xalıqaralıq standartlarǵa juwap beremiz. Ekologiyalıq taza ónim.",
            zh: "符合全球G.A.P标准，适合出口市场。环保材料替代塑料。",
            tr: "AB ve Orta Doğu pazarları için GLOBAL G.A.P uyumluluğu sağlıyoruz."
        }
    },
    {
        id: 'product_catalog',
        keywords: {
            uz: ['katalog', 'tayyor', 'mahsulot', 'tur', 'assortiment'],
            ru: ['каталог', 'готовые', 'продукт', 'вид', 'ассортимент'],
            en: ['catalog', 'ready', 'product', 'range'],
            qr: ['katalog', 'tayın'],
            zh: ['目录', '现成'],
            tr: ['katalog', 'urun']
        },
        responses: {
            uz: "Bizning katalogimizda 200 ga yaqin tayyor mahsulotlar (pochta qutilari, pitsa qutilari, suyuqlik idishlari) mavjud. Pack24.ru bazasi asosidaeng keng assortimentni taklif etamiz.",
            ru: "В каталоге около 200 готовых решений (почтовые, пицца-коробки, контейнеры). Мы используем базу Pack24.ru для обеспечения широчайшего ассортимента.",
            en: "We manage a vast catalog of nearly 200 ready-to-use products, leveraging the massive inventory model of Pack24.ru.",
            qr: "Bizde 200 den aslam tayın qutı túrleri bar.",
            zh: "我们就拥有近200种现成产品目录。",
            tr: "200'e yakın hazır ürün çeşidimiz mevcuttur."
        }
    },
    {
        id: 'delivery',
        keywords: {
            uz: ['yetkazib', 'dostavka', 'olib borish', 'yuk', 'transport'],
            ru: ['доставка', 'привезти', 'транспорт', 'логистика', 'отправка'],
            en: ['delivery', 'shipping', 'transport', 'logistics'],
            qr: ['jetkiziw', 'dostavka'],
            zh: ['运输', '送货'],
            tr: ['nakliye', 'teslimat']
        },
        responses: {
            uz: "Toshkent shahri ichida yetkazib berish bepul (katta hajmdagi buyurtmalar uchun). Viloyat va eksport uchun logistika xizmatlarimiz mavjud.",
            ru: "Доставка по Ташкенту бесплатная (для оптовых заказов). Организуем логистику в области и на экспорт.",
            en: "Free delivery in Tashkent for bulk orders. We also handle regional and export logistics.",
            qr: "Tashkent qalası ishine jetkiziw biypul. Wálayatlarǵa kelisim tiykarında.",
            zh: "塔什干市内批量订单免费送货。提供区域物流。",
            tr: "Taşkent içi toplu siparişlerde teslimat ücretsizdir."
        }
    },
    {
        id: 'contact',
        keywords: {
            uz: ['bog\'lanish', 'telefon', 'raqam', 'manzil', 'aloqa', 'ofis'],
            ru: ['контакт', 'телефон', 'номер', 'адрес', 'связь', 'офис'],
            en: ['contact', 'phone', 'number', 'address', 'call', 'office'],
            qr: ['baylanıs', 'telefon', 'nomer'],
            zh: ['联系', '电话', '地址'],
            tr: ['iletisim', 'telefon', 'adres']
        },
        responses: {
            uz: "Manzil: Toshkent sh., Chilonzor tumani. Tel: +998 90 123-45-67. Telegram: @pack24uz. Onlayn maslahatchi 24/7 aloqada.",
            ru: "Адрес: г. Ташкент, Чиланзар. Тел: +998 90 123-45-67. Telegram: @pack24uz. Консультант 24/7.",
            en: "Address: Tashkent, Chilanzar. Phone: +998 90 123-45-67. Telegram: @pack24uz. 24/7 Support.",
            qr: "Mánzil: Tashkent q., Chilanzar. Tel: +998 90 123-45-67.",
            zh: "地址：塔什干，奇兰扎尔区。电话：+998 90 123-45-67。",
            tr: "Adres: Taşkent, Chilanzar. Tel: +998 90 123-45-67."
        }
    },
    {
        id: 'material',
        keywords: {
            uz: ['material', 'qog\'oz', 'karton', 'qalinlik', 'gofra'],
            ru: ['материал', 'бумага', 'картон', 'толщина', 'гофра'],
            en: ['material', 'paper', 'cardboard', 'thickness', 'corrugated'],
            qr: ['material', 'qaǵaz', 'karton'],
            zh: ['材料', '纸板', '厚度'],
            tr: ['malzeme', 'karton', 'kagit']
        },
        responses: {
            uz: "3 qavatli (E/B flute) va 5 qavatli (mustahkam) gofrokartonlarimiz mavjud. Ekologik toza va qayta ishlanadigan materiallar.",
            ru: "Используем 3-слойный (E/B flute) и 5-слойный гофрокартон. Экологичные, перерабатываемые материалы.",
            en: "We use sustainable 3-ply and 5-ply corrugated cardboard. Eco-friendly alternative to plastic.",
            qr: "3 hám 5 qabatlı ekologiyalıq taza karton.",
            zh: "我们使用3层和5层环保瓦楞纸板。",
            tr: "3 ve 5 katlı çevre dostu oluklu mukavva."
        }
    },
    {
        id: 'printing',
        keywords: {
            uz: ['pechat', 'bosma', 'logo', 'rangli', 'print', 'yozuv'],
            ru: ['печать', 'логотип', 'цвет', 'принт', 'надпись', 'нанесение'],
            en: ['printing', 'logo', 'color', 'print', 'brand'],
            qr: ['pechat', 'logo'],
            zh: ['印刷', '商标'],
            tr: ['baski', 'logo']
        },
        responses: {
            uz: "Bizda 3 xil bosma usuli bor: 1) Flekso (arzon, oddiy qutilar uchun), 2) Ofset (premium, fotorealistik sifat), 3) Raqamli (tezkor, kam hajmli buyurtmalar uchun). Sizga qaysi biri qiziq?",
            ru: "У нас 3 типа печати: 1) Флексо (дешевле, для транспортной тары), 2) Офсет (премиум, фотокачество), 3) Цифровая (быстро, для малых тиражей). Какой вариант вас интересует?",
            en: "We offer 3 printing types: 1) Flexo (cost-effective), 2) Offset (premium photo-quality), 3) Digital (fast, for small batches). Which one interests you?",
            qr: "Bizde 3 turli pechat bar: Flekso, Ofset hám Raqamlı.",
            zh: "我们需要3种印刷类型：1）柔印，2）胶印，3）数码。",
            tr: "3 çeşit baskı sunuyoruz: 1) Flekso, 2) Ofset, 3) Dijital."
        }
    },
    {
        id: 'payment',
        keywords: {
            uz: ['to\'lov', 'pul o\'tkazish', 'payme', 'click', 'naqd', 'karta', 'schet'],
            ru: ['оплата', 'платеж', 'перечисление', 'payme', 'click', 'карта', 'счет'],
            en: ['payment', 'pay', 'card', 'transfer', 'invoice'],
            qr: ['tólew', 'pul'],
            zh: ['付款', '支付'],
            tr: ['odeme', 'kart']
        },
        responses: {
            uz: "To'lov turlari: 1) Pul o'tkazish (yuridik shaxslar uchun), 2) Payme/Click (jismoniy shaxslar uchun), 3) Naqd pul. Barcha to'lovlar rasmiy shartnoma asosida amalga oshiriladi.",
            ru: "Способы оплаты: 1) Перечисление (для юр. лиц), 2) Payme/Click (для физ. лиц), 3) Наличные. Работаем официально по договору.",
            en: "Payment methods: 1) Bank transfer (B2B), 2) Payme/Click, 3) Cash. All payments are processed via official contract.",
            qr: "Tólew túrleri: Pul o'tkeriw, Payme/Click, Naqd pul.",
            zh: "付款方式：银行转账，Payme/Click，现金。",
            tr: "Ödeme yöntemleri: Havale, Payme/Click, Nakit."
        }
    },
    {
        id: 'materials_detail',
        keywords: {
            uz: ['oq', 'jigarrang', 'kraft', 'sellyuloza', 'faktura', 'sifati'],
            ru: ['белый', 'бурый', 'крафт', 'целлюлоза', 'фактура', 'качество'],
            en: ['white', 'brown', 'kraft', 'cellulose', 'quality'],
            qr: ['aq', 'qońır', 'sapa'],
            zh: ['白色', '棕色', '质量'],
            tr: ['beyaz', 'esmer', 'kalite']
        },
        responses: {
            uz: "Materiallar: 'Kraft' (jigarrang, mustahkam, ekologik) va 'Sellyuloza' (oppoq, yorqin pechat uchun). Qaysi rangdagi quti sizga ma'qul?",
            ru: "Материалы: 'Крафт' (бурый, прочный, эко) и 'Целлюлоза' (белый, для яркой печати). Какой цвет предпочитаете?",
            en: "Materials: 'Kraft' (brown, strong, eco) and 'Cellulose' (white, for premium print). Which color do you prefer?",
            qr: "Materiallar: Kraft (qońır) hám Sellyuloza (aq).",
            zh: "材料：牛皮纸（棕色）和纤维素（白色）。",
            tr: "Malzemeler: Kraft (esmer) ve Selüloz (beyaz)."
        }
    },
    {
        id: 'dimensions',
        keywords: {
            uz: ['o\'lcham', 'razmer', 'uzunlik', 'eni', 'bo\'yi', 'balandlik', 'katta', 'kichik'],
            ru: ['размер', 'габариты', 'длина', 'ширина', 'высота', 'большой', 'маленький'],
            en: ['dimension', 'size', 'length', 'width', 'height', 'big', 'small'],
            qr: ['olshem', 'uzınlıq'],
            zh: ['尺寸', '长', '宽'],
            tr: ['boyut', 'olcu']
        },
        responses: {
            uz: "Hozirgi tanlangan model: {{modelName}}. O'lchamlari: {{length}} x {{width}} x {{height}} mm. Bu o'lchamlarni o'zgartirmoqchimisiz?",
            ru: "Текущая модель: {{modelName}}. Размеры: {{length}} x {{width}} x {{height}} мм. Хотите изменить параметры?",
            en: "Current model: {{modelName}}. Dimensions: {{length}} x {{width}} x {{height}} mm. Do you want to change these?",
            qr: "Házirgi model: {{modelName}}. Olshemleri: {{length}} x {{width}} x {{height}} mm.",
            zh: "当前型号：{{modelName}}。尺寸：{{length}} x {{width}} x {{height}} mm。",
            tr: "Mevcut model: {{modelName}}. Boyutlar: {{length}} x {{width}} x {{height}} mm."
        }
    },
    {
        id: 'greeting',
        keywords: {
            uz: ['salom', 'assalom', 'qalay', 'bor'],
            ru: ['привет', 'здравствуйте', 'салом', 'есть'],
            en: ['hello', 'hi', 'hey'],
            qr: ['salom', 'qalay'],
            zh: ['你好'],
            tr: ['selam', 'merhaba']
        },
        responses: {
            uz: "Assalomu alaykum! Men Pack24 AI - qadoqlash bo'yicha bosh maslahatchiman. Sizga O'zbekiston bozorida biznesingizni rivojlantirish va eksportga chiqishda qanday yordam bera olaman?",
            ru: "Здравствуйте! Я главный AI-консультант Pack24. Готов помочь вам оптимизировать упаковку для местного рынка и экспорта из Узбекистана.",
            en: "Hello! I am the Lead AI Consultant for Pack24. I'm here to revolutionize your packaging logistics in Uzbekistan. How can I assist you?",
            qr: "Assalawma áleykum! Pack24 AI sizge xızmet kórsetiwge tayın.",
            zh: "你好！我是Pack24的首席AI顾问。",
            tr: "Merhaba! Pack24 Baş AI Danışmanınız hizmetinizde."
        }
    }
];

export const FALLBACK_RESPONSES: Partial<Record<Language, string>> = {
    uz: "Uzr, savolingizni tushunmadim. Iltimos, boshqacharoq so'rang yoki 'narx', 'yetkazib berish' haqida so'rang.",
    ru: "Извините, я не понял вопрос. Спросите про 'цену' или 'доставку'.",
    en: "Sorry, I didn't understand. Please ask about 'price' or 'delivery'.",
    qr: "Keshire siz, tusinbedim.",
    zh: "抱歉，我不明白。请询问价格或配送。",
    tr: "Üzgünüm, anlamadım."
};

export const CONVERSATION_PROMPTS = {
    intro: {
        uz: "Assalomu Alaykum! Men Pack24 AI maslahatchisiman. Nima haqida ma'lumot olmoqchisiz?",
        ru: "Здравствуйте! Я AI-консультант Pack24. О чем вы хотели бы узнать?",
        en: "Hello! I am Pack24 AI Consultant. What would you like to know about?",
        qr: "Assalawma áleykum! Men Pack24 AI másláhátshisimen. Ne haqqında biliwdi qáleysiz?",
        zh: "你好！我是Pack24 AI顾问。你想了解什么？",
        tr: "Merhaba! Ben Pack24 AI Danışmanıyım. Ne hakkında bilgi almak istersiniz?"
    },
    intent_confirm: {
        uz: "Tushunarli. Sizga {{modelName}} kerak ekan. Hozir {{quantity}} dona tanlangan. Bu miqdor to'g'rimi yoki o'zgartiramizmi?",
        ru: "Понятно. Вам нужна {{modelName}}. Сейчас выбрано {{quantity}} шт. Это правильное количество или изменим?",
        en: "Understood. You need {{modelName}}. Currently {{quantity}} units selected. Is this correct or should we change it?",
        qr: "Tusinikli. Sizge {{modelName}} kerek eken. Házir {{quantity}} dana saylandı. Bul durıspa yamasa ózgertemizbe?",
        zh: "明白。你需要 {{modelName}}。目前选择了 {{quantity}} 个。这是正确的吗，还是我们需要更改？",
        tr: "Anlaşıldı. {{modelName}} ihtiyacınız var. Şu anda {{quantity}} adet seçili. Bu doğru mu yoksa değiştirelim mi?"
    },
    box_qty_ask: {
        uz: "Yaxshi. Endi pechat masalasi: Sizga Ofset (premium) yoki Flekso (oddiy) bosma kerakmi? Logotip bormi?",
        ru: "Хорошо. Теперь насчет печати: Вам нужен Офсет (премиум) или Флексо (простая)? Есть ли логотип?",
        en: "Great. Now regarding printing: Do you need Offset (premium) or Flexo (simple)? Do you have a logo?",
        qr: "Jaqsı. Endi pechat máselesi: Sizge Ofset (premium) yamasa Flekso (ádiy) kerekpe? Logo barmı?",
        zh: "好的。关于印刷：你需要胶印（高级）还是柔印（简单）？你有商标吗？",
        tr: "Harika. Şimdi baskı hakkında: Ofset (premium) mi yoksa Flekso (basit) mu istersiniz? Logonuz var mı?"
    },
    print_type_explain: {
        uz: "Flekso - arzon va tez, transport qutilari uchun. Ofset - qimmatroq, lekin juda sifatli (fotosuratdek) tasvir beradi. Qaysi biri ma'qul?",
        ru: "Флексо - дешевле и быстрее, для транспортных коробок. Офсет - дороже, но дает фотореалистичное качество. Какой вариант предпочтете?",
        en: "Flexo is cheaper/faster for shipping boxes. Offset is premium photo-quality. Which one do you prefer?",
        qr: "Flekso - arzan hám tez. Ofset - qımbatlaw, biraq sapalı. Qaysı biri maqul?",
        zh: "柔印更便宜/更快，适用于运输箱。胶印是照片级质量的。你更喜欢哪一个？",
        tr: "Flekso nakliye kutuları için daha ucuz/hızlıdır. Ofset premium fotoğraf kalitesindedir. Hangisini tercih edersiniz?"
    },
    delivery_ask: {
        uz: "Tushunarli. Yetkazib berish xizmati kerakmi? (Eslatma: bu pullik xizmat)",
        ru: "Понятно. Нужна ли доставка? (Примечание: услуга платная)",
        en: "Understood. Do you need delivery service? (Note: this is a paid service)",
        qr: "Tusinikli. Jetkiziw xızmeti kerekpe? (Eskertpe: bul pullı xızmet)",
        zh: "明白。你需要送货服务吗？（注：这是一项付费服务）",
        tr: "Anlaşıldı. Teslimat hizmetine ihtiyacınız var mı? (Not: bu ücretli bir hizmettir)"
    },
    address_ask: {
        uz: "Manzilingizni yozib yuboring (Tuman, ko'cha, mo'ljal):",
        ru: "Пожалуйста, напишите ваш адрес (Район, улица, ориентир):",
        en: "Please write your address (District, street, landmark):",
        qr: "Mánzilińizdi jazıp jiberiń (Rayon, kóshe, baǵdar):",
        zh: "请写下您的地址（区，街道，地标）：",
        tr: "Lütfen adresinizi yazın (İlçe, sokak, yer işareti):"
    },
    phone_ask_pickup: {
        uz: "Tushunarli, olib ketish (samovivoz). Siz bilan bog'lanish uchun telefon raqamingizni qoldiring:",
        ru: "Понятно, самовывоз. Оставьте номер телефона для связи:",
        en: "Understood, pickup. Please leave your phone number for contact:",
        qr: "Tusinikli, alıp ketiw. Telefon nomerińizdi qaldırıń:",
        zh: "明白，自提。请留下您的联系电话：",
        tr: "Anlaşıldı, gelip alma. İletişim için lütfen telefon numaranızı bırakın:"
    },
    phone_ask_address: {
        uz: "Manzil qabul qilindi. Siz bilan bog'lanish uchun telefon raqamingizni qoldiring:",
        ru: "Адрес принят. Оставьте номер телефона для связи:",
        en: "Address received. Please leave your phone number for contact:",
        qr: "Mánzil qabıllandı. Telefon nomerińizdi qaldırıń:",
        zh: "地址已收到。请留下您的联系电话：",
        tr: "Adres alındı. İletişim için lütfen telefon numaranızı bırakın:"
    },
    payment_ask: {
        uz: "Rahmat. To'lovni qaysi usulda amalga oshirasiz? (Naqd / Pul o'tkazish / Click, Payme)",
        ru: "Спасибо. Как будете платить? (Наличные / Перечисление / Click, Payme)",
        en: "Thanks. How will you pay? (Cash / Transfer / Click, Payme)",
        qr: "Raxmet. Tólewdi qalay ámelge asırasız? (Naqd / Pul o'tkeriw / Click, Payme)",
        zh: "谢谢。您将如何支付？（现金/转账/Click, Payme）",
        tr: "Teşekkürler. Nasıl ödeme yapacaksınız? (Nakit / Havale / Click, Payme)"
    },
    deadline_ask: {
        uz: "Tushunarli. Buyurtma qachonga tayyor bo'lishi kerak? (Sana yoki muddat)",
        ru: "Понятно. Когда заказ должен быть готов? (Дата или срок)",
        en: "Understood. When do you need the order ready? (Date or duration)",
        qr: "Tusinikli. Buyırtpa qashan tayın bolıwı kerek?",
        zh: "明白。订单什么时候需要准备好？（日期或期限）",
        tr: "Anlaşıldı. Siparişin ne zaman hazır olması gerekiyor? (Tarih veya süre)"
    },
    report_title: {
        uz: "✅ BUYURTMA QABUL QILINDI!",
        ru: "✅ ЗАКАЗ ПРИНЯТ!",
        en: "✅ ORDER RECEIVED!",
        qr: "✅ BUYIRTPA QABILLANDI!",
        zh: "✅ 订单已收到！",
        tr: "✅ SİPARİŞ ALINDI!"
    },
    report_labels: {
        uz: { product: "Maxsulot", qty: "Soni", material: "Material", print: "Pechat", delivery: "Yetkazib berish", phone: "Tel", payment: "To'lov", deadline: "Muddat", footer: "Menejerimiz tez orada siz bilan bog'lanadi!" },
        ru: { product: "Продукт", qty: "Кол-во", material: "Материал", print: "Печать", delivery: "Доставка", phone: "Тел", payment: "Оплата", deadline: "Срок", footer: "Наш менеджер скоро свяжется с вами!" },
        en: { product: "Product", qty: "Qty", material: "Material", print: "Print", delivery: "Delivery", phone: "Phone", payment: "Payment", deadline: "Deadline", footer: "Our manager will contact you soon!" },
        qr: { product: "Onim", qty: "Sanı", material: "Material", print: "Pechat", delivery: "Jetkiziw", phone: "Tel", payment: "Tólew", deadline: "Múddet", footer: "Menejerimiz tez arada xabarlasadı!" },
        zh: { product: "产品", qty: "数量", material: "材料", print: "印刷", delivery: "送货", phone: "电话", payment: "付款", deadline: "期限", footer: "我们的经理会尽快联系您！" },
        tr: { product: "Ürün", qty: "Adet", material: "Malzeme", print: "Baskı", delivery: "Teslimat", phone: "Tel", payment: "Ödeme", deadline: "Süre", footer: "Yöneticimiz yakında sizinle iletişime geçecek!" }
    },
    finished_ask: {
        uz: "Yana qanday yordam bera olaman?",
        ru: "Чем еще могу помочь?",
        en: "How else can I help?",
        qr: "Jáne qanday járdem bere alaman?",
        zh: "我还能帮您什么吗？",
        tr: "Başka nasıl yardımcı olabilirim?"
    }
};
