import { NextResponse } from 'next/server';
import path from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Determine extension
        const originalName = file.name;
        const extension = path.extname(originalName) || '.jpg';

        const filename = `${uuidv4()}${extension}`;
        const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'products');

        // Ensure directory exists
        await mkdir(uploadDir, { recursive: true });

        const filepath = path.join(uploadDir, filename);
        await writeFile(filepath, buffer);

        const publicUrl = `/uploads/products/${filename}`;

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error: any) {
        console.error('File upload error:', error);
        return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
    }
}
