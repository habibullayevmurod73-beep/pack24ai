/** @jest-environment node */

import crypto from 'crypto';
import {
    ADMIN_TOKEN_MAX_AGE_MS,
    validateAdminToken,
} from '@/lib/adminAuthShared';

function createToken(secret: string, timestamp: number): string {
    const hmac = crypto
        .createHmac('sha256', secret)
        .update(`admin_${timestamp}`)
        .digest('hex');

    return `admin_${timestamp}_${hmac}`;
}

describe('validateAdminToken', () => {
    const secret = 'super-secure-admin-secret';
    const now = 1_700_000_000_000;

    it('valid tokenni qabul qiladi', async () => {
        const token = createToken(secret, now - 1_000);

        await expect(validateAdminToken(token, secret, now)).resolves.toEqual({
            valid: true,
            reason: 'ok',
        });
    });

    it('expired tokenni rad etadi', async () => {
        const token = createToken(secret, now - ADMIN_TOKEN_MAX_AGE_MS - 1);

        await expect(validateAdminToken(token, secret, now)).resolves.toEqual({
            valid: false,
            reason: 'expired',
        });
    });

    it('imzosi buzilgan tokenni rad etadi', async () => {
        const token = `admin_${now - 1_000}_deadbeef`;

        await expect(validateAdminToken(token, secret, now)).resolves.toEqual({
            valid: false,
            reason: 'invalid_signature',
        });
    });
});
