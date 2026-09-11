"use client";

import { useState } from "react";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function handleClick() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) - silently do nothing;
      // the text is still selectable/copyable by hand.
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className="rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-200 hover:bg-zinc-700"
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}
