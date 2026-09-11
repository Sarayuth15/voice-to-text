"use client";

import type { ApiKeyResponse } from "@/types/api";

interface Props {
  keys: ApiKeyResponse[];
  onSync: (id: number) => void;
  onDelete: (id: number) => void;
  syncingId: number | null;
}

const STATUS_STYLES: Record<ApiKeyResponse["lastSyncStatus"], string> = {
  NEVER_SYNCED: "text-zinc-400 dark:text-zinc-500",
  IN_PROGRESS: "text-amber-600 dark:text-amber-400",
  SUCCESS: "text-emerald-600 dark:text-emerald-400",
  FAILED: "text-red-600 dark:text-red-400",
};

const STATUS_LABELS: Record<ApiKeyResponse["lastSyncStatus"], string> = {
  NEVER_SYNCED: "Never synced",
  IN_PROGRESS: "Syncing…",
  SUCCESS: "Synced",
  FAILED: "Sync failed",
};

export function ApiKeyList({ keys, onSync, onDelete, syncingId }: Props) {
  if (keys.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-zinc-300 p-6 text-center text-sm text-zinc-500 dark:border-zinc-700 dark:text-zinc-400">
        No API keys yet — add an Anthropic Admin API key above to start syncing usage data.
      </p>
    );
  }

  return (
    <ul className="divide-y divide-zinc-200 rounded-lg border border-zinc-200 bg-white dark:divide-zinc-800 dark:border-zinc-800 dark:bg-zinc-900">
      {keys.map((key) => (
        <li
          key={key.id}
          className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
        >
          <div>
            <p className="font-medium text-zinc-900 dark:text-zinc-50">{key.label}</p>
            <p className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{key.maskedKey}</p>
            <p className={`mt-1 text-xs ${STATUS_STYLES[key.lastSyncStatus]}`}>
              {STATUS_LABELS[key.lastSyncStatus]}
              {key.lastSyncedAt ? ` · ${new Date(key.lastSyncedAt).toLocaleString()}` : ""}
            </p>
            {key.lastSyncError && (
              <p className="mt-1 max-w-md text-xs text-red-500 dark:text-red-400">{key.lastSyncError}</p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => onSync(key.id)}
              disabled={syncingId === key.id}
              className="rounded-md border border-zinc-300 px-3 py-1.5 text-sm text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"
            >
              {syncingId === key.id ? "Syncing…" : "Sync now"}
            </button>
            <button
              type="button"
              onClick={() => onDelete(key.id)}
              className="rounded-md border border-red-200 px-3 py-1.5 text-sm text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950"
            >
              Remove
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
