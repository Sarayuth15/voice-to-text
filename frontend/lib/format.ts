/** 1,284 / 12.9K / 3.4M - per the dataviz skill's stat-tile figure spec. */
export function formatCompactNumber(value: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);
}

export function formatFullNumber(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatCurrency(value: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency || "USD",
      maximumFractionDigits: 2,
    }).format(value);
  } catch {
    return `$${value.toFixed(2)}`;
  }
}
