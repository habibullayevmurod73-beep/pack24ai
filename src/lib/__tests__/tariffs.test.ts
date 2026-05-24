import {
  TARIFFS,
  TARIFF_IDS,
  getTariff,
  isValidTariffId,
  mapLegacyMaterial,
  aliasesForTariffs,
  sanitizeTariffIds,
  type TariffId,
} from '@/lib/tariffs';

const ALL_IDS: TariffId[] = ['maklatura', 'sellofan', 'bakalashka', 'aluminiy', 'shisha', 'qurilish'];

const EXPECTED_PRICES: Record<TariffId, number> = {
  maklatura: 700,
  sellofan: 800,
  bakalashka: 1000,
  aluminiy: 2500,
  shisha: 300,
  qurilish: 200,
};

describe('TARIFFS constant', () => {
  it('has exactly 6 entries', () => {
    expect(TARIFFS).toHaveLength(6);
  });

  it.each(ALL_IDS)('contains tariff "%s" with correct pricePerKg', (id) => {
    const tariff = TARIFFS.find((t) => t.id === id);
    expect(tariff).toBeDefined();
    expect(tariff!.pricePerKg).toBe(EXPECTED_PRICES[id]);
  });
});

describe('TARIFF_IDS', () => {
  it('contains all 6 IDs', () => {
    expect(TARIFF_IDS).toHaveLength(6);
    for (const id of ALL_IDS) {
      expect(TARIFF_IDS).toContain(id);
    }
  });
});

describe('getTariff', () => {
  it.each(ALL_IDS)('returns correct tariff for "%s"', (id) => {
    const tariff = getTariff(id);
    expect(tariff).toBeDefined();
    expect(tariff!.id).toBe(id);
    expect(tariff!.pricePerKg).toBe(EXPECTED_PRICES[id]);
  });

  it.each(['unknown', '', 'MAKLATURA', 'paper', '123'])('returns undefined for invalid ID "%s"', (id) => {
    expect(getTariff(id)).toBeUndefined();
  });
});

describe('isValidTariffId', () => {
  it.each(ALL_IDS)('returns true for "%s"', (id) => {
    expect(isValidTariffId(id)).toBe(true);
  });

  it.each(['unknown', '', 'paper', 'MAKLATURA', 'plastik'])('returns false for "%s"', (id) => {
    expect(isValidTariffId(id)).toBe(false);
  });
});

describe('mapLegacyMaterial', () => {
  it('returns null for null', () => {
    expect(mapLegacyMaterial(null)).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(mapLegacyMaterial(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(mapLegacyMaterial('')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(mapLegacyMaterial('   ')).toBeNull();
  });

  it.each(ALL_IDS)('maps direct ID "%s" to itself', (id) => {
    expect(mapLegacyMaterial(id)).toBe(id);
  });

  it.each([
    ['qogoz', 'maklatura'],
    ['karton', 'maklatura'],
    ['plastik', 'bakalashka'],
    ['pet', 'bakalashka'],
    ['banka', 'aluminiy'],
    ['metall', 'aluminiy'],
    ['steklo', 'shisha'],
    ['beton', 'qurilish'],
    ['gisht', 'qurilish'],
    ['plyonka', 'sellofan'],
    ['paket', 'sellofan'],
  ] as [string, TariffId][])('maps legacy alias "%s" → "%s"', (alias, expected) => {
    expect(mapLegacyMaterial(alias)).toBe(expected);
  });

  it.each([
    ['Shisha', 'shisha'],
    ['PLASTIK', 'bakalashka'],
    ['Makulatura', 'maklatura'],
    ['BETON', 'qurilish'],
    ['Metall', 'aluminiy'],
  ] as [string, TariffId][])('matches case-insensitively: "%s" → "%s"', (alias, expected) => {
    expect(mapLegacyMaterial(alias)).toBe(expected);
  });

  it('returns null for unknown material', () => {
    expect(mapLegacyMaterial('unknown_material')).toBeNull();
    expect(mapLegacyMaterial('wood')).toBeNull();
  });
});

describe('aliasesForTariffs', () => {
  it('returns tariff ID + all legacy aliases for a valid tariff', () => {
    const result = aliasesForTariffs(['maklatura']);
    expect(result).toContain('maklatura');
    expect(result).toContain('qogoz');
    expect(result).toContain('karton');
    expect(result).toContain('gazeta');
  });

  it('returns combined aliases for multiple tariffs', () => {
    const result = aliasesForTariffs(['maklatura', 'aluminiy']);
    expect(result).toContain('maklatura');
    expect(result).toContain('qogoz');
    expect(result).toContain('aluminiy');
    expect(result).toContain('banka');
  });

  it('skips invalid IDs', () => {
    const result = aliasesForTariffs(['maklatura', 'invalid_id', 'shisha']);
    expect(result).toContain('maklatura');
    expect(result).toContain('shisha');
    expect(result).not.toContain('invalid_id');
  });

  it('returns empty array for empty input', () => {
    expect(aliasesForTariffs([])).toEqual([]);
  });
});

describe('sanitizeTariffIds', () => {
  it('returns valid IDs from a valid array', () => {
    const result = sanitizeTariffIds(['maklatura', 'shisha']);
    expect(result).toEqual(expect.arrayContaining(['maklatura', 'shisha']));
    expect(result).toHaveLength(2);
  });

  it.each([null, undefined, 42, 'maklatura', {}, true])('returns empty array for non-array input: %p', (input) => {
    expect(sanitizeTariffIds(input)).toEqual([]);
  });

  it('filters out invalid IDs', () => {
    const result = sanitizeTariffIds(['maklatura', 'invalid', 'shisha', 'nope']);
    expect(result).toEqual(expect.arrayContaining(['maklatura', 'shisha']));
    expect(result).toHaveLength(2);
  });

  it('deduplicates entries', () => {
    const result = sanitizeTariffIds(['maklatura', 'maklatura', 'shisha', 'shisha']);
    expect(result).toHaveLength(2);
    expect(result).toContain('maklatura');
    expect(result).toContain('shisha');
  });

  it('trims and lowercases input strings', () => {
    const result = sanitizeTariffIds(['  MAKLATURA  ', ' Shisha', 'ALUMINIY ']);
    expect(result).toContain('maklatura');
    expect(result).toContain('shisha');
    expect(result).toContain('aluminiy');
    expect(result).toHaveLength(3);
  });

  it('skips non-string elements in the array', () => {
    const result = sanitizeTariffIds(['maklatura', 42, null, undefined, 'shisha']);
    expect(result).toEqual(expect.arrayContaining(['maklatura', 'shisha']));
    expect(result).toHaveLength(2);
  });
});
