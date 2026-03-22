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

        const data: any = { ...body };
        if (body.gallery) {
            data.gallery = JSON.stringify(body.gallery);
        }
        if (body.price) data.price = parseFloat(body.price);

        const updatedProduct = await prisma.product.update({
            where: { id: parseInt(id) },
            data
        });

        return NextResponse.json(updatedProduct);
    } catch (error) {
        console.error('Error updating product:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
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
