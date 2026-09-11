"use client";

import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimeseriesPointResponse } from "@/types/api";
import { formatCurrency } from "@/lib/format";
import { ChartTooltip } from "@/components/ChartTooltip";
import { EmptyChartState } from "@/components/EmptyChartState";

/**
 * Spend over time: single-series line chart. No legend box - a lone series needs
 * none, the card title already says what's plotted (see dataviz skill, marks-and-anatomy.md).
 */
export function CostChart({ data, currency }: { data: TimeseriesPointResponse[]; currency: string }) {
  if (data.length === 0) {
    return <EmptyChartState message="No cost data for this range yet." />;
  }

  const format = (v: number) => formatCurrency(v, currency);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--chart-grid)" vertical={false} />
        <XAxis
          dataKey="key"
          tick={{ fontSize: 12, fill: "var(--chart-muted)" }}
          axisLine={{ stroke: "var(--chart-axis)" }}
          tickLine={false}
          minTickGap={24}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--chart-muted)" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={format}
          width={64}
        />
        <Tooltip content={(props) => <ChartTooltip {...props} valueFormatter={format} />} />
        <Line
          type="monotone"
          dataKey="cost"
          name="Cost"
          stroke="var(--chart-series-1)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-surface)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
