"use client";

import { useState } from "react";
import { DATE_RANGE_PRESETS, presetToRange, type DateRange, type DateRangePreset } from "@/lib/date-range";

interface Props {
  range: DateRange;
  onChange: (range: DateRange) => void;
}

/**
 * One row, presets before custom range, per the dataviz skill's interaction.md.
 * A simplified stand-in for the full "list of preset rows" date picker spec -
 * a row of preset buttons plus a custom range revealed on demand.
 */
export function DateRangeControl({ range, onChange }: Props) {
  const [activePreset, setActivePreset] = useState<DateRangePreset | "custom">("30d");
  const [showCustom, setShowCustom] = useState(false);

  function selectPreset(preset: DateRangePreset) {
    setActivePreset(preset);
    setShowCustom(false);
    onChange(presetToRange(preset));
  }

  function toggleCustom() {
    setActivePreset("custom");
    setShowCustom((v) => !v);
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {DATE_RANGE_PRESETS.map((p) => {
        const isActive = activePreset === p.key;
        return (
          <button
            key={p.key}
            type="button"
            onClick={() => selectPreset(p.key)}
            className={
              "rounded-md px-3 py-1.5 text-sm transition-colors " +
              (isActive
                ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800")
            }
          >
            {p.label}
          </button>
        );
      })}
      <button
        type="button"
        onClick={toggleCustom}
        className={
          "rounded-md border border-dashed px-3 py-1.5 text-sm transition-colors " +
          (activePreset === "custom"
            ? "border-zinc-900 text-zinc-900 dark:border-zinc-50 dark:text-zinc-50"
            : "border-zinc-300 text-zinc-500 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800")
        }
      >
        Custom range
      </button>
      {showCustom && (
        <div className="flex items-center gap-2 text-sm">
          <input
            type="date"
            value={range.start}
            max={range.end}
            onChange={(e) => onChange({ start: e.target.value, end: range.end })}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
          <span className="text-zinc-400">to</span>
          <input
            type="date"
            value={range.end}
            min={range.start}
            onChange={(e) => onChange({ start: range.start, end: e.target.value })}
            className="rounded-md border border-zinc-300 bg-white px-2 py-1 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      )}
    </div>
  );
}
