/**
 * Returns the local calendar date as YYYY-MM-DD.
 * Uses local date components (not toISOString) to avoid UTC-offset drift —
 * toISOString() returns UTC, which can be the wrong calendar day in any
 * timezone that is ahead of UTC.
 */
export const localDateISO = (date: Date = new Date()): string => {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Adds or subtracts `days` from a YYYY-MM-DD string and returns
 * the result as a YYYY-MM-DD string in local time.
 * Seeds the date at local noon so DST transitions don't flip the day.
 */
export const offsetLocalDateISO = (dateStr: string, days: number): string => {
  const d = new Date(`${dateStr}T12:00:00`);
  d.setDate(d.getDate() + days);
  return localDateISO(d);
};
