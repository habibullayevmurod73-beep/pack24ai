/**
 * achievements — Pure function tests only
 * checkAndAwardBadges is async/DB-dependent and tested separately
 */

// Mock prisma to prevent import errors
jest.mock('@/lib/prisma', () => ({
    prisma: {},
}));

import { getBadgeInfo, BADGE_DEFINITIONS, type BadgeKey } from '../achievements';

describe('BADGE_DEFINITIONS', () => {
    it('has exactly 12 badges', () => {
        expect(BADGE_DEFINITIONS).toHaveLength(12);
    });

    it('all badges have required fields', () => {
        for (const badge of BADGE_DEFINITIONS) {
            expect(badge.key).toBeDefined();
            expect(badge.nameUz).toBeDefined();
            expect(badge.nameRu).toBeDefined();
            expect(badge.emoji).toBeDefined();
            expect(badge.color).toMatch(/^#[0-9A-Fa-f]{6}$/);
            expect(badge.descriptionUz).toBeDefined();
        }
    });

    it('all badge keys are unique', () => {
        const keys = BADGE_DEFINITIONS.map(b => b.key);
        expect(new Set(keys).size).toBe(keys.length);
    });

    it('contains all expected badge keys', () => {
        const expectedKeys: BadgeKey[] = [
            'first_step', '10kg_club', '50kg_hero', '100kg_warrior',
            'streak_7', 'streak_30', 'multi_material', 'referral_first',
            'tree_saver', 'co2_warrior', 'early_bird', 'eco_legend',
        ];
        const actualKeys = BADGE_DEFINITIONS.map(b => b.key);
        for (const key of expectedKeys) {
            expect(actualKeys).toContain(key);
        }
    });
});

describe('getBadgeInfo', () => {
    it('returns badge for valid key', () => {
        const badge = getBadgeInfo('first_step');
        expect(badge).toBeDefined();
        expect(badge!.key).toBe('first_step');
        expect(badge!.emoji).toBe('🎯');
    });

    it('returns correct data for each badge key', () => {
        const testCases: { key: BadgeKey; emoji: string }[] = [
            { key: 'first_step', emoji: '🎯' },
            { key: '10kg_club', emoji: '💪' },
            { key: '50kg_hero', emoji: '🦸' },
            { key: '100kg_warrior', emoji: '🏅' },
            { key: 'streak_7', emoji: '🔥' },
            { key: 'streak_30', emoji: '🌋' },
            { key: 'multi_material', emoji: '🎨' },
            { key: 'referral_first', emoji: '👥' },
            { key: 'tree_saver', emoji: '🌳' },
            { key: 'co2_warrior', emoji: '💨' },
            { key: 'early_bird', emoji: '🐦' },
            { key: 'eco_legend', emoji: '⭐' },
        ];

        for (const { key, emoji } of testCases) {
            const badge = getBadgeInfo(key);
            expect(badge).toBeDefined();
            expect(badge!.emoji).toBe(emoji);
        }
    });

    it('returns undefined for invalid key', () => {
        const badge = getBadgeInfo('nonexistent' as BadgeKey);
        expect(badge).toBeUndefined();
    });
});
