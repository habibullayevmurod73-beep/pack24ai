/**
 * Pack24 UZ — Real mahsulotlar seed skripti
 * Ishga tushirish: npx ts-node prisma/seed-products.ts
 * yoki: node -r ts-node/register prisma/seed-products.ts
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const PRODUCTS = [
    // ── Gofroqorti ───────────────────────────────────────────────────────────
    {
        name: 'Gofroqorti 300x200x150 mm (T-23)',
        description: 'Ikki qavatli gofroqorti. Elektron tijorat uchun ideal. O\'ta mustahkam va engil.',
        price: 4500,
        category: 'Gofroqorti',
        image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg',
        sku: 'GK-300x200x150',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Gofroqorti 400x300x200 mm (T-23)',
        description: 'O\'rta o\'lchamdagi mahsulotlar uchun. Marketpleyslarga mos.',
        price: 6800,
        category: 'Gofroqorti',
        image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg',
        sku: 'GK-400x300x200',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Gofroqorti 600x400x400 mm (T-24)',
        description: 'Katta o\'lchamli mahsulotlar uchun. Yuk tashishda keng qo\'llaniladi.',
        price: 12500,
        category: 'Gofroqorti',
        image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg',
        sku: 'GK-600x400x400',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Gofroqorti 200x150x100 mm — mini (T-23)',
        description: 'Kichik mahsulotlar va sovg\'alar uchun. Elektronika qadoqlashga mos.',
        price: 2800,
        category: 'Gofroqorti',
        image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg',
        sku: 'GK-200x150x100',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Gofroqorti 500x350x250 mm (T-23)',
        description: 'Universal o\'lcham. Oziq-ovqat va sanoat mahsulotlari uchun.',
        price: 9200,
        category: 'Gofroqorti',
        image: 'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg',
        sku: 'GK-500x350x250',
        inStock: true,
        status: 'active',
    },

    // ── Polietilen paket ──────────────────────────────────────────────────────
    {
        name: 'Polietilen paket "Futbolka" 30x50 (100 dona)',
        description: 'Klassik futbolka shaklidagi paket. Do\'konlar va savdo nuqtalari uchun.',
        price: 8900,
        category: 'Polietilen paketlar',
        image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg',
        sku: 'PP-FUTBOLKA-30x50',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Polietilen zip-lock paket 150x200 (100 dona)',
        description: 'Qayta yopish imkoniyatli paket. Oziq-ovqat va mayda buyumlar uchun.',
        price: 15000,
        category: 'Polietilen paketlar',
        image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg',
        sku: 'PP-ZIPLOCK-150x200',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Polietilen paket "Majburiy" 40x60 (50 dona)',
        description: 'Yo\'l-yo\'l stripli mustahkam paket. Katta hajmli tovarlar uchun.',
        price: 11500,
        category: 'Polietilen paketlar',
        image: 'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg',
        sku: 'PP-MAJBURIY-40x60',
        inStock: true,
        status: 'active',
    },

    // ── Stretch-plyonka ───────────────────────────────────────────────────────
    {
        name: 'Stretch plyonka 500 mm × 200 m (17 mkm)',
        description: 'Yuk o\'rashga mo\'ljallangan. Katta rulonlarda. Omborxonalar uchun.',
        price: 42000,
        category: 'Stretch plyonka',
        image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg',
        sku: 'SP-500x200-17',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Stretch plyonka qo\'l uchun 500 mm × 100 m (20 mkm)',
        description: 'Qo\'l bilan ishlatishga qulay. Ofislar va kichik omborlar uchun ideal.',
        price: 24000,
        category: 'Stretch plyonka',
        image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg',
        sku: 'SP-HAND-500x100',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Stretch plyonka qora 500 mm × 200 m',
        description: 'Qora rangdagi stretch plyonka. Maxfiylik va UV himoya uchun.',
        price: 48000,
        category: 'Stretch plyonka',
        image: 'https://pack24.ru/upload/iblock/ae2/stretch.jpg',
        sku: 'SP-BLACK-500x200',
        inStock: true,
        status: 'active',
    },

    // ── Lipa lenta ───────────────────────────────────────────────────────────
    {
        name: 'Skotch OPP shaffof 48mm × 66m (36 rulon)',
        description: 'Eng mashhur qadoqlash lentasi. Katta quti uchun qulay.',
        price: 85000,
        originalPrice: 95000,
        category: 'Lipa lenta',
        image: 'https://pack24.ru/upload/iblock/cc4/scotch.jpg',
        sku: 'LL-OPP-48x66-36',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Skotch OPP jigarrang 48mm × 66m (6 rulon)',
        description: 'Jigarrang rangli. Yuk paketlarsiz qo\'shimcha himoya uchun.',
        price: 18000,
        category: 'Lipa lenta',
        image: 'https://pack24.ru/upload/iblock/cc4/scotch.jpg',
        sku: 'LL-OPP-BROWN-48x66',
        inStock: true,
        status: 'active',
    },

    // ── Havo-pufakli plyonka ──────────────────────────────────────────────────
    {
        name: 'Havo-pufakli plyonka 0,6 m × 50 m (d10)',
        description: 'Nozik buyumlarni himoya qilish uchun. Shisha, keramika, elektronika uchun.',
        price: 78000,
        category: 'Havo-pufakli plyonka',
        image: 'https://pack24.ru/upload/iblock/7f3/bubblewrap.jpg',
        sku: 'HPP-0.6x50-D10',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Havo-pufakli plyonka 1,2 m × 50 m (d10)',
        description: 'Keng rulon. Mebel va katta buyumlarni qadoqlash uchun.',
        price: 145000,
        category: 'Havo-pufakli plyonka',
        image: 'https://pack24.ru/upload/iblock/7f3/bubblewrap.jpg',
        sku: 'HPP-1.2x50-D10',
        inStock: true,
        status: 'active',
    },

    // ── Qog'oz sumkalar ───────────────────────────────────────────────────────
    {
        name: 'Qog\'oz sumka kraft 24×11×30 sm (100 dona)',
        description: 'Ekologik toza kraft qog\'ozdan. Butik va kafe uchun mos.',
        price: 62000,
        category: 'Qog\'oz sumkalar',
        image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg',
        sku: 'QS-KRAFT-24x11x30',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Qog\'oz sumka oq 26×13×32 sm (50 dona)',
        description: 'Oq rangli, brendlash uchun qulay. Bosma qo\'yish mumkin.',
        price: 38000,
        category: 'Qog\'oz sumkalar',
        image: 'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg',
        sku: 'QS-WHITE-26x13x32',
        inStock: true,
        status: 'active',
    },

    // ── Qog'oz lenta ──────────────────────────────────────────────────────────
    {
        name: 'Qog\'oz lenta (Kraft) 50mm × 50m (6 dona)',
        description: 'Ekologik kraft qog\'oz lenta. Yashil qadoqlash uchun.',
        price: 34000,
        category: 'Lipa lenta',
        image: 'https://pack24.ru/upload/iblock/cc4/scotch.jpg',
        sku: 'QL-KRAFT-50x50',
        inStock: true,
        status: 'active',
    },

    // ── Makarolli lenta ───────────────────────────────────────────────────────
    {
        name: 'Flyuzelin qoplab 60 gr/m² 1,6 × 50 m — oq',
        description: 'Yopishmaydigan, yengil qadoqlash materyali. Mebel uchun mos.',
        price: 52000,
        category: 'Flyuzelin',
        image: 'https://pack24.ru/upload/iblock/d3a/spunbond.jpg',
        sku: 'FL-60-1.6x50-WHITE',
        inStock: true,
        status: 'active',
    },

    // ── Pénoplast qo'riqchi ───────────────────────────────────────────────────
    {
        name: 'Penoplast qo\'riqchi burchak 30×30×1000 mm (50 dona)',
        description: 'Burchaklarni zarba va sinikrishdan himoya qiladi. Yuk tashishda zarur.',
        price: 27000,
        category: 'Qo\'riqchi qirralar',
        image: 'https://pack24.ru/upload/iblock/e4b/corner.jpg',
        sku: 'PQ-30x30x1000-50',
        inStock: true,
        status: 'active',
    },

    // ── Qadoqlash tasmasi ─────────────────────────────────────────────────────
    {
        name: 'PP lenta 16mm × 1000m (PP tasma)',
        description: 'Muhim yuklarni bog\'lash uchun. Paletlash va fasonlash uchun.',
        price: 38000,
        category: 'Tasma',
        image: 'https://pack24.ru/upload/iblock/f0c/tape.jpg',
        sku: 'PPT-16x1000',
        inStock: true,
        status: 'active',
    },

    // ── Qog'oz parcha ─────────────────────────────────────────────────────────
    {
        name: 'Krep qog\'oz to\'q sariq 50 sm × 2,5 m',
        description: 'Bezak va gift qadoqlash uchun. Nozik va estetik ko\'rinish.',
        price: 5500,
        category: 'Qog\'oz va karton',
        image: 'https://pack24.ru/upload/iblock/9c1/crepe.jpg',
        sku: 'KQ-YELLOW-50x250',
        inStock: true,
        status: 'active',
    },
    {
        name: 'Kraft qog\'oz rulon 70 gr/m² 1 m × 50 m',
        description: 'Keng rulon. Mebel va katta mahsulotlarni qadoqlash uchun.',
        price: 89000,
        category: 'Qog\'oz va karton',
        image: 'https://pack24.ru/upload/iblock/9c1/crepe.jpg',
        sku: 'KR-70-1x50',
        inStock: true,
        status: 'active',
    },

    // ── Ko'pikli polyetilen ───────────────────────────────────────────────────
    {
        name: 'Ko\'pikli polyetilen 3 mm × 1 m × 50 m',
        description: 'Nozik sirt himoyasi uchun. Mebel, shisha va elektronika qadoqlashda.',
        price: 68000,
        category: 'Ko\'pikli plyonka',
        image: 'https://pack24.ru/upload/iblock/aa5/foam.jpg',
        sku: 'KPL-3mm-1x50',
        inStock: true,
        status: 'active',
    },
];

async function main() {
    console.log('🌱 Mahsulotlarni DB ga qo\'shish boshlandi...');
    let added = 0;
    let skipped = 0;

    for (const product of PRODUCTS) {
        // Tekshirish — sku bo'yicha mavjud bo'lsa o'tkazib yuborish
        const existing = await prisma.product.findFirst({
            where: { sku: product.sku },
        });

        if (existing) {
            console.log(`  ⏭️  O'tkazib yuborildi (mavjud): ${product.name}`);
            skipped++;
            continue;
        }

        await prisma.product.create({
            data: {
                name: product.name,
                description: product.description ?? '',
                price: product.price,
                originalPrice: (product as any).originalPrice ?? null,
                category: product.category,
                image: product.image,
                sku: product.sku,
                inStock: product.inStock,
                status: product.status,
                gallery: '[]',
                rating: 0,
                reviews: 0,
            },
        });

        console.log(`  ✅ Qo\'shildi: ${product.name}`);
        added++;
    }

    console.log(`\n🎉 Tugadi! ${added} ta qo\'shildi, ${skipped} ta o\'tkazib yuborildi.`);
}

main()
    .catch((e) => {
        console.error('❌ Xato:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
