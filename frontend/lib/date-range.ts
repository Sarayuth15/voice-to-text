export type DateRangePreset = "7d" | "30d" | "90d";

export const DATE_RANGE_PRESETS: { key: DateRangePreset; label: string; days: number }[] = [
  { key: "7d", label: "Last 7 days", days: 7 },
  { key: "30d", label: "Last 30 days", days: 30 },
  { key: "90d", label: "Last 90 days", days: 90 },
];

export interface DateRange {
  start: string;
  end: string;
}

export function presetToRange(preset: DateRangePreset): DateRange {
  const days = DATE_RANGE_PRESETS.find((p) => p.key === preset)?.days ?? 30;
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - (days - 1));
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

export function toIsoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}
