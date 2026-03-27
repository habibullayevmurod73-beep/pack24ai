import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import { uploadBufferToSupabase } from '@/lib/supabase-storage';

/**
 * POST /api/upload/file
 * multipart/form-data: field "file"
 * Qaytaradi: { success: true, url: "https://..." }
 */
export async function POST(request: Request) {
    try {
        const data = await request.formData();
        const file = data.get('file') as File | null;

        if (!file) {
            return NextResponse.json({ error: 'Fayl yuklanmadi' }, { status: 400 });
        }

        const maxSize = file.type.startsWith('video/') ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: `Fayl hajmi oshib ketdi (max ${maxSize / 1024 / 1024} MB)` },
                { status: 413 }
            );
        }

        const extension = path.extname(file.name) || (file.type.startsWith('video/') ? '.mp4' : '.jpg');
        const filename = `${uuidv4()}${extension}`;

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const publicUrl = await uploadBufferToSupabase(buffer, filename, file.type || 'application/octet-stream');

        return NextResponse.json({ success: true, url: publicUrl });

    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Server xatosi';
        console.error('[upload/file]', message);
        return NextResponse.json({ error: message }, { status: 500 });
    }
}
