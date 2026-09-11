"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { DateRangeControl } from "@/components/DateRangeControl";
import { StatCard } from "@/components/StatCard";
import { UsageChart } from "@/components/UsageChart";
import { CostChart } from "@/components/CostChart";
import { ModelBreakdownChart } from "@/components/ModelBreakdownChart";
import { presetToRange, type DateRange } from "@/lib/date-range";
import { formatCompactNumber, formatCurrency, formatFullNumber } from "@/lib/format";
import type { ModelBreakdownResponse, TimeseriesPointResponse, UsageSummaryResponse } from "@/types/api";

export default function DashboardPage() {
  const [range, setRange] = useState<DateRange>(() => presetToRange("30d"));
  const [summary, setSummary] = useState<UsageSummaryResponse | null>(null);
  const [timeseries, setTimeseries] = useState<TimeseriesPointResponse[]>([]);
  const [byModel, setByModel] = useState<ModelBreakdownResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // "ignore" flag guards against a stale response landing after the range
    // changed again - the documented pattern for fetching in an effect.
    let ignore = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [summaryRes, timeseriesRes, byModelRes] = await Promise.all([
          api.usageSummary(range.start, range.end),
          api.usageTimeseries(range.start, range.end, "day"),
          api.usageByModel(range.start, range.end),
        ]);
        if (ignore) return;
        setSummary(summaryRes);
        setTimeseries(timeseriesRes);
        setByModel(byModelRes);
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Failed to load usage data");
        }
      } finally {
        if (!ignore) {
          setLoading(false);
          setHasLoadedOnce(true);
        }
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, [range]);

  // Refetch keeps the frame: once we've shown data once, a range change fades the
  // existing charts rather than swapping in a skeleton (dataviz skill, interaction.md).
  const showSkeleton = loading && !hasLoadedOnce;
  const contentClass = `mt-4 transition-opacity ${loading && hasLoadedOnce ? "opacity-50" : "opacity-100"}`;
  const isEmpty = hasLoadedOnce && !loading && summary?.totalTokens === 0 && byModel.length === 0;

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
        <DateRangeControl range={range} onChange={setRange} />
      </div>

      {error && (
        <p className="mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      {isEmpty && !error && (
        <p className="mt-6 rounded-md border border-dashed border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-600 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-400">
          No usage data yet. Head to{" "}
          <Link href="/configuration" className="font-medium text-zinc-900 underline dark:text-zinc-50">
            Configuration
          </Link>{" "}
          to add an Anthropic Admin API key, or see the{" "}
          <Link href="/setup-guide" className="font-medium text-zinc-900 underline dark:text-zinc-50">
            Setup Guide
          </Link>{" "}
          if you haven&apos;t got the app running yet.
        </p>
      )}

      <div className={`grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 ${contentClass}`}>
        <StatCard
          label="Total tokens"
          value={summary ? formatCompactNumber(summary.totalTokens) : "—"}
          sub={summary ? formatFullNumber(summary.totalTokens) : undefined}
        />
        <StatCard label="Input tokens" value={summary ? formatCompactNumber(summary.inputTokens) : "—"} />
        <StatCard label="Output tokens" value={summary ? formatCompactNumber(summary.outputTokens) : "—"} />
        <StatCard
          label="Total cost"
          value={summary ? formatCurrency(summary.totalCost, summary.currency) : "—"}
        />
      </div>

      <div className="mt-8 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tokens over time</h2>
        <div className={contentClass}>
          {showSkeleton ? <ChartSkeleton height={300} /> : <UsageChart data={timeseries} />}
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Spend over time</h2>
          <div className={contentClass}>
            {showSkeleton ? (
              <ChartSkeleton height={220} />
            ) : (
              <CostChart data={timeseries} currency={summary?.currency ?? "USD"} />
            )}
          </div>
        </div>
        <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Tokens by model</h2>
          <div className={contentClass}>
            {showSkeleton ? <ChartSkeleton height={220} /> : <ModelBreakdownChart data={byModel} />}
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartSkeleton({ height }: { height: number }) {
  return <div className="animate-pulse rounded-md bg-zinc-100 dark:bg-zinc-800" style={{ height }} />;
}
