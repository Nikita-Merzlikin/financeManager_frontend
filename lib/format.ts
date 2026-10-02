export function formatMoney(amount: number, currency = "UAH"): string {
  try {
    return new Intl.NumberFormat("uk-UA", {
      style: "currency",
      currency,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

export function formatDateLabel(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("uk-UA", {
    day: "2-digit",
    month: "short",
  }).format(d);
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
