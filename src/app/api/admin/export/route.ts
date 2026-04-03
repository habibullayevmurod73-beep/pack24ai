import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// ─── CSV Helper ──────────────────────────────────────────────────────────────
function toCSV(headers: string[], rows: string[][]): string {
    const escape = (v: string) => {
        if (v.includes(',') || v.includes('"') || v.includes('\n')) {
            return `"${v.replace(/"/g, '""')}"`;
        }
        return v;
    };
    const lines = [headers.map(escape).join(',')];
    for (const row of rows) {
        lines.push(row.map(escape).join(','));
    }
    return '\uFEFF' + lines.join('\r\n'); // BOM for Excel UTF-8
}

function csvResponse(csv: string, filename: string) {
    return new NextResponse(csv, {
        headers: {
            'Content-Type': 'text/csv; charset=utf-8',
            'Content-Disposition': `attachment; filename="${filename}"`,
        },
    });
}

// ─── GET /api/admin/export?type=orders&period=30 ─────────────────────────────
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const type   = searchParams.get('type') ?? 'orders';
        const period = parseInt(searchParams.get('period') ?? '30');
        const from   = new Date();
        from.setDate(from.getDate() - period);

        const now = new Date().toISOString().slice(0, 10);

        switch (type) {
            // ═════════════════════════════════════════════════════════════
            case 'orders': {
                const orders = await prisma.order.findMany({
                    where: { createdAt: { gte: from } },
                    include: { items: { include: { product: { select: { name: true } } } } },
                    orderBy: { createdAt: 'desc' },
                });

                const headers = [
                    'ID', 'Mijoz', 'Telefon', 'Status', 'Summa',
                    'To\'lov usuli', 'Yetkazish', 'Manzil', 'Izoh',
                    'Mahsulotlar', 'Sana'
                ];

                const rows = orders.map(o => [
                    String(o.id),
                    o.customerName ?? '',
                    o.contactPhone ?? '',
                    o.status,
                    String(o.totalAmount),
                    o.paymentMethod ?? '',
                    o.deliveryMethod ?? '',
                    o.shippingAddress ?? '',
                    o.comment ?? '',
                    o.items.map(i => `${i.product.name} x${i.quantity}`).join('; '),
                    o.createdAt.toISOString().slice(0, 19).replace('T', ' '),
                ]);

                return csvResponse(toCSV(headers, rows), `orders_${now}.csv`);
            }

            // ═════════════════════════════════════════════════════════════
            case 'products': {
                const products = await prisma.product.findMany({
                    orderBy: { id: 'asc' },
                    select: {
                        id: true, name: true, sku: true, category: true,
                        price: true, originalPrice: true, inStock: true,
                        rating: true, reviews: true, status: true,
                        createdAt: true,
                    },
                });

                const headers = [
                    'ID', 'Nomi', 'SKU', 'Kategoriya', 'Narx',
                    'Asl narx', 'Mavjud', 'Reyting', 'Sharhlar',
                    'Status', 'Yaratilgan'
                ];

                const rows = products.map(p => [
                    String(p.id),
                    p.name,
                    p.sku ?? '',
                    p.category ?? '',
                    String(p.price),
                    String(p.originalPrice ?? ''),
                    p.inStock ? 'Ha' : 'Yo\'q',
                    String(p.rating),
                    String(p.reviews),
                    p.status,
                    p.createdAt.toISOString().slice(0, 10),
                ]);

                return csvResponse(toCSV(headers, rows), `products_${now}.csv`);
            }

            // ═════════════════════════════════════════════════════════════
            case 'customers': {
                const customers = await prisma.user.findMany({
                    where: { role: 'user' },
                    orderBy: { createdAt: 'desc' },
                    select: {
                        id: true, name: true, email: true, phone: true,
                        customerType: true, customerGroup: true,
                        companyName: true, address: true,
                        isActive: true, createdAt: true,
                    },
                });

                const headers = [
                    'ID', 'Ism', 'Email', 'Telefon', 'Turi',
                    'Guruh', 'Kompaniya', 'Manzil', 'Faol', 'Ro\'yxatdan o\'tgan'
                ];

                const rows = customers.map(c => [
                    String(c.id),
                    c.name,
                    c.email ?? '',
                    c.phone,
                    c.customerType,
                    c.customerGroup,
                    c.companyName ?? '',
                    c.address ?? '',
                    c.isActive ? 'Ha' : 'Yo\'q',
                    c.createdAt.toISOString().slice(0, 10),
                ]);

                return csvResponse(toCSV(headers, rows), `customers_${now}.csv`);
            }

            // ═════════════════════════════════════════════════════════════
            case 'recycling': {
                const requests = await prisma.recycleRequest.findMany({
                    orderBy: { createdAt: 'desc' },
                    include: { point: true },
                });

                const headers = [
                    'ID', 'Ism', 'Telefon', 'Viloyat', 'Material',
                    'Hajm (kg)', 'Usul', 'Status', 'Sana'
                ];

                const rows = requests.map(r => [
                    String(r.id),
                    r.name,
                    r.phone,
                    r.point?.regionUz ?? String(r.regionId),
                    r.material ?? '',
                    String(r.volume ?? ''),
                    r.pickupType === 'pickup' ? 'Kuryer' : 'Baza',
                    r.status,
                    r.createdAt.toISOString().slice(0, 19).replace('T', ' '),
                ]);

                return csvResponse(toCSV(headers, rows), `recycling_${now}.csv`);
            }

            default:
                return NextResponse.json(
                    { error: `Noma'lum type: ${type}. Foydalaning: orders, products, customers, recycling` },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('[API/admin/export]', error);
        return NextResponse.json({ error: 'Export xatosi' }, { status: 500 });
    }
}
