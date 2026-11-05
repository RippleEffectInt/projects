import { describe, it, expect } from 'vitest';
import { formatProjectCode, nextDemoProjectNumber, parseDemoProjectCode } from './projectCodes';
describe('composite project codes', () => {
  it('formats country, description and zero-padded global number without separators', () => {
    expect(formatProjectCode('KE', 'XX', 1933)).toBe('KEXX01933');
    expect(formatProjectCode('RW', 'MC', 1934)).toBe('RWMC01934');
    expect(formatProjectCode('KE', 'XX', 100000)).toBe('KEXX100000');
  });
  it('uses the maximum number across countries and description codes, including legacy demo fixtures', () => {
    expect(nextDemoProjectNumber(['DEMO-KEXX01933', 'DEMO-RWMC01934', 'DEMO-UGXX01930'])).toBe(
      1935,
    );
    expect(nextDemoProjectNumber(['DEMO-KE-101', 'DEMO-RW-108'])).toBe(109);
    expect(nextDemoProjectNumber(['DEMO-KEXX01933'], 2000)).toBe(2000);
  });
  it('rejects invalid numbers, malformed prefixes and noncanonical or live codes', () => {
    for (const n of [0, -1, 1.5, NaN, Infinity])
      expect(() => formatProjectCode('KE', 'XX', n)).toThrow();
    expect(() => formatProjectCode('K', 'XX', 1)).toThrow();
    for (const code of ['KEXX01933', 'DEMO-KEXX00000', 'DEMO-KEXX001933', 'DEMO-KEXX1933'])
      expect(parseDemoProjectCode(code)).toBeNull();
    expect(parseDemoProjectCode('DEMO-KEXX01933')).toEqual({
      countryCode: 'KE',
      descriptionCode: 'XX',
      number: 1933,
    });
  });
});
