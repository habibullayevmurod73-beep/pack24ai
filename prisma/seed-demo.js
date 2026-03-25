/**
 * Demo mahsulotlarni to'g'ridan-to'g'ri Prisma Client orqali qo'shadi.
 * Ishga tushirish: node --require ts-node/register /tmp/seed-run.ts
 * yoki: npx tsx prisma/seed-demo.ts
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const DEMO = [
  { name:'Karton quti 300×200×150 mm (T-23)', price:4500, sku:'GK-300x200x150', category:'karton-qutilar', image:'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg', isFeatured:true },
  { name:'Karton quti 400×300×200 mm (T-23)', price:6800, sku:'GK-400x300x200', category:'karton-qutilar', image:'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg' },
  { name:'Kuryer paketi A4 (300×400 mm) — 50 dona', price:22000, sku:'KP-A4-50', category:'kuryer-paketlari', image:'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured:true },
  { name:'Kuryer paketi A5 (250×350 mm) — 100 dona', price:35000, sku:'KP-A5-100', category:'kuryer-paketlari', image:'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg' },
  { name:'BOPP paket klapan+skotch 100×150 mm', price:18000, sku:'BOPP-KS-100x150', category:'bopp-paketlar', image:'https://pack24.ru/upload/iblock/ae2/stretch.jpg', isFeatured:true },
  { name:'Stretch plyonka 500mm×200m (17mkm)', price:42000, sku:'SP-500x200-17', category:'streich-plyonka', image:'https://pack24.ru/upload/iblock/ae2/stretch.jpg', isFeatured:true },
  { name:"Stretch plyonka qo'l uchun 500mm×100m", price:24000, sku:'SP-HAND-500x100', category:'streich-plyonka', image:'https://pack24.ru/upload/iblock/ae2/stretch.jpg' },
  { name:'Skotch OPP shaffof 48mm×66m (36 rulon)', price:85000, sku:'LL-OPP-48x66-36', category:'skotch-yelim-lenta', image:'https://pack24.ru/upload/iblock/cc4/scotch.jpg', isFeatured:true, originalPrice:95000 },
  { name:'Havo-pufakli plyonka 0.6m×50m (d10)', price:78000, sku:'HPP-0.6x50-D10', category:'pufakchali-plyonka', image:'https://pack24.ru/upload/iblock/7f3/bubblewrap.jpg', isFeatured:true },
  { name:"Kraft qog'oz sumka 24×11×30sm — 100 dona", price:62000, sku:'QS-KRAFT-24x11x30', category:'kraft-paketlar', image:'https://pack24.ru/upload/iblock/b2d/kraft_bag.jpg', isFeatured:true },
  { name:"Ko'pikli polietilen 3mm×1m×50m", price:68000, sku:'KPL-3mm-1x50', category:'kopikli-polietilen', image:'https://pack24.ru/upload/iblock/aa5/foam.jpg', isFeatured:true },
  { name:"Kraft qog'oz rulon 70gr/m² 1m×50m", price:89000, sku:'KR-70-1x50', category:'qadoqlash-qogozi', image:'https://pack24.ru/upload/iblock/9c1/crepe.jpg', isFeatured:true },
  { name:'PP lenta 16mm×1000m (PP tasma)', price:38000, sku:'PPT-16x1000', category:'pp-lenta', image:'https://pack24.ru/upload/iblock/f0c/tape.jpg', isFeatured:true },
  { name:'Penoplast burchak 30×30×1000mm — 50 dona', price:27000, sku:'PQ-30x30x1000-50', category:'himoya-profili', image:'https://pack24.ru/upload/iblock/e4b/corner.jpg', isFeatured:true },
  { name:'Polietilen paket futbolka 30×50 — 100 dona', price:8900, sku:'PP-FUTBOLKA-30x50', category:'polietilen-paketlar', image:'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured:true },
  { name:'Zip-lock paket shaffof 150×200 — 100 dona', price:15000, sku:'PP-ZIPLOCK-150x200', category:'zip-lock-paketlar', image:'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured:true },
  { name:'Gofrokarton T-23 1200×800mm — 10 dona', price:35000, sku:'GK-SHEET-1200x800', category:'gofrokarton', image:'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg', isFeatured:true },
  { name:'Termo etiketka 58×40mm ECO — 1000 dona', price:25000, sku:'TE-58x40-ECO-1000', category:'termoetiketkalar', image:'https://pack24.ru/upload/iblock/f0c/tape.jpg', isFeatured:true },
  { name:'Gofroqorti quti 500×350×250mm', price:9200, sku:'GK-500x350x250', category:'gofrokoroblar', image:'https://pack24.ru/upload/iblock/5a9/jk0pmv7jwkrqmm0gojuwbx5ubs0aoi4e.jpg', isFeatured:true },
  { name:'Chiqindi paketi qora 120L — 10 dona', price:12000, sku:'CP-BLACK-120L-10', category:'chiqindi-paketlari', image:'https://pack24.ru/upload/iblock/f1e/7e3h6j1i9xcn5f4q0y2w8r3t.jpg', isFeatured:true },
];

async function main() {
  let added = 0, skipped = 0;
  for (const p of DEMO) {
    const exists = await prisma.product.findFirst({ where: { sku: p.sku } });
    if (exists) { skipped++; continue; }
    await prisma.product.create({
      data: {
        name: p.name, description: '', price: p.price,
        originalPrice: p.originalPrice ?? null,
        sku: p.sku, category: p.category, image: p.image,
        gallery: [], specifications: {}, tags: [],
        inStock: true, status: 'active', rating: 0, reviews: 0,
        isFeatured: p.isFeatured ?? false,
      },
    });
    console.log('✅', p.name);
    added++;
  }
  console.log(`\n🎉 ${added} ta qo'shildi, ${skipped} ta o'tkazildi.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
