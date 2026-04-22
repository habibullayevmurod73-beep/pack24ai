# Schema tightening reja

## Maqsad

`prisma/schema.prisma` ichidagi biznes uchun muhim string maydonlarni bir zumda
emas, migration-safe yo'l bilan qat'iylashtirish.

Bu hujjatning vazifasi:

- status maydonlarini prioritetlash
- typed source-of-truth qatlamini tayyorlash
- keyingi Prisma enum yoki DB constraint migratsiyasiga zamin yaratish

## 1. Birinchi navbatda ko'riladigan maydonlar

### Recycling

- `RecycleRequest.status`
- `RecycleCollection.paymentStatus`
- `Driver.status`
- `RecycleComplaint.status`

### Commerce

- `Order.status`
- `Order.paymentStatus`

### Qo'shimcha

- `RecycleRequest.pickupType`
- `RecycleRequest.pickupLocationMode`
- `Campaign.status`
- `Campaign.type`

## 2. Hozirgi muammo

Ko'p qiymatlar comment yoki UI convention bilan boshqarilyapti, lekin DB
darajasida enforce qilinmagan. Natijada:

- typo paydo bo'lishi mumkin
- analytics notekis bo'lishi mumkin
- har xil route va botlar turlicha string ishlatishi mumkin
- migration paytida qaysi qiymatlar haqiqiy ishlatilayotgani aniqlanmasligi mumkin

## 3. Tavsiya etilgan bosqichlar

### Bosqich A — kod qatlamida typed source-of-truth

Avval TypeScript tarafida:

- literal union type
- readonly status array
- transition map
- label map

joriy qilinadi.

Bu qatlam `src/lib/domain/*` ostida yashashi kerak.

### Bosqich B — runtime validatsiya

Keyin route va botlar yangi qiymatni qabul qilishdan oldin shu typed
manbadan foydalanadi:

- request transition tekshiruvi
- payment status validatsiyasi
- filter parametrlari uchun allow-list

### Bosqich C — real ma'lumotlarni audit qilish

DB bo'yicha oldindan audit kerak:

- qaysi status qiymatlar haqiqatda ishlatilgan
- noto'g'ri yoki eski qiymatlar bormi
- null yoki legacy yozuvlar bormi

### Bosqich D — Prisma enum yoki DB constraint

Faqat audit va kod qatlamlari tayyor bo'lgach:

- Prisma enum
- yoki check constraint

variantlaridan biri tanlanadi.

## 4. Nomlash muammolari

### `RecycleRequest.regionId`

Bu maydon amalda `RecyclePoint.id` ga ishora qiladi. Nom esa `regionId`
bo'lgani uchun chalg'itadi.

Tavsiya etilgan yondashuv:

1. kod qatlamida `pointId` ma'nosini docs va helperlarda aniq ko'rsatish
2. API va UI typed model'larda semantic alias kiritish
3. keyin migration bilan rename qilish

## 5. Migration-safe qoidalar

- birdan barcha statuslarni enum'ga o'tkazmaslik
- avval route va botlarni typed source-of-truth bilan birlashtirish
- keyin ma'lumot audit qilish
- faqat undan keyin schema migratsiya qilish

## 6. Qabul mezoni

Quyidagilar bajarilgach schema tightening bosqichi tayyor deb hisoblanadi:

- muhim statuslar uchun typed source-of-truth mavjud
- route va botlarning asosiy qismi shu manbadan foydalanadi
- legacy qiymatlar ro'yxati tayyor
- enum yoki constraint migratsiyasi uchun risklar hujjatlashtirilgan
