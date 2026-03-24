import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── POST /api/products/bulk-import — CSV/JSON orqali mahsulotlarni import qilish ───
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { products } = body;

        if (!Array.isArray(products) || products.length === 0) {
            return NextResponse.json({ error: "products massivi bo'sh" }, { status: 400 });
        }

        if (products.length > 500) {
            return NextResponse.json({ error: 'Maksimal 500 ta mahsulot bolishi mumkin' }, { status: 400 });
        }

        const results = { created: 0, updated: 0, errors: [] as { row: number; error: string }[] };

        for (let i = 0; i < products.length; i++) {
            const row = products[i];
            try {
                const { name, sku, price, originalPrice, categorySlug, description, image, status } = row;

                if (!name || !price) {
                    results.errors.push({ row: i + 1, error: 'name va price majburiy' });
                    continue;
                }

                // Find category name by slug
                let categoryName: string | undefined;
                if (categorySlug) {
                    const cat = await prisma.category.findFirst({ where: { slug: String(categorySlug) } });
                    if (cat) categoryName = cat.name;
                }

                // Upsert by SKU if provided, else create
                if (sku) {
                    const existing = await prisma.product.findFirst({ where: { sku: String(sku) } });
                    if (existing) {
                        await prisma.product.update({
                            where: { id: existing.id },
                            data: {
                                name:          String(name),
                                price:         Number(price),
                                originalPrice: originalPrice ? Number(originalPrice) : undefined,
                                description:   description   ? String(description)   : undefined,
                                image:         image         ? String(image)         : undefined,
                                status:        status        ? String(status)        : undefined,
                                category:      categoryName,
                            },
                        });
                        results.updated++;
                        continue;
                    }
                }

                await prisma.product.create({
                    data: {
                        name:          String(name),
                        sku:           sku           ? String(sku)           : undefined,
                        price:         Number(price),
                        originalPrice: originalPrice ? Number(originalPrice) : undefined,
                        description:   description   ? String(description)   : '',
                        image:         image         ? String(image)         : '/placeholder.png',
                        status:        status        ? String(status)        : 'active',
                        category:      categoryName,
                    },
                });
                results.created++;
            } catch (e: unknown) {
                const msg = e instanceof Error ? e.message : 'Noma\'lum xato';
                results.errors.push({ row: i + 1, error: msg });
            }
        }

        return NextResponse.json({
            success: true,
            created: results.created,
            updated: results.updated,
            errors: results.errors,
            total: products.length,
        });
    } catch (error) {
        console.error('[API/products/bulk-import]', error);
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

// ─── GET /api/products/bulk-import — Namunaviy CSV template yuklash ──────────
export async function GET() {
    const csv = [
        'name,sku,price,originalPrice,categorySlug,description,image,status',
        'Polietilen paket 30x40,PKT-001,1500,5000,polietilen-paketlar,30x40 sm polietilen paket,,active',
        'Kraft paket 20x30,KFT-002,2500,10000,kraft-paketlar,Kraft qogoz paket,,active',
    ].join('\n');

    return new Response(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': 'attachment; filename="products-template.csv"',
        },
    });
}
