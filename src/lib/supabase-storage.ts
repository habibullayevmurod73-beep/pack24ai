/**
 * Supabase Storage — fayl va URL yuklash yordamchi moduli
 *
 * ENV o'zgaruvchilari (.env):
 *   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
 *   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
 *   SUPABASE_STORAGE_BUCKET=products   (default: "products")
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? '';
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
const BUCKET       = process.env.SUPABASE_STORAGE_BUCKET ?? 'products';

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.warn(
    '[supabase-storage] NEXT_PUBLIC_SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY .env da topilmadi!'
  );
}

/**
 * Buffer ni Supabase Storage ga yuklaydi va public URL qaytaradi.
 */
export async function uploadBufferToSupabase(
  buffer: Buffer,
  filename: string,
  mimeType: string
): Promise<string> {
  const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${filename}`;

  const res = await fetch(uploadUrl, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${SERVICE_KEY}`,
      'Content-Type': mimeType,
      'x-upsert': 'true',    // mavjud bo'lsa ustidan yozadi
    },
    body: new Uint8Array(buffer),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Supabase Storage yuklash xatosi: ${res.status} — ${errText}`);
  }

  // Public URL
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${filename}`;
}
