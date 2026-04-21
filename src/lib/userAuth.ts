import crypto from 'crypto';
import bcrypt from 'bcryptjs';

const PHONE_REGEX = /^\+?[0-9]{9,15}$/;
const BCRYPT_ROUNDS = 12;

export function normalizePhone(phone: string): string {
    // Barcha bo'shliq va maxsus belgilarni olib tashlash
    let p = phone.replace(/[\s\-().]/g, '');
    // '+' belgisi bo'lmasa va raqam 9 bilan boshlanmasa qo'shamiz
    if (!p.startsWith('+') && !p.startsWith('00')) {
        p = '+' + p;
    }
    return p;
}

export function isValidPhone(phone: string): boolean {
    return PHONE_REGEX.test(normalizePhone(phone));
}

function hashPasswordLegacy(password: string): string {
    return crypto
        .createHash('sha256')
        .update(password + (process.env.AUTH_SECRET ?? ''))
        .digest('hex');
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

function isBcryptHash(hash: string): boolean {
    return /^\$2[aby]\$\d{2}\$/.test(hash);
}

export async function verifyPassword(
    password: string,
    storedHash: string
): Promise<{ valid: boolean; needsRehash: boolean; nextHash?: string }> {
    if (isBcryptHash(storedHash)) {
        const valid = await bcrypt.compare(password, storedHash);
        return { valid, needsRehash: false };
    }

    const valid = hashPasswordLegacy(password) === storedHash;
    if (!valid) {
        return { valid: false, needsRehash: false };
    }

    return {
        valid: true,
        needsRehash: true,
        nextHash: await hashPassword(password),
    };
}
