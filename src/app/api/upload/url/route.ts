import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json();

        if (!url) {
            return NextResponse.json({ error: 'URL is required' }, { status: 400 });
        }

        // Fetch the image with browser-like headers
        const response = await fetch(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                'Accept': 'image/webp,image/apng,image/*,*/*;q=0.8',
                'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
                'Referer': 'https://pack24.ru/',
            },
        });
        if (!response.ok) {
            return NextResponse.json({ error: `Failed to fetch image: ${response.statusText}` }, { status: 422 });
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.startsWith('image/')) {
            return NextResponse.json({ error: 'URL does not point to a valid image' }, { status: 400 });
        }

        // Determine extension
        let extension = '.jpg';
        if (contentType.includes('png')) extension = '.png';
        if (contentType.includes('webp')) extension = '.webp';
        if (contentType.includes('gif')) extension = '.gif';
        if (contentType.includes('jpeg')) extension = '.jpg';

        const buffer = Buffer.from(await response.arrayBuffer());
        const filename = `${uuidv4()}${extension}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');

        // Ensure directory exists
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        const filepath = path.join(uploadDir, filename);
        fs.writeFileSync(filepath, buffer);

        const publicUrl = `/uploads/products/${filename}`;

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error: any) {
        console.error('Image upload error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
