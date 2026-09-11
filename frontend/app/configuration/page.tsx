"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { ApiKeyForm } from "@/components/ApiKeyForm";
import { ApiKeyList } from "@/components/ApiKeyList";
import type { ApiKeyResponse } from "@/types/api";

export default function ConfigurationPage() {
  const [keys, setKeys] = useState<ApiKeyResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncingId, setSyncingId] = useState<number | null>(null);

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        const result = await api.listApiKeys();
        if (!ignore) setKeys(result);
      } catch (err) {
        if (!ignore) setError(err instanceof Error ? err.message : "Failed to load API keys");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleCreate(label: string, apiKey: string) {
    const created = await api.createApiKey(label, apiKey);
    setKeys((prev) => [...prev, created]);
  }

  async function handleSync(id: number) {
    setSyncingId(id);
    setError(null);
    try {
      const updated = await api.syncApiKey(id);
      setKeys((prev) => prev.map((k) => (k.id === id ? updated : k)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sync failed");
    } finally {
      setSyncingId(null);
    }
  }

  async function handleDelete(id: number) {
    if (!window.confirm("Remove this API key and all of its synced usage data?")) return;
    setError(null);
    try {
      await api.deleteApiKey(id);
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to remove key");
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl flex-1 px-6 py-8">
      <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50">Configuration</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Add an Anthropic Admin API key (organization admin role required) to start syncing
        usage and cost data, synced hourly. Keys are encrypted at rest and never shown again
        in full. New here? See the{" "}
        <Link href="/setup-guide" className="font-medium text-zinc-900 underline dark:text-zinc-50">
          Setup Guide
        </Link>
        .
      </p>

      {error && (
        <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
          {error}
        </p>
      )}

      <div className="mt-6">
        <ApiKeyForm onSubmit={handleCreate} />
      </div>

      <div className="mt-6">
        {loading ? (
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Loading…</p>
        ) : (
          <ApiKeyList keys={keys} onSync={handleSync} onDelete={handleDelete} syncingId={syncingId} />
        )}
      </div>
    </div>
  );
}
