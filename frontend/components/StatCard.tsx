interface Props {
  label: string;
  value: string;
  sub?: string;
}

/** Stat tile per the dataviz skill's figure spec: sentence-case label, semibold compact value. */
export function StatCard({ label, value, sub }: Props) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{value}</p>
      {sub ? <p className="mt-1 text-xs text-zinc-400 dark:text-zinc-500">{sub}</p> : null}
    </div>
  );
}
