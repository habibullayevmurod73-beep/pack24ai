import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const product = await prisma.product.findUnique({
            where: { id: parseInt(id) }
        });

        if (!product) {
            return NextResponse.json({ error: 'Not Found' }, { status: 404 });
        }

        return NextResponse.json({
            ...product,
            gallery: product.gallery ? JSON.parse(product.gallery) : []
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const body = await request.json();

        // Only pass fields that exist in the Prisma Product schema
        // Omit client-only fields like 'specifications', 'rating', 'reviews', etc.
        const allowedFields = ['name', 'description', 'price', 'originalPrice', 'sku', 'category', 'image', 'gallery', 'inStock', 'status', 'sourceUrl'];

        const data: Record<string, unknown> = {};
        for (const key of allowedFields) {
            if (key in body) {
                data[key] = body[key];
            }
        }

        if (data.gallery) {
            data.gallery = JSON.stringify(data.gallery);
        }
        if (data.price !== undefined) {
            data.price = parseFloat(String(data.price));
        }
        if (data.originalPrice !== undefined && data.originalPrice !== null) {
            data.originalPrice = parseFloat(String(data.originalPrice));
        }

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data
        });

        return NextResponse.json(updatedProduct);
    } catch (error: unknown) {
        const msg = error instanceof Error ? error.message : String(error);
        console.error('Error updating product:', msg);
        return NextResponse.json({ error: 'Server xatosi: ' + msg }, { status: 500 });
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        await prisma.product.delete({
            where: { id: parseInt(id) }
        });

        return NextResponse.json({ ok: true });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
