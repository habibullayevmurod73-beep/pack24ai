import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const category = searchParams.get('category');
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const where: any = {};

        if (category && category !== 'all') {
            where.category = category;
        }

        if (status && status !== 'all') {
            where.status = status;
        }

        if (search) {
            where.name = {
                contains: search
            };
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' }
        });

        // Parse gallery JSON string back to array if needed
        const parsedProducts = products.map((p: any) => ({
            ...p,
            gallery: p.gallery ? JSON.parse(p.gallery) : []
        }));

        return NextResponse.json(parsedProducts);
    } catch (error) {
        console.error('Error fetching products:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request) {
    try {
        const body = await request.json();

        const gallery = body.gallery ? JSON.stringify(body.gallery) : "[]";

        const newProduct = await prisma.product.create({
            data: {
                name: body.name,
                description: body.description || '',
                price: parseFloat(body.price),
                originalPrice: body.originalPrice ? parseFloat(body.originalPrice) : null,
                sku: body.sku,
                category: body.category,
                image: body.image,
                gallery: gallery,
                status: body.status || 'draft',
                inStock: body.inStock !== false,
            }
        });

        return NextResponse.json(newProduct);
    } catch (error) {
        console.error('Error creating product:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
