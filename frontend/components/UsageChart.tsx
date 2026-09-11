"use client";

import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { TimeseriesPointResponse } from "@/types/api";
import { formatCompactNumber } from "@/lib/format";
import { ChartTooltip } from "@/components/ChartTooltip";
import { EmptyChartState } from "@/components/EmptyChartState";

/** Tokens over time: 2-series line chart (input vs output), categorical slots 1/2. */
export function UsageChart({ data }: { data: TimeseriesPointResponse[] }) {
  if (data.length === 0) {
    return <EmptyChartState message="No usage data for this range yet." />;
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
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
          tickFormatter={(v: number) => formatCompactNumber(v)}
          width={48}
        />
        <Tooltip content={(props) => <ChartTooltip {...props} valueFormatter={formatCompactNumber} />} />
        <Legend iconType="plainline" wrapperStyle={{ fontSize: 12, color: "var(--chart-text-secondary)" }} />
        <Line
          type="monotone"
          dataKey="inputTokens"
          name="Input tokens"
          stroke="var(--chart-series-1)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-surface)" }}
        />
        <Line
          type="monotone"
          dataKey="outputTokens"
          name="Output tokens"
          stroke="var(--chart-series-2)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--chart-surface)" }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
