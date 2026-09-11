"use client";

import { useState, type FormEvent } from "react";

interface Props {
  onSubmit: (label: string, apiKey: string) => Promise<void>;
}

export function ApiKeyForm({ onSubmit }: Props) {
  const [label, setLabel] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await onSubmit(label.trim(), apiKey.trim());
      setLabel("");
      setApiKey("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-lg border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900 sm:flex-row sm:items-end sm:flex-wrap"
    >
      <div className="flex-1 min-w-[160px]">
        <label className="block text-sm text-zinc-500 dark:text-zinc-400" htmlFor="label">
          Label
        </label>
        <input
          id="label"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder="Production org"
          required
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <div className="flex-[2] min-w-[220px]">
        <label className="block text-sm text-zinc-500 dark:text-zinc-400" htmlFor="apiKey">
          Anthropic Admin API key
        </label>
        <input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="sk-ant-admin..."
          required
          autoComplete="off"
          className="mt-1 w-full rounded-md border border-zinc-300 px-3 py-2 text-sm font-mono dark:border-zinc-700 dark:bg-zinc-950"
        />
      </div>
      <button
        type="submit"
        disabled={submitting}
        className="rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {submitting ? "Adding…" : "Add key"}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400 sm:basis-full">{error}</p>}
    </form>
  );
}
