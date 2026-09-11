"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ModelBreakdownResponse } from "@/types/api";
import { formatCompactNumber } from "@/lib/format";
import { ChartTooltip } from "@/components/ChartTooltip";
import { EmptyChartState } from "@/components/EmptyChartState";

// Series-count ladder (dataviz skill): past ~7-8 slots, fold the tail into "Other"
// rather than generate more hues - this is a magnitude comparison (one sequential
// hue for every bar), not an identity chart, so folding loses no color meaning.
const MAX_SLOTS = 7;

interface Row {
  model: string;
  totalTokens: number;
}

/** Token usage by model: horizontal bar chart, sorted descending, one sequential hue. */
export function ModelBreakdownChart({ data }: { data: ModelBreakdownResponse[] }) {
  if (data.length === 0) {
    return <EmptyChartState message="No usage data for this range yet." />;
  }

  const sorted = [...data].sort((a, b) => b.totalTokens - a.totalTokens);
  const rows: Row[] = sorted
    .slice(0, MAX_SLOTS)
    .map((d) => ({ model: d.model || "(unknown)", totalTokens: d.totalTokens }));

  const rest = sorted.slice(MAX_SLOTS);
  if (rest.length > 0) {
    rows.push({
      model: `Other (${rest.length})`,
      totalTokens: rest.reduce((sum, d) => sum + d.totalTokens, 0),
    });
  }

  const height = Math.max(160, rows.length * 40);

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={rows} layout="vertical" margin={{ top: 8, right: 24, left: 8, bottom: 0 }}>
        <CartesianGrid stroke="var(--chart-grid)" horizontal={false} />
        <XAxis
          type="number"
          tick={{ fontSize: 12, fill: "var(--chart-muted)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v: number) => formatCompactNumber(v)}
        />
        <YAxis
          type="category"
          dataKey="model"
          tick={{ fontSize: 12, fill: "var(--chart-text-secondary)" }}
          axisLine={false}
          tickLine={false}
          width={140}
        />
        <Tooltip
          content={(props) => <ChartTooltip {...props} valueFormatter={formatCompactNumber} />}
          cursor={{ fill: "var(--chart-grid)" }}
        />
        <Bar dataKey="totalTokens" name="Total tokens" fill="var(--chart-sequential)" radius={[0, 4, 4, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  );
}
