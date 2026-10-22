/** Default transaction/dashboard window: last 30 days (ISO). */
export function defaultRangeIso(): { from: string; to: string } {
  const to = new Date();
  const from = new Date();
  from.setUTCDate(from.getUTCDate() - 30);
  return {
    from: from.toISOString(),
    to: to.toISOString(),
  };
}

export function toInputDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function fromInputDate(value: string, endOfDay = false): string {
  if (!value) return "";
  const suffix = endOfDay ? "T23:59:59.999Z" : "T00:00:00.000Z";
  return `${value}${suffix}`;
}
