/**
 * Product JSON maydonlari uchun type-safe utility funksiyalar.
 * SQLite JSON string larini parse/stringify qiladi.
 */

export interface ProductSpecification {
    key: string;
    value: string;
}

// ─── Parse funksiyalari ──────────────────────────────────────────────────────

/** gallery JSON string → string[] */
export function parseGallery(raw: string | null | undefined): string[] {
    if (!raw) return [];
    try { return JSON.parse(raw) as string[]; } catch { return []; }
}

/** specifications JSON string → ProductSpecification[] */
export function parseSpecifications(raw: string | null | undefined): ProductSpecification[] {
    if (!raw || raw === '{}') return [];
    try {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed as ProductSpecification[];
        // object formatini ham qo'llab-quvvatlash: { "Material": "Karton", ... }
        return Object.entries(parsed).map(([key, value]) => ({ key, value: String(value) }));
    } catch { return []; }
}

/** tags JSON string → string[] */
export function parseTags(raw: string | null | undefined): string[] {
    if (!raw) return [];
    try { return JSON.parse(raw) as string[]; } catch { return []; }
}

// ─── Stringify funksiyalari ──────────────────────────────────────────────────

/** string[] → gallery JSON string */
export function stringifyGallery(gallery: string[]): string {
    return JSON.stringify(gallery);
}

/** ProductSpecification[] yoki Record<string,string> → specifications JSON string */
export function stringifySpecifications(
    specs: ProductSpecification[] | Record<string, string>
): string {
    return JSON.stringify(specs);
}

/** string[] → tags JSON string */
export function stringifyTags(tags: string[]): string {
    return JSON.stringify(tags);
}

// ─── Product parse helper ────────────────────────────────────────────────────

/**
 * Prisma dan kelgan xom Product ni parse qilib,
 * gallery, specifications, tags ni array/object ga o'tkazadi.
 */
export function parseProduct<T extends {
    gallery?: string;
    specifications?: string;
    tags?: string;
}>(raw: T) {
    return {
        ...raw,
        gallery: parseGallery(raw.gallery),
        specifications: parseSpecifications(raw.specifications),
        tags: parseTags(raw.tags),
    };
}
