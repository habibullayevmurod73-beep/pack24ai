import { calcEcoImpact, calcTotalImpact, formatCO2 } from '@/lib/eco/co2Calculator';

describe('co2Calculator', () => {
  // ── calcEcoImpact ─────────────────────────────────────────────────

  describe('calcEcoImpact', () => {
    describe.each([
      ['Makulatura', 10, { co2SavedKg: 15, treesEquivalent: 0, waterSavedL: 500, energySavedKwh: 40 }],
      ['Karton',     10, { co2SavedKg: 11, treesEquivalent: 0, waterSavedL: 350, energySavedKwh: 32 }],
      ['Plastik',    10, { co2SavedKg: 18, treesEquivalent: 0, waterSavedL: 100, energySavedKwh: 58 }],
      ['Shisha',     10, { co2SavedKg: 3,  treesEquivalent: 0, waterSavedL: 15,  energySavedKwh: 8 }],
      ['Metall',     10, { co2SavedKg: 21, treesEquivalent: 0, waterSavedL: 20,  energySavedKwh: 65 }],
    ])('known material: %s', (material, kg, expected) => {
      it(`returns correct impact for ${material} at ${kg} kg`, () => {
        expect(calcEcoImpact(material, kg)).toEqual(expected);
      });
    });

    it('falls back to default for unknown material', () => {
      const result = calcEcoImpact('UnknownStuff', 10);
      // default: co2PerKg=1.5, waterPerKg=30, energyPerKg=4.0
      expect(result).toEqual({
        co2SavedKg: 15,
        treesEquivalent: 0,
        waterSavedL: 300,
        energySavedKwh: 40,
      });
    });

    it('returns all zeros for 0 kg', () => {
      expect(calcEcoImpact('Plastik', 0)).toEqual({
        co2SavedKg: 0,
        treesEquivalent: 0,
        waterSavedL: 0,
        energySavedKwh: 0,
      });
    });

    it('handles large kg values (1000 kg)', () => {
      // Makulatura: co2=1500, water=50000, energy=4000
      const result = calcEcoImpact('Makulatura', 1000);
      expect(result).toEqual({
        co2SavedKg: 1500,
        treesEquivalent: 25, // floor(1500 / 60) = 25
        waterSavedL: 50000,
        energySavedKwh: 4000,
      });
    });

    it('calculates treesEquivalent correctly (1 tree = 60 kg CO₂)', () => {
      // Metall: co2PerKg=2.1, 100 kg → co2 = 210 → floor(210/60) = 3
      const result = calcEcoImpact('Metall', 100);
      expect(result.treesEquivalent).toBe(3);
      expect(result.co2SavedKg).toBe(210);
    });

    it('treesEquivalent is 0 when CO₂ saved < 60 kg', () => {
      // Shisha: co2PerKg=0.3, 10 kg → co2 = 3 → floor(3/60) = 0
      expect(calcEcoImpact('Shisha', 10).treesEquivalent).toBe(0);
    });
  });

  // ── calcTotalImpact ───────────────────────────────────────────────

  describe('calcTotalImpact', () => {
    it('returns zeros for empty array', () => {
      expect(calcTotalImpact([])).toEqual({
        co2SavedKg: 0,
        treesEquivalent: 0,
        waterSavedL: 0,
        energySavedKwh: 0,
      });
    });

    it('single entry matches calcEcoImpact', () => {
      const single = calcEcoImpact('Plastik', 20);
      const total = calcTotalImpact([{ material: 'Plastik', kg: 20 }]);
      expect(total).toEqual(single);
    });

    it('aggregates multiple entries of same material', () => {
      const total = calcTotalImpact([
        { material: 'Karton', kg: 10 },
        { material: 'Karton', kg: 20 },
      ]);
      // 10 kg: co2=11, water=350, energy=32
      // 20 kg: co2=22, water=700, energy=64
      expect(total.co2SavedKg).toBe(33);
      expect(total.waterSavedL).toBe(1050);
      expect(total.energySavedKwh).toBe(96);
    });

    it('aggregates mixed materials correctly', () => {
      const total = calcTotalImpact([
        { material: 'Makulatura', kg: 5 },  // co2=7.5, water=250, energy=20
        { material: 'Metall', kg: 5 },       // co2=10.5, water=10, energy=32.5
        { material: 'Shisha', kg: 5 },       // co2=1.5, water=8 (rounded), energy=4
      ]);
      expect(total.co2SavedKg).toBe(19.5);
      expect(total.waterSavedL).toBe(268);  // 250+10+8
      expect(total.energySavedKwh).toBe(56.5); // 20+32.5+4
    });

    it('sums treesEquivalent per-entry (not from total CO₂)', () => {
      // Each entry's treesEquivalent is calculated independently then summed
      const total = calcTotalImpact([
        { material: 'Metall', kg: 100 },  // co2=210, trees=3
        { material: 'Metall', kg: 100 },  // co2=210, trees=3
      ]);
      expect(total.treesEquivalent).toBe(6);
    });
  });

  // ── formatCO2 ─────────────────────────────────────────────────────

  describe('formatCO2', () => {
    it('returns kg format for values below 1000', () => {
      expect(formatCO2(500)).toBe('500 kg');
    });

    it('returns kg format for 999', () => {
      expect(formatCO2(999)).toBe('999 kg');
    });

    it('returns tonnes format for exactly 1000', () => {
      expect(formatCO2(1000)).toBe('1.0 t');
    });

    it('returns tonnes format for values above 1000', () => {
      expect(formatCO2(2500)).toBe('2.5 t');
    });

    it('returns "0 kg" for 0', () => {
      expect(formatCO2(0)).toBe('0 kg');
    });

    it('formats decimal tonnes correctly', () => {
      expect(formatCO2(1500)).toBe('1.5 t');
      expect(formatCO2(10000)).toBe('10.0 t');
    });
  });
});
