/**
 * Mahsulot nomlari va kategoriyalar tarjimasi — 10 til
 *
 * Mahsulot nomlari DB da o'zbek tilida saqlangan.
 * Bu modul umumiy qadoqlash atamalarini 10 tilga tarjima qiladi.
 * Nom ichida kalit so'zlar topilganda — mos tarjima bilan almashtiriladi.
 */

import type { Language } from './translations';

// ── Kategoriya nomlari tarjimasi ─────────────────────────────────────────────
export const CATEGORY_NAMES: Record<string, Record<Language, string>> = {
    'karton-qutilar':       { uz: "Karton qutilar",      ru: "Картонные коробки",       en: "Cardboard Boxes",       qr: "Karton qutılar",        zh: "纸板箱",     tr: "Karton Kutular",      tg: "Қуттиҳои картонӣ",   kk: "Картон қораптар",   tk: "Karton gutular",    fa: "جعبه‌های کارتونی" },
    'gofrokoroblar':        { uz: "Gofroqorti qutilar",  ru: "Гофрокороба",             en: "Corrugated Boxes",      qr: "Gofroqorti qutılar",    zh: "瓦楞纸箱",   tr: "Oluklu Karton Kutu", tg: "Қуттиҳои гофрокартон", kk: "Гофрокараптар",   tk: "Gofrokutu",         fa: "جعبه‌های موجدار" },
    'gofrokarton':          { uz: "Gofrokarton",          ru: "Гофрокартон",             en: "Corrugated Board",      qr: "Gofrokarton",           zh: "瓦楞纸板",   tr: "Oluklu Karton",      tg: "Гофрокартон",        kk: "Гофрокартон",       tk: "Gofrokarton",       fa: "مقوای موج‌دار" },
    'kuryer-paketlari':     { uz: "Kuryer paketlari",    ru: "Курьерские пакеты",        en: "Courier Bags",          qr: "Kuryer paketleri",      zh: "快递袋",     tr: "Kurye Poşetleri",    tg: "Халтаҳои курерӣ",    kk: "Курьер пакеттер",   tk: "Kurýer paketleri",  fa: "کیسه‌های پیک" },
    'bopp-paketlar':        { uz: "BOPP paketlar",       ru: "BOPP-пакеты",              en: "BOPP Bags",             qr: "BOPP paketler",         zh: "BOPP袋",    tr: "BOPP Poşetler",      tg: "Пакетҳои BOPP",      kk: "BOPP пакеттер",     tk: "BOPP paketler",     fa: "کیسه‌های BOPP" },
    'streich-plyonka':      { uz: "Stretch plyonka",     ru: "Стрейч-плёнка",            en: "Stretch Film",          qr: "Stretch plyonka",       zh: "拉伸膜",     tr: "Streç Film",         tg: "Ленти стретч",       kk: "Стрейч пленка",     tk: "Stçreç plýonka",    fa: "فیلم کشی" },
    'skotch-yelim-lenta':   { uz: "Skotch / Yelim lenta", ru: "Скотч / лента",           en: "Tape / Adhesive",       qr: "Skotch / Yapıshqaq lenta", zh: "胶带",   tr: "Bant / Yapışkan",    tg: "Скотч / часпак",     kk: "Скотч / жапсырма",  tk: "Skotch / ýelimleýji lenta", fa: "نوار چسب" },
    'pufakchali-plyonka':   { uz: "Havo-pufakli plyonka", ru: "Воздушно-пузырьковая",   en: "Bubble Wrap",           qr: "Hawa-pufaklı plyonka",  zh: "气泡膜",     tr: "Baloncuklu Film",    tg: "Ленти пуфакдор",     kk: "Көпіршікті пленка", tk: "Howa pufurjykly",   fa: "فیلم حبابی" },
    'kraft-paketlar':       { uz: "Kraft qog'oz sumkalar", ru: "Крафт-пакеты",           en: "Kraft Paper Bags",      qr: "Kraft qağaz sumkalar",  zh: "牛皮纸袋",   tr: "Kraft Kağıt Torba",  tg: "Тасмаҳои крафт",     kk: "Крафт қаптар",      tk: "Kraft sumkalar",    fa: "کیسه‌های کرافت" },
    'kopikli-polietilen':   { uz: "Ko'pikli polietilen",  ru: "Вспененный полиэтилен",    en: "Foam Polyethylene",     qr: "Köpikli polietilen",    zh: "泡沫聚乙烯", tr: "Köpük Polietilen",   tg: "Полиэтилени кафкӣ",  kk: "Көпіршікті полиэтилен", tk: "Köpürjükli polietilen", fa: "پلی‌اتیلن اسفنجی" },
    'qadoqlash-qogozi':     { uz: "Qadoqlash qog'ozi",   ru: "Упаковочная бумага",       en: "Wrapping Paper",        qr: "Qadowlaw qag'azı",      zh: "包装纸",     tr: "Ambalaj Kağıdı",     tg: "Коғази бастабандӣ",  kk: "Орау қағазы",       tk: "Gaplama kağyzy",    fa: "کاغذ بسته‌بندی" },
    'pp-lenta':             { uz: "PP lenta (tasma)",     ru: "ПП-лента",                 en: "PP Strap",              qr: "PP lenta",              zh: "PP打包带",   tr: "PP Çemberleme",      tg: "Навори ПП",          kk: "ПП лента",          tk: "PP lenta",          fa: "باند PP" },
    'himoya-profili':       { uz: "Himoya profili",       ru: "Защитный профиль",         en: "Edge Protectors",       qr: "Qorıw profili",         zh: "护角",       tr: "Köşe Koruyucu",      tg: "Профили муҳофизатӣ", kk: "Қорғаныш бұрыш",    tk: "Goranyş profili",   fa: "نبشی محافظ" },
    'polietilen-paketlar':  { uz: "Polietilen paketlar",  ru: "Полиэтиленовые пакеты",    en: "Polyethylene Bags",     qr: "Polietilen paketler",   zh: "聚乙烯袋",   tr: "Polietilen Poşetler", tg: "Халтаҳои полиэтилен", kk: "Полиэтилен пакеттер", tk: "Polietilen paketler", fa: "کیسه‌های پلی‌اتیلن" },
    'zip-lock-paketlar':    { uz: "Zip-lock paketlar",   ru: "Зип-пакеты",               en: "Zip-lock Bags",         qr: "Zip-lock paketler",     zh: "拉链袋",     tr: "Fermuarlı Poşet",    tg: "Пакетҳои зип",       kk: "Зип пакеттер",      tk: "Zip-lock paketler", fa: "کیسه‌های زیپ" },
    'termoetiketkalar':     { uz: "Termoetiketkalar",    ru: "Термоэтикетки",             en: "Thermal Labels",        qr: "Termoetiketkalar",      zh: "热敏标签",   tr: "Termal Etiketler",   tg: "Брчаспҳои термикӣ",  kk: "Термоэтикеткалар",  tk: "Termoetiketkalar",  fa: "برچسب‌های حرارتی" },
    'chiqindi-paketlari':   { uz: "Chiqindi paketlari",  ru: "Мусорные пакеты",           en: "Garbage Bags",          qr: "Shıqındı paketleri",    zh: "垃圾袋",     tr: "Çöp Torbaları",      tg: "Халтаҳои партов",    kk: "Қоқыс пакеттер",   tk: "Zibil paketleri",   fa: "کیسه‌های زباله" },
    'flyuzelin':            { uz: "Flyuzelin (Spunbond)", ru: "Флизелин",                 en: "Spunbond",              qr: "Flyuzelin",             zh: "无纺布",     tr: "Flizelin",           tg: "Флизелин",           kk: "Флизелин",          tk: "Flyuzelin",         fa: "فلیزلین" },
    'qogoz-stakanlar':      { uz: "Qog'oz stakanlar",    ru: "Бумажные стаканы",          en: "Paper Cups",            qr: "Qağaz stakanlar",       zh: "纸杯",       tr: "Kağıt Bardaklar",    tg: "Стаканҳои коғазӣ",   kk: "Қағаз стақандар",   tk: "Kagyzy stakanlar",  fa: "لیوان‌های کاغذی" },
    'qogoz-idishlar':       { uz: "Qog'oz idishlar",     ru: "Бумажная посуда",           en: "Paper Tableware",       qr: "Qağaz idishlar",        zh: "纸餐具",     tr: "Kağıt Tabaklar",     tg: "Зарфҳои коғазӣ",     kk: "Қағаз ыдыстар",     tk: "Kagyzy gaplar",     fa: "ظروف کاغذی" },
    'qogoz-paketlar':       { uz: "Qog'oz paketlar",     ru: "Бумажные пакеты",           en: "Paper Bags",            qr: "Qağaz paketler",        zh: "纸袋",       tr: "Kağıt Poşetler",     tg: "Халтаҳои коғазӣ",    kk: "Қағаз пакеттер",    tk: "Kagyzy paketler",   fa: "کیسه‌های کاغذی" },
    'qogoz-tovoqlar':       { uz: "Qog'oz tovoqlar",     ru: "Бумажные лотки",            en: "Paper Trays",           qr: "Qağaz tabaqlar",        zh: "纸盘",       tr: "Kağıt Tepsiler",     tg: "Табақҳои коғазӣ",    kk: "Қағаз табақтар",    tk: "Kagyzy tabaqlar",   fa: "سینی‌های کاغذی" },
    'qogoz-qoplar':         { uz: "Qog'oz qoplar",       ru: "Бумажные мешки",            en: "Paper Sacks",           qr: "Qağaz qaplar",          zh: "纸袋",       tr: "Kağıt Çuvallar",     tg: "Халтаҳои коғазӣ",    kk: "Қағаз қаптар",      tk: "Kagyzy gaplar",     fa: "کیسه‌های کاغذی" },
    'qogoz-salofankalar':   { uz: "Qog'oz salofankalar", ru: "Бумажные салфетки",         en: "Paper Napkins",         qr: "Qağaz salofankalar",    zh: "纸巾",       tr: "Kağıt Peçeteler",    tg: "Салфеткаҳои коғазӣ", kk: "Қағаз майлықтар",   tk: "Kagyzy salfetkalar", fa: "دستمال کاغذی" },
    'qogoz-qoshiqlar':      { uz: "Qog'oz qoshiqlar",    ru: "Бумажные ложки",            en: "Paper Spoons",          qr: "Qağaz qasıqlar",        zh: "纸勺",       tr: "Kağıt Kaşıklar",     tg: "Қошуқҳои коғазӣ",    kk: "Қағаз қасықтар",    tk: "Kagyzy çemçeler",   fa: "قاشق‌های کاغذی" },
    'qogoz-vilkalar':       { uz: "Qog'oz vilkalar",     ru: "Бумажные вилки",            en: "Paper Forks",           qr: "Qağaz vilkalar",        zh: "纸叉",       tr: "Kağıt Çatallar",     tg: "Чангалҳои коғазӣ",   kk: "Қағаз шанышқылар",  tk: "Kagyzy çangallar",  fa: "چنگال‌های کاغذی" },
    'qogoz-pichoqlar':      { uz: "Qog'oz pichoqlar",    ru: "Бумажные ножи",             en: "Paper Knives",          qr: "Qağaz pıshaqlar",       zh: "纸刀",       tr: "Kağıt Bıçaklar",     tg: "Кордҳои коғазӣ",     kk: "Қағаз пышақтар",    tk: "Kagyzy pyçaklar",   fa: "چاقوهای کاغذی" },
    'qogoz-somonlar':       { uz: "Qog'oz somonlar",     ru: "Бумажные трубочки",         en: "Paper Straws",          qr: "Qağaz somonlar",        zh: "纸吸管",     tr: "Kağıt Pipetler",     tg: "Найчаҳои коғазӣ",    kk: "Қағаз түтіктер",    tk: "Kagyzy somonlar",   fa: "نی‌های کاغذی" },
    'qogoz-qopqoqlar':      { uz: "Qog'oz qopqoqlar",    ru: "Бумажные крышки",           en: "Paper Lids",            qr: "Qağaz qapqaqlar",       zh: "纸盖",       tr: "Kağıt Kapaklar",     tg: "Сарпӯшҳои коғазӣ",   kk: "Қағаз қақпақтар",   tk: "Kagyzy gapaklar",   fa: "درب‌های کاغذی" },
    'qogoz-laganlar':       { uz: "Qog'oz laganlar",     ru: "Бумажные тарелки",          en: "Paper Plates",          qr: "Qağaz laganlar",        zh: "纸碟",       tr: "Kağıt Tabaklar",     tg: "Табақҳои коғазӣ",    kk: "Қағаз табақтар",    tk: "Kagyzy tabaklar",   fa: "بشقاب‌های کاغذی" },
    'qogoz-qutilar':        { uz: "Qog'oz qutilar",      ru: "Бумажные коробки",          en: "Paper Boxes",           qr: "Qağaz qutılar",         zh: "纸盒",       tr: "Kağıt Kutular",      tg: "Қуттиҳои коғазӣ",    kk: "Қағаз қораптар",    tk: "Kagyzy gutular",    fa: "جعبه‌های کاغذی" },
    'qogoz-konvertlar':     { uz: "Qog'oz konvertlar",   ru: "Бумажные конверты",         en: "Paper Envelopes",       qr: "Qağaz konvertler",      zh: "纸信封",     tr: "Kağıt Zarflar",      tg: "Лифофаҳои коғазӣ",   kk: "Қағаз конверттер",  tk: "Kagyzy konwertler", fa: "پاکت‌های کاغذی" },
    'qogoz-etiketkalar':    { uz: "Qog'oz etiketkalar",  ru: "Бумажные этикетки",         en: "Paper Labels",          qr: "Qağaz etiketkalar",     zh: "纸标签",     tr: "Kağıt Etiketler",    tg: "Брчаспҳои коғазӣ",   kk: "Қағаз этикеткалар", tk: "Kagyzy etiketkalar", fa: "برچسب‌های کاغذی" },
    'qogoz-stikerlar':      { uz: "Qog'oz stikerlar",    ru: "Бумажные стикеры",          en: "Paper Stickers",        qr: "Qağaz stikerler",       zh: "纸贴纸",     tr: "Kağıt Etiketler",    tg: "Стикерҳои коғазӣ",   kk: "Қағаз стикерлер",   tk: "Kagyzy stikerler",  fa: "برچسب‌های کاغذی" },
    'qogoz-bloknotlar':     { uz: "Qog'oz bloknotlar",   ru: "Бумажные блокноты",         en: "Paper Notebooks",       qr: "Qağaz bloknotlar",      zh: "纸笔记本",   tr: "Kağıt Defterler",    tg: "Блокнотҳои коғазӣ",  kk: "Қағаз блокноттар",  tk: "Kagyzy bloknotlar", fa: "دفترچه‌های کاغذی" },
    'qogoz-daftar':         { uz: "Qog'oz daftar",       ru: "Бумажная тетрадь",          en: "Paper Notebook",        qr: "Qağaz dápter",          zh: "纸笔记本",   tr: "Kağıt Defter",       tg: "Дафтарчаи коғазӣ",   kk: "Қағаз дәптер",      tk: "Kagyzy depder",     fa: "دفتر کاغذی" },
    'qogoz-ruchka':         { uz: "Qog'oz ruchka",       ru: "Бумажная ручка",            en: "Paper Pen",             qr: "Qağaz ruchka",          zh: "纸笔",       tr: "Kağıt Kalem",        tg: "Ручкаи коғазӣ",      kk: "Қағаз қалам",       tk: "Kagyzy ruçka",      fa: "خودکار کاغذی" },
    'qogoz-qalam':          { uz: "Qog'oz qalam",        ru: "Бумажный карандаш",         en: "Paper Pencil",          qr: "Qağaz qalam",           zh: "纸铅笔",     tr: "Kağıt Kurşun Kalem", tg: "Қалами коғазӣ",      kk: "Қағаз қарындаш",    tk: "Kagyzy galam",      fa: "مداد کاغذی" },
    'qogoz-ochirgich':      { uz: "Qog'oz o'chirgich",   ru: "Бумажный ластик",           en: "Paper Eraser",          qr: "Qağaz óshirgish",       zh: "纸橡皮",     tr: "Kağıt Silgi",        tg: "Резини коғазӣ",      kk: "Қағаз өшіргіш",     tk: "Kagyzy öçürgiç",    fa: "پاک‌کن کاغذی" },
    'qogoz-qaychi':         { uz: "Qog'oz qaychi",       ru: "Бумажные ножницы",          en: "Paper Scissors",        qr: "Qağaz qayshı",          zh: "纸剪刀",     tr: "Kağıt Makas",        tg: "Қайчии коғазӣ",      kk: "Қағаз қайшы",       tk: "Kagyzy gaýçy",      fa: "قیچی کاغذی" },
    'qogoz-yopishtirgich':  { uz: "Qog'oz yopishtirgich", ru: "Бумажный клей",             en: "Paper Glue",            qr: "Qağaz japıstırgish",    zh: "纸胶水",     tr: "Kağıt Yapıştırıcı",  tg: "Часпаки коғазӣ",     kk: "Қағаз желім",       tk: "Kagyzy ýelimi",     fa: "چسب کاغذی" },
    'qogoz-marker':         { uz: "Qog'oz marker",       ru: "Бумажный маркер",           en: "Paper Marker",          qr: "Qağaz marker",          zh: "纸记号笔",   tr: "Kağıt İşaretleyici", tg: "Маркери коғазӣ",     kk: "Қағаз маркер",      tk: "Kagyzy marker",     fa: "ماژیک کاغذی" },
    'qogoz-doska':          { uz: "Qog'oz doska",        ru: "Бумажная доска",            en: "Paper Board",           qr: "Qağaz doska",           zh: "纸板",       tr: "Kağıt Tahta",        tg: "Тахтаи коғазӣ",      kk: "Қағаз тақта",       tk: "Kagyzy tagta",      fa: "تخته کاغذی" },
    'qogoz-fayl':           { uz: "Qog'oz fayl",         ru: "Бумажный файл",             en: "Paper File",            qr: "Qağaz fayl",            zh: "纸文件",     tr: "Kağıt Dosya",        tg: "Файли коғазӣ",       kk: "Қағаз файл",        tk: "Kagyzy faýl",       fa: "فایل کاغذی" },
    'qogoz-papka':          { uz: "Qog'oz papka",        ru: "Бумажная папка",            en: "Paper Folder",          qr: "Qağaz papka",           zh: "纸文件夹",   tr: "Kağıt Klasör",        tg: "Папкаи коғазӣ",      kk: "Қағаз папка",       tk: "Kagyzy papka",      fa: "پوشه کاغذی" },
    'qogoz-skrepka':        { uz: "Qog'oz skrepka",      ru: "Бумажная скрепка",          en: "Paper Clip",            qr: "Qağaz skrepka",         zh: "纸夹",       tr: "Kağıt Ataç",         tg: "Скрепкаи коғазӣ",    kk: "Қағаз қыстырғыш",   tk: "Kagyzy skrepka",    fa: "گیره کاغذی" },
    'qogoz-stepler':        { uz: "Qog'oz stepler",      ru: "Бумажный степлер",          en: "Paper Stapler",         qr: "Qağaz stepler",         zh: "纸订书机",   tr: "Kağıt Zımba",        tg: "Степлери коғазӣ",    kk: "Қағаз степлер",     tk: "Kagyzy stepler",    fa: "منگنه کاغذی" },
    'qogoz-teshikochgich':  { uz: "Qog'oz teshikochgich", ru: "Бумажный дырокол",          en: "Paper Punch",           qr: "Qağaz tesikoshgish",    zh: "纸打孔机",   tr: "Kağıt Delgeç",       tg: "Сӯрохкунаки коғазӣ", kk: "Қағаз тескіш",      tk: "Kagyzy deşik açyjy", fa: "سوراخ‌کن کاغذی" },
    'qogoz-kalkulyator':    { uz: "Qog'oz kalkulyator",  ru: "Бумажный калькулятор",      en: "Paper Calculator",      qr: "Qağaz kalkulyator",     zh: "纸计算器",   tr: "Kağıt Hesap Makinesi", tg: "Калкулятори коғазӣ", kk: "Қағаз калькулятор", tk: "Kagyzy kalkulýator", fa: "ماشین حساب کاغذی" },
    'qogoz-printer':        { uz: "Qog'oz printer",      ru: "Бумажный принтер",          en: "Paper Printer",         qr: "Qağaz printer",         zh: "纸打印机",   tr: "Kağıt Yazıcı",       tg: "Принтери коғазӣ",    kk: "Қағаз принтер",     tk: "Kagyzy printer",    fa: "پرینتر کاغذی" },
    'qogoz-skaner':         { uz: "Qog'oz skaner",       ru: "Бумажный сканер",           en: "Paper Scanner",         qr: "Qağaz skaner",          zh: "纸扫描仪",   tr: "Kağıt Tarayıcı",     tg: "Сканнери коғазӣ",    kk: "Қағаз сканер",      tk: "Kagyzy skaner",     fa: "اسکنر کاغذی" },
    'qogoz-kseroks':        { uz: "Qog'oz kseroks",      ru: "Бумажный ксерокс",          en: "Paper Copier",          qr: "Qağaz kseroks",         zh: "纸复印机",   tr: "Kağıt Fotokopi",     tg: "Ксерокси коғазӣ",    kk: "Қағаз ксерокс",     tk: "Kagyzy kseroks",    fa: "دستگاه کپی کاغذی" },
    'qogoz-laminator':      { uz: "Qog'oz laminator",    ru: "Бумажный ламинатор",        en: "Paper Laminator",       qr: "Qağaz laminator",       zh: "纸覆膜机",   tr: "Kağıt Laminatör",    tg: "Ламинатори коғазӣ",  kk: "Қағаз ламинатор",   tk: "Kagyzy laminator",  fa: "لمینیتور کاغذی" },
    'qogoz-gilotina':       { uz: "Qog'oz gilotina",     ru: "Бумажная гильотина",        en: "Paper Guillotine",       qr: "Qağaz gilotina",        zh: "纸切纸机",   tr: "Kağıt Giyotin",      tg: "Гилотинаи коғазӣ",   kk: "Қағаз гильотина",   tk: "Kagyzy gilotina",   fa: "گیوتین کاغذی" },
    'qogoz-bindir':         { uz: "Qog'oz bindir",       ru: "Бумажный биндер",           en: "Paper Binder",          qr: "Qağaz bindir",          zh: "纸装订机",   tr: "Kağıt Ciltleyici",    tg: "Биндер коғазӣ",      kk: "Қағаз биндер",      tk: "Kagyzy bindir",     fa: "صحافی کاغذی" },
};

