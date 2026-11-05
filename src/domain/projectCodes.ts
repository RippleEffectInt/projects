/** Code syntax uses a minimum five-digit global number, without separators. */
export function formatProjectCode(
  countryCode: string,
  descriptionCode: string,
  number: number,
): string {
  if (!/^[A-Z]{2}$/.test(countryCode)) throw new Error('Country code must contain two letters.');
  if (!/^[A-Z]{2}$/.test(descriptionCode))
    throw new Error('Description code must contain two letters.');
  if (!Number.isSafeInteger(number) || number < 1)
    throw new Error('Project number must be a positive whole number.');
  return `${countryCode}${descriptionCode}${String(number).padStart(5, '0')}`;
}
export function parseDemoProjectCode(
  code: string,
): { countryCode: string; descriptionCode: string; number: number } | null {
  const match = /^DEMO-([A-Z]{2})([A-Z]{2})(\d{5,})$/.exec(code);
  if (!match) return null;
  const number = Number(match[3]);
  if (!Number.isSafeInteger(number) || number < 1) return null;
  if (formatProjectCode(match[1], match[2], number) !== code.slice(5)) return null;
  return { countryCode: match[1], descriptionCode: match[2], number };
}
/** Demo compatibility: retain numbers from the original fictional fixture codes too. */
export function nextDemoProjectNumber(codes: string[], storedNext?: number): number {
  const maximum = codes.reduce((max, code) => {
    const parsed = parseDemoProjectCode(code);
    const legacy = /^DEMO-[A-Z]{2}-(\d+)$/.exec(code);
    const number = parsed?.number ?? (legacy ? Number(legacy[1]) : 0);
    return Number.isSafeInteger(number) ? Math.max(max, number) : max;
  }, 0);
  const next = Math.max(maximum + 1, storedNext ?? 1);
  if (!Number.isSafeInteger(next) || next < 1 || next >= Number.MAX_SAFE_INTEGER)
    throw new Error('Demo project numbering is exhausted.');
  return next;
}
