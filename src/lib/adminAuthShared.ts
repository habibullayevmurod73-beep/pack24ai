export const ADMIN_AUTH_COOKIE = 'admin_auth';
export const ADMIN_AUTH_HEADER = 'x-admin-token';
export const ADMIN_TOKEN_MAX_AGE_MS = 8 * 60 * 60 * 1000;

type AdminTokenValidationReason =
    | 'ok'
    | 'invalid_format'
    | 'invalid_timestamp'
    | 'expired'
    | 'invalid_signature';

export interface AdminTokenValidationResult {
    valid: boolean;
    reason: AdminTokenValidationReason;
}

function hexToUint8Array(hex: string): Uint8Array | null {
    if (!/^[0-9a-fA-F]+$/.test(hex) || hex.length % 2 !== 0) {
        return null;
    }

    const pairs = hex.match(/.{1,2}/g);
    if (!pairs) {
        return null;
    }

    return new Uint8Array(pairs.map((pair) => parseInt(pair, 16)));
}

export async function validateAdminToken(
    token: string,
    secret: string,
    now = Date.now(),
    maxAgeMs = ADMIN_TOKEN_MAX_AGE_MS
): Promise<AdminTokenValidationResult> {
    const parts = token.split('_');
    if (parts.length < 3 || parts[0] !== 'admin') {
        return { valid: false, reason: 'invalid_format' };
    }

    const timestamp = Number(parts[1]);
    if (!Number.isFinite(timestamp)) {
        return { valid: false, reason: 'invalid_timestamp' };
    }

    const tokenAge = now - timestamp;
    if (tokenAge < 0 || tokenAge > maxAgeMs) {
        return { valid: false, reason: 'expired' };
    }

    const receivedBytes = hexToUint8Array(parts.slice(2).join('_'));
    if (!receivedBytes) {
        return { valid: false, reason: 'invalid_signature' };
    }

    try {
        const enc = new TextEncoder();
        const cryptoKey = await crypto.subtle.importKey(
            'raw',
            enc.encode(secret),
            { name: 'HMAC', hash: 'SHA-256' },
            false,
            ['verify']
        );

        const isValid = await crypto.subtle.verify(
            'HMAC',
            cryptoKey,
            receivedBytes.buffer as ArrayBuffer,
            enc.encode(`admin_${timestamp}`)
        );

        return isValid
            ? { valid: true, reason: 'ok' }
            : { valid: false, reason: 'invalid_signature' };
    } catch {
        return { valid: false, reason: 'invalid_signature' };
    }
}
