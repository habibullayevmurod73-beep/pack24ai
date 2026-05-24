/**
 * Referral module tests
 * Note: crypto.randomBytes is not mocked — we test format/structure only
 */

describe('referral', () => {
    // Dynamic import needed because crypto uses Node.js built-in
    let generateReferralCode: () => string;
    let REFERRAL_SIGNUP_BONUS: number;

    beforeAll(async () => {
        const mod = await import('../referral');
        generateReferralCode = mod.generateReferralCode;
        REFERRAL_SIGNUP_BONUS = mod.REFERRAL_SIGNUP_BONUS;
    });

    describe('REFERRAL_SIGNUP_BONUS', () => {
        it('is a positive number', () => {
            expect(REFERRAL_SIGNUP_BONUS).toBe(5);
        });
    });

    describe('generateReferralCode', () => {
        it('returns string starting with PACK24-', () => {
            const code = generateReferralCode();
            expect(code.startsWith('PACK24-')).toBe(true);
        });

        it('has correct format: PACK24-XXXXXX (6 hex chars)', () => {
            const code = generateReferralCode();
            expect(code).toMatch(/^PACK24-[0-9A-F]{6}$/);
        });

        it('generates unique codes', () => {
            const codes = new Set<string>();
            for (let i = 0; i < 100; i++) {
                codes.add(generateReferralCode());
            }
            // With 3 random bytes (16M possibilities), 100 codes should be unique
            expect(codes.size).toBe(100);
        });

        it('uses uppercase hex characters', () => {
            const code = generateReferralCode();
            const hex = code.replace('PACK24-', '');
            expect(hex).toBe(hex.toUpperCase());
        });
    });
});
