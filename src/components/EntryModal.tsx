"use client";

import { useEffect, useRef, useState } from "react";
import type { SaveInput } from "@/hooks/useEntries";
import { todayISO } from "@/lib/chart-math";

export default function EntryModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (input: SaveInput) => Promise<void>;
}) {
  const [date, setDate] = useState(todayISO());
  const [weightLbs, setWeightLbs] = useState("");
  const [steps, setSteps] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!weightLbs && !steps) {
      setError("Enter a weight, step count, or both.");
      return;
    }

    setSaving(true);
    try {
      await onSave({
        date,
        weightLbs: weightLbs ? Number(weightLbs) : null,
        steps: steps ? Number(steps) : null,
      });
      onClose();
    } catch {
      // error state already set by the hook via thrown message
      setError("Something went wrong saving that entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: "rgba(10, 9, 7, 0.45)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-modal-title"
        className="fade-up w-full max-w-sm rounded-[3px] border p-6"
        style={{ background: "var(--surface)", borderColor: "var(--border)" }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <h2 id="entry-modal-title" className="display text-lg">
            Log an entry
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ color: "var(--ink-faint)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="m-date" className="text-[0.7rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--ink-faint)" }}>
              Date
            </label>
            <input
              ref={firstInputRef}
              id="m-date"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="mono rounded-[3px] border px-3 py-2.5 text-[0.92rem]"
              style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--ink)" }}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="m-weight" className="text-[0.7rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--ink-faint)" }}>
                Weight (lb)
              </label>
              <input
                id="m-weight"
                type="number"
                step="0.1"
                min="0"
                inputMode="decimal"
                placeholder="180.2"
                value={weightLbs}
                onChange={(e) => setWeightLbs(e.target.value)}
                className="mono rounded-[3px] border px-3 py-2.5 text-[0.92rem]"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="m-steps" className="text-[0.7rem] font-semibold uppercase tracking-[0.08em]" style={{ color: "var(--ink-faint)" }}>
                Steps
              </label>
              <input
                id="m-steps"
                type="number"
                step="1"
                min="0"
                inputMode="numeric"
                placeholder="8100"
                value={steps}
                onChange={(e) => setSteps(e.target.value)}
                className="mono rounded-[3px] border px-3 py-2.5 text-[0.92rem]"
                style={{ background: "var(--surface-2)", borderColor: "var(--border)", color: "var(--ink)" }}
              />
            </div>
          </div>

          {error && (
            <p className="text-[0.82rem]" style={{ color: "var(--weight-strong)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-1 rounded-[3px] py-2.5 text-sm font-semibold transition-opacity disabled:opacity-50"
            style={{ background: "var(--ink)", color: "var(--ground)" }}
          >
            {saving ? "Saving…" : "Save entry"}
          </button>
        </form>
      </div>
    </div>
  );
}
