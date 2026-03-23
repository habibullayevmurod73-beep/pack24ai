import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { parseProduct, stringifyGallery, stringifySpecifications, stringifyTags } from '@/lib/product-utils';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) },
        });
        if (!product) return NextResponse.json({ error: 'Not Found' }, { status: 404 });
        return NextResponse.json(parseProduct(product));
    } catch {
        return NextResponse.json({ error: 'Server xatosi' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        const data: Record<string, unknown> = {};

        // Skalyar maydonlar
        const scalarFields = [
            'name', 'description', 'price', 'originalPrice',
            'sku', 'category', 'image', 'inStock', 'status',
            'sourceUrl', 'minQuantity', 'rating', 'reviews',
        ] as const;

        for (const key of scalarFields) {
            if (key in body) data[key] = body[key];
        }

        // Raqam konvertatsiyasi
        if (data.price       !== undefined) data.price        = parseFloat(String(data.price));
        if (data.originalPrice !== undefined && data.originalPrice !== null)
                                             data.originalPrice = parseFloat(String(data.originalPrice));
        if (data.minQuantity !== undefined)  data.minQuantity  = parseInt(String(data.minQuantity));

        // JSON maydonlar — stringify
        if ('gallery'        in body) data.gallery        = stringifyGallery(Array.isArray(body.gallery) ? body.gallery : []);
        if ('specifications' in body) data.specifications  = stringifySpecifications(body.specifications ?? {});
        if ('tags'           in body) data.tags            = stringifyTags(Array.isArray(body.tags) ? body.tags : []);

        const updated = await prisma.product.update({
            where: { id: parseInt(id) },
            data,
        });

        return NextResponse.json(parseProduct(updated));
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('[PUT /api/products/id]', msg);
        return NextResponse.json({ error: 'Server xatosi: ' + msg }, { status: 500 });
    }
}

export async function DELETE(
    _request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.product.delete({ where: { id: parseInt(id) } });
        return NextResponse.json({ ok: true });
    } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        return NextResponse.json({ error: 'Server xatosi: ' + msg }, { status: 500 });
    }
}
