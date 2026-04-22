# Pack24 Web

Pack24 bu qadoqlash mahsulotlari uchun web platforma bo'lib, bir nechta biznes
qatlamni bitta repo ichida birlashtiradi:

- public e-commerce sayt
- admin boshqaruv paneli
- ombor va ishlab chiqarish modullari
- recycling (makulatura) operatsiyalari
- Telegram customer, driver va admin botlari
- Telegram Web App uchun mobil sirt

Texnologiyalar: `Next.js 15`, `React 19`, `Prisma`, `PostgreSQL`, `NextAuth`,
`Telegraf`, `Tailwind`, `Zustand`.

## Arxitektura qisqacha

### Asosiy kataloglar

- `src/app` — App Router sahifalari va API route'lar
- `src/app/(main)` — public sayt va admin sahifalar
- `src/app/(mobile)` — Telegram Web App sathi
- `src/app/api` — auth, admin, recycling, telegram, payment va boshqa backend route'lar
- `src/lib` — auth, Prisma, store, Telegram va umumiy helperlar
- `src/lib/telegram` — customer, driver va admin botlar
- `prisma/schema.prisma` — yagona ma'lumot modeli

### Muhim sirtlar

- Public storefront: katalog, mahsulot, savat, checkout, to'lov, sharhlar
- Admin panel: orders, customers, marketing, reports, logistics, production, recycling
- Recycling moduli: point, supervisor, driver, request, collection, complaint, journal
- Telegram: customer bot, driver bot, admin bot, webhook route'lari

Qo'shimcha texnik xarita uchun:

- `docs/architecture-overview.md`
- `docs/auth-and-runtime-flows.md`
- `docs/schema-tightening-plan.md`

## Lokal ishga tushirish

### 1. Dependency o'rnatish

```bash
npm install
```

### 2. Kerakli env qiymatlarini sozlash

Kamida quyidagilar loyiha ishlashi uchun muhim:

- `DATABASE_URL`
- `DIRECT_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_APP_URL`

Quyidagi env'lar sirtga qarab ishlatiladi:

#### Admin auth

- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`
- `ADMIN_SECRET`

#### Telegram

- `CUSTOMER_BOT_TOKEN`
- `DRIVER_BOT_TOKEN`
- `ADMIN_BOT_TOKEN`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_ADMIN_CHAT_ID`

#### To'lov

- `CLICK_SERVICE_ID`
- `CLICK_MERCHANT_ID`
- `CLICK_SECRET_KEY`
- `CLICK_MERCHANT_USER_ID`
- `PAYME_MERCHANT_ID`
- `PAYME_SECRET_KEY`
- `PAYME_TEST_SECRET`

#### Push

- `VAPID_PUBLIC_KEY`
- `VAPID_PRIVATE_KEY`
- `VAPID_EMAIL`
- `NEXT_PUBLIC_VAPID_PUBLIC_KEY`

#### Supabase storage

- `NEXT_PUBLIC_SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`

#### Analytics va boshqa sozlamalar

- `NEXT_PUBLIC_GA_ID`
- `LOW_STOCK_THRESHOLD`

### 3. Prisma

Schema yangilangan bo'lsa:

```bash
npm run db:push
```

Seed kerak bo'lsa:

```bash
npm run seed
```

### 4. Development server

```bash
npm run dev
```

## Muhim auth oqimlari

### User auth

- `NextAuth` orqali ishlaydi
- telefon + parol yoki Telegram OTP bilan login qiladi
- asosiy konfiguratsiya: `src/lib/auth.ts`

### Admin auth

- alohida `admin_auth` cookie va `x-admin-token` header modeli
- middleware: `src/middleware.ts`
- login route: `src/app/api/admin/login/route.ts`

### Telegram

- customer, driver va admin botlar alohida token bilan ishlaydi
- webhook route'lari:
  - `src/app/api/telegram/webhook/route.ts`
  - `src/app/api/telegram/webhook/driver/route.ts`
  - `src/app/api/telegram/webhook/admin/route.ts`

## Test va tekshiruv

Testlar hozircha asosan pure helper va route-adjacent mantiqqa qaratilgan.

Ishlatiladigan buyruqlar:

```bash
npm test
npm run test:coverage
```

## Hozirgi texnik ustuvorliklar

Repo ustida ishlaganda ayniqsa quyidagilarga ehtiyot bo'ling:

- `src/lib/telegram/adminBot.ts` — katta runtime modul
- `src/app/api/admin/recycling/*` — regression xavfi baland backend sirt
- `src/app/api/admin/reports/route.ts` — yirik agregatsiya va KPI logikasi
- `src/app/api/admin/recycling/journal/route.ts` — jurnal jamlash logikasi
- `prisma/schema.prisma` — ko'p string statuslar va migration risklari

## Eslatma

Bu repo bir nechta biznes yo'nalishni bitta kod bazada olib yuradi. Katta
o'zgarishlarda quyidagi tartib tavsiya qilinadi:

1. avval test yoki hujjat qo'shish
2. keyin shared domain/helper extraction
3. eng oxirida runtime va schema refaktor
