
export const isoOrNull = (d: Date | null): string | null =>
  d ? d.toISOString() : null;

export const dateOrNull = (v?: string | null): Date | null =>
  v ? new Date(v) : null;