// ── Umumiy qadoqlash atamalari tarjimasi ─────────────────────────────────────
// Mahsulot nomini "parse" qilib, kalit so'zlarni tiling tarzida almashtiramiz
const TERM_MAP: Record<string, Record<Language, string>> = {
    'karton quti':       { uz: 'Karton quti',    ru: 'Картонная коробка', en: 'Cardboard box', qr: 'Karton qutı', zh: '纸板箱',  tr: 'Karton kutu',   tg: 'Қуттии картонӣ',   kk: 'Картон қорап',   tk: 'Karton guty',     fa: 'جعبه کارتونی' },
    'gofroqorti':        { uz: 'Gofroqorti',     ru: 'Гофрокартон',       en: 'Corrugated',    qr: 'Gofroqorti', zh: '瓦楞纸',   tr: 'Oluklu karton', tg: 'Гофрокартон',      kk: 'Гофрокартон',    tk: 'Gofrokarton',     fa: 'مقوای موجدار' },
    'kuryer paketi':     { uz: 'Kuryer paketi',  ru: 'Курьерский пакет',  en: 'Courier bag',   qr: 'Kuryer paketi', zh: '快递袋', tr: 'Kurye poşeti',  tg: 'Ҳалтаи курерӣ',    kk: 'Курьер пакет',   tk: 'Kurýer paketi',   fa: 'کیف پیک' },
    'stretch plyonka':   { uz: 'Stretch plyonka', ru: 'Стрейч-плёнка',   en: 'Stretch film',  qr: 'Stretch plyonka', zh: '拉伸膜', tr: 'Streç film',   tg: 'Ленти стретч',     kk: 'Стрейч пленка',  tk: 'Stçreç plýonka',  fa: 'فیلم کشی' },
    'havo-pufakli':      { uz: 'Havo-pufakli',  ru: 'Пузырьчатый',       en: 'Bubble wrap',   qr: 'Hawa-pufaklı', zh: '气泡',  tr: 'Baloncuklu',    tg: 'Пуфакдор',         kk: 'Көпіршікті',     tk: 'Howa pufurjykly', fa: 'حبابی' },
    'kraft':             { uz: "Kraft qog'oz",   ru: 'Крафт-бумага',      en: 'Kraft paper',   qr: 'Kraft qağaz', zh: '牛皮纸',  tr: 'Kraft kağıt',   tg: 'Коғази крафт',     kk: 'Крафт қағаз',    tk: 'Kraft kağyz',     fa: 'کاغذ کرافت' },
    "ko'pikli":          { uz: "Ko'pikli",       ru: 'Вспененный',        en: 'Foam',          qr: 'Köpikli',     zh: '泡沫',    tr: 'Köpük',         tg: 'Кафкӣ',            kk: 'Көпіршікті',     tk: 'Köpürjükli',      fa: 'اسفنجی' },
    'skotch':            { uz: 'Skotch',         ru: 'Скотч',             en: 'Tape',          qr: 'Skotch',      zh: '胶带',    tr: 'Bant',          tg: 'Скотч',            kk: 'Скотч',          tk: 'Skotch',          fa: 'نوار چسب' },
    'zip-lock':          { uz: 'Zip-lock',       ru: 'Зип-пакет',         en: 'Zip-lock',      qr: 'Zip-lock',    zh: '拉链袋',   tr: 'Fermuarlı',     tg: 'Зип',              kk: 'Зип',            tk: 'Zip-lock',        fa: 'زیپ' },
    'termo etiketka':    { uz: 'Termo etiketka', ru: 'Термоэтикетка',     en: 'Thermal label', qr: 'Termoetiketka', zh: '热敏标签', tr: 'Termal etiket', tg: 'Брчаспи термикӣ', kk: 'Термоэтикетка',  tk: 'Termoetiketka',   fa: 'برچسب حرارتی' },
    'chiqindi paketi':   { uz: 'Chiqindi paketi', ru: 'Мусорный пакет',   en: 'Garbage bag',   qr: 'Shıqındı paketi', zh: '垃圾袋', tr: 'Çöp torbası', tg: 'Ҳалтаи партов',    kk: 'Қоқыс пакет',    tk: 'Zibil paketi',    fa: 'کیسه زباله' },
    'polietilen paket':  { uz: 'Polietilen paket', ru: 'Полиэтиленовый пакет', en: 'Polyethylene bag', qr: 'Polietilen paket', zh: '聚乙烯袋', tr: 'Polietilen poşet', tg: 'Ҳалтаи полиэтилен', kk: 'Полиэтилен пакет', tk: 'Polietilen paketi', fa: 'کیسه پلی‌اتیلن' },
    'pp lenta':          { uz: 'PP lenta',        ru: 'ПП-лента',          en: 'PP strap',      qr: 'PP lenta',    zh: 'PP打包带',  tr: 'PP çemberleme', tg: 'Навори ПП',        kk: 'ПП лента',       tk: 'PP lenta',        fa: 'باند PP' },
    'plyonka':           { uz: 'Plyonka',         ru: 'Плёнка',            en: 'Film',          qr: 'Plyonka',     zh: '薄膜',    tr: 'Film',          tg: 'Лента',            kk: 'Пленка',         tk: 'Plýonka',         fa: 'فیلم' },
    'quti':              { uz: 'Quti',            ru: 'Коробка',           en: 'Box',           qr: 'Qutı',        zh: '箱',      tr: 'Kutu',          tg: 'Қутти',            kk: 'Қорап',          tk: 'Guty',            fa: 'جعبه' },
    'paket':             { uz: 'Paket',           ru: 'Пакет',             en: 'Bag',           qr: 'Paket',       zh: '袋',      tr: 'Poşet',         tg: 'Ҳалта',            kk: 'Пакет',          tk: 'Paket',           fa: 'کیسه' },
    'sumka':             { uz: "Sumka",           ru: 'Сумка',             en: 'Bag',           qr: 'Sumka',       zh: '手提袋',   tr: 'Torba',         tg: 'Сумка',            kk: 'Сумка',          tk: 'Sumka',           fa: 'کیف' },
    'rulon':             { uz: 'Rulon',           ru: 'Рулон',             en: 'Roll',          qr: 'Rulon',       zh: '卷',      tr: 'Rulo',          tg: 'Руло',             kk: 'Орам',           tk: 'Rulon',           fa: 'رول' },
    'lenta':             { uz: 'Lenta',           ru: 'Лента',             en: 'Tape',          qr: 'Lenta',       zh: '胶带',    tr: 'Bant',          tg: 'Навор',            kk: 'Лента',          tk: 'Lenta',           fa: 'نوار' },
    'burchak':           { uz: 'Burchak',         ru: 'Угол',              en: 'Corner',        qr: 'Burchak',     zh: '护角',    tr: 'Köşe',          tg: 'Кунҷ',             kk: 'Бұрыш',          tk: 'Burç',            fa: 'گوشه' },
    'futbolka':          { uz: "Futbolka shakli", ru: 'Майка',             en: 'T-shirt style', qr: 'Futbolka',    zh: 'T型',     tr: 'Yelek tipi',    tg: 'Намуди футболка',  kk: 'Майка пішін',    tk: 'Futbolka şekil',  fa: 'سبک تی‌شرت' },
};

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

