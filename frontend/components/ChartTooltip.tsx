import type { TooltipContentProps } from "recharts";

/**
 * Shared tooltip content for every chart: one box listing every series at the
 * hovered position, value first (bold) then series name, keyed by a short line
 * of the series color rather than a filled box. See dataviz skill's
 * references/interaction.md - "values lead, labels follow" / "line keys, not boxes".
 *
 * Typed against Tooltip's default (broad) value/name generics rather than
 * <number, string> so it plugs into `content={(props) => ...}` for any chart
 * without a generic mismatch; our data only ever puts numbers in `value`.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  valueFormatter,
}: TooltipContentProps & { valueFormatter?: (value: number) => string }) {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  return (
    <div className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-xs shadow-md dark:border-zinc-700 dark:bg-zinc-900">
      {label !== undefined && (
        <p className="mb-1.5 font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
      )}
      <div className="space-y-1">
        {payload.map((entry) => (
          <div key={String(entry.dataKey)} className="flex items-center gap-2">
            <span
              className="h-0.5 w-3 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color ?? entry.stroke ?? entry.fill }}
            />
            <span className="font-semibold text-zinc-900 dark:text-zinc-50">
              {typeof entry.value === "number" && valueFormatter
                ? valueFormatter(entry.value)
                : entry.value}
            </span>
            <span className="text-zinc-500 dark:text-zinc-400">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
