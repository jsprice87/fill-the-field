
export const toDate = (v: unknown): Date | null =>
  v instanceof Date ? v :
  v ? new Date(String(v)) : null;

export const toNumber = (v: unknown): number | null =>
  v === '' || v === null || v === undefined ? null : Number(v);

export const toBool = (v: unknown): boolean =>
  typeof v === 'boolean'
    ? v
    : v === 'true' || v === '1';