/**
 * Mahsulot kategoriyasini tanlangan tilga tarjima qiladi.
 * Slug yoki nom bo'yicha qidiradi.
 */
export function translateCategory(categorySlugOrName: string, lang: Language): string {
    // 1. To'g'ridan slug bilan topish
    const direct = CATEGORY_NAMES[categorySlugOrName];
    if (direct) return direct[lang] ?? direct['uz'];

    // 2. Nomni slugga avtomatik aylantirish
    //    "Karton Qutilar" → "karton-qutilar"
    const autoSlug = categorySlugOrName
        .toLowerCase()
        .trim()
        .replace(/['']/g, '')
        .replace(/\s+/g, '-')
        .replace(/[()[\]]/g, '')
        .replace(/-+/g, '-');

    const bySlug = CATEGORY_NAMES[autoSlug];
    if (bySlug) return bySlug[lang] ?? bySlug['uz'];

    // 3. Qo'lda yozilgan legacy mapping
    const legacyMap: Record<string, string> = {
        'gofroqorti':               'gofrokoroblar',
        'polietilen paketlar':       'polietilen-paketlar',
        'stretch plyonka':           'streich-plyonka',
        'lipa lenta':                'skotch-yelim-lenta',
        'havo-pufakli plyonka':      'pufakchali-plyonka',
        "qog'oz sumkalar":           'kraft-paketlar',
        "qog'oz va karton":          'qadoqlash-qogozi',
        "ko'pikli plyonka":          'kopikli-polietilen',
        'tasma':                     'pp-lenta',
        "qo'riqchi qirralar":        'himoya-profili',
        'flyuzelin':                 'flyuzelin',
        'gofrokoroblar':             'gofrokoroblar',
        'arxiv qutilari':            'arxiv-qutilar',
        'oziq-ovqat konteynerlari':  'oziq-ovqat-konteynerlar',
        'doy-pak':                   'doy-pak',
    };
    const normalized = categorySlugOrName.toLowerCase().trim();
    const legacySlug = legacyMap[normalized];
    if (legacySlug && CATEGORY_NAMES[legacySlug]) {
        return CATEGORY_NAMES[legacySlug][lang] ?? CATEGORY_NAMES[legacySlug]['uz'];
    }

    // 4. CATEGORY_NAMES ichida o'zbek nomi bo'yicha qidirish
    for (const [, translations] of Object.entries(CATEGORY_NAMES)) {
        if (translations.uz.toLowerCase() === normalized) {
            return translations[lang] ?? translations['uz'];
        }
    }

    // Topilmasa asl nomni qaytarish
    return categorySlugOrName;
}

