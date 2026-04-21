import crypto from 'crypto';

export const REFERRAL_SIGNUP_BONUS = 5;

export function generateReferralCode(): string {
    return `PACK24-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}
