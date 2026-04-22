import crypto from 'crypto';
import {
    hashPassword,
    isValidPhone,
    normalizePhone,
    verifyPassword,
} from '@/lib/userAuth';

describe('userAuth helpers', () => {
    it('telefonni normalize qiladi', () => {
        expect(normalizePhone('+998 90 123 45 67')).toBe('+998901234567');
    });

    it('telefon formatini tekshiradi', () => {
        expect(isValidPhone('+998901234567')).toBe(true);
        expect(isValidPhone('901234567')).toBe(true);
    });

    it('legacy sha256 hash uchun rehash talab qiladi', async () => {
        process.env.AUTH_SECRET = 'test-secret';
        const legacyHash = crypto
            .createHash('sha256')
            .update('Secret123' + process.env.AUTH_SECRET)
            .digest('hex');

        const result = await verifyPassword('Secret123', legacyHash);

        expect(result.valid).toBe(true);
        expect(result.needsRehash).toBe(true);
        expect(result.nextHash).toMatch(/^\$2[aby]\$/);
    });

    it('bcrypt hash uchun rehash talab qilmaydi', async () => {
        const bcryptHash = await hashPassword('Secret123');

        const result = await verifyPassword('Secret123', bcryptHash);

        expect(result.valid).toBe(true);
        expect(result.needsRehash).toBe(false);
    });
});