/**
 * Mahsulot nomini tanlangan tilga tarjima qilishga harakat qiladi.
 * O'zbek nomidagi umumiy so'zlarni topib, mos tarjima bilan almashtiradi.
 * Sonlar, o'lchamlar va SKU kodlari saqlanib qoladi.
 */
export function translateProductName(name: string, lang: Language): string {
    if (lang === 'uz') return name; // O'zbek tilida original nom
    if (lang === 'ru') return translateToRussian(name);

    // Boshqa tillar uchun: asosiy atamani eng uzundan qidirib tarjima qilamiz
    let result = name;
    const sortedTerms = Object.keys(TERM_MAP).sort((a, b) => b.length - a.length);
    for (const term of sortedTerms) {
        const regex = new RegExp(term, 'gi');
        if (regex.test(result.toLowerCase())) {
            const translated = TERM_MAP[term][lang] ?? TERM_MAP[term]['en'] ?? term;
            result = result.replace(regex, translated);
            break; // Birinchi mos kelgan atamani tarjima qilamiz
        }
    }
    return result;
}

/** O'zbekcha nomni ruscha qilish (existing translations yoki oddiy mapping) */
function translateToRussian(name: string): string {
    const RU_TERMS: Record<string, string> = {
        'karton quti': 'Картонная коробка',
        'gofroqorti quti': 'Гофрокороб',
        'gofroqorti': 'Гофрокартон',
        'kuryer paketi': 'Курьерский пакет',
        'stretch plyonka': 'Стрейч-плёнка',
        'havo-pufakli plyonka': 'Воздушно-пузырьковая плёнка',
        "kraft qog'oz sumka": 'Крафт-пакет',
        "ko'pikli polietilen": 'Вспененный полиэтилен',
        "kraft qog'oz rulon": 'Рулон крафт-бумаги',
        'skotch opp': 'Скотч ОПП',
        'pp lenta': 'ПП-лента',
        'penoplast burchak': 'Угловой протектор',
        'polietilen paket futbolka': 'Пакет-майка',
        'zip-lock paket': 'Зип-пакет',
        'termo etiketka': 'Термоэтикетка',
        'chiqindi paketi': 'Мусорный пакет',
        'bopp paket': 'БОPP-пакет',
        'gofrokarton': 'Гофрокартон',
        'quti': 'коробка',
        'paket': 'пакет',
        'rulon': 'рулон',
        'plyonka': 'плёнка',
        'lenta': 'лента',
        'burchak': 'угол',
        'sumka': 'сумка',
    };
    let result = name;
    const sorted = Object.keys(RU_TERMS).sort((a, b) => b.length - a.length);
    for (const key of sorted) {
        const regex = new RegExp(key, 'gi');
        if (regex.test(result.toLowerCase())) {
            result = result.replace(regex, RU_TERMS[key]);
        }
    }
    return result;
}

/** UI kalitini tanlangan tilga tarjima qiladi */
export function getProductUI(key: keyof typeof PRODUCT_UI, lang: Language): string {
    return PRODUCT_UI[key]?.[lang] ?? PRODUCT_UI[key]?.['en'] ?? key;
}
