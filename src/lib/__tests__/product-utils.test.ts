import {
    parseGallery,
    parseSpecifications,
    parseTags,
    parseProduct,
} from '../product-utils';

describe('parseGallery', () => {
    it('returns empty array for null', () => {
        expect(parseGallery(null)).toEqual([]);
    });

    it('returns empty array for undefined', () => {
        expect(parseGallery(undefined)).toEqual([]);
    });

    it('returns empty array for empty string', () => {
        expect(parseGallery('')).toEqual([]);
    });

    it('returns empty array for non-array value', () => {
        expect(parseGallery({ a: 1 })).toEqual([]);
        expect(parseGallery(42)).toEqual([]);
    });

    it('returns array as-is when valid', () => {
        const urls = ['/img/1.jpg', '/img/2.jpg'];
        expect(parseGallery(urls)).toEqual(urls);
    });

    it('handles empty array', () => {
        expect(parseGallery([])).toEqual([]);
    });
});

describe('parseSpecifications', () => {
    it('returns empty array for null', () => {
        expect(parseSpecifications(null)).toEqual([]);
    });

    it('returns empty array for undefined', () => {
        expect(parseSpecifications(undefined)).toEqual([]);
    });

    it('returns array of {key, value} when input is array', () => {
        const specs = [{ key: 'Weight', value: '500g' }];
        expect(parseSpecifications(specs)).toEqual(specs);
    });

    it('converts Record<string, string> to array', () => {
        const record = { Weight: '500g', Color: 'Brown' };
        const result = parseSpecifications(record);
        expect(result).toEqual([
            { key: 'Weight', value: '500g' },
            { key: 'Color', value: 'Brown' },
        ]);
    });

    it('converts non-string values to string via String()', () => {
        const record = { count: 42, active: true };
        const result = parseSpecifications(record);
        expect(result).toEqual([
            { key: 'count', value: '42' },
            { key: 'active', value: 'true' },
        ]);
    });

    it('returns empty array for non-object values', () => {
        expect(parseSpecifications(42)).toEqual([]);
        expect(parseSpecifications('string')).toEqual([]);
    });
});

describe('parseTags', () => {
    it('returns empty array for null/undefined', () => {
        expect(parseTags(null)).toEqual([]);
        expect(parseTags(undefined)).toEqual([]);
    });

    it('returns array as-is', () => {
        expect(parseTags(['eco', 'box'])).toEqual(['eco', 'box']);
    });

    it('returns empty for non-array', () => {
        expect(parseTags('not-array')).toEqual([]);
    });
});

describe('parseProduct', () => {
    it('parses all JSON fields', () => {
        const raw = {
            id: 1,
            name: 'Test Box',
            gallery: ['/img/1.jpg'],
            specifications: { Size: 'Large' },
            tags: ['eco'],
        };

        const result = parseProduct(raw);

        expect(result.id).toBe(1);
        expect(result.name).toBe('Test Box');
        expect(result.gallery).toEqual(['/img/1.jpg']);
        expect(result.specifications).toEqual([{ key: 'Size', value: 'Large' }]);
        expect(result.tags).toEqual(['eco']);
    });

    it('handles missing optional fields', () => {
        const raw = { id: 2, name: 'Minimal' };
        const result = parseProduct(raw);

        expect(result.gallery).toEqual([]);
        expect(result.specifications).toEqual([]);
        expect(result.tags).toEqual([]);
    });

    it('preserves all other properties', () => {
        const raw = {
            id: 3,
            name: 'With extras',
            price: 15000,
            sku: 'BOX-001',
            gallery: null,
            specifications: null,
            tags: null,
        };

        const result = parseProduct(raw);

        expect(result.price).toBe(15000);
        expect(result.sku).toBe('BOX-001');
        expect(result.gallery).toEqual([]);
    });
});
