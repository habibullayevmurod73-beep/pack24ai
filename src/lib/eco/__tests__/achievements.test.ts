/**
 * achievements — Pure function tests only
 * checkAndAwardBadges is async/DB-dependent and tested separately
 */

// Mock prisma to prevent import errors
jest.mock('@/lib/prisma', () => ({
    prisma: {},
}));

import { getBadgeInfo, BADGE_DEFINITIONS } from '../achievements';
import { BadgeKey } from '@prisma/client';

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
            BadgeKey.first_step, BadgeKey.kg_10_club, BadgeKey.kg_50_hero, BadgeKey.kg_100_warrior,
            BadgeKey.streak_7, BadgeKey.streak_30, BadgeKey.multi_material, BadgeKey.referral_first,
            BadgeKey.tree_saver, BadgeKey.co2_warrior, BadgeKey.early_bird, BadgeKey.eco_legend,
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
            { key: BadgeKey.first_step, emoji: '🎯' },
            { key: BadgeKey.kg_10_club, emoji: '💪' },
            { key: BadgeKey.kg_50_hero, emoji: '🦸' },
            { key: BadgeKey.kg_100_warrior, emoji: '🏅' },
            { key: BadgeKey.streak_7, emoji: '🔥' },
            { key: BadgeKey.streak_30, emoji: '🌋' },
            { key: BadgeKey.multi_material, emoji: '🎨' },
            { key: BadgeKey.referral_first, emoji: '👥' },
            { key: BadgeKey.tree_saver, emoji: '🌳' },
            { key: BadgeKey.co2_warrior, emoji: '💨' },
            { key: BadgeKey.early_bird, emoji: '🐦' },
            { key: BadgeKey.eco_legend, emoji: '⭐' },
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
