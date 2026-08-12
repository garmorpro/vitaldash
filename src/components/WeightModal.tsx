"use client";

import { useEffect, useRef, useState } from "react";
import type { SaveInput } from "@/hooks/useEntries";
import { todayISO } from "@/lib/chart-math";

export default function WeightModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (input: SaveInput) => Promise<void>;
}) {
  const [date, setDate] = useState(todayISO());
  const [weightLbs, setWeightLbs] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

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
    if (!weightLbs) {
      setError("Enter a weight.");
      return;
    }
    setSaving(true);
    try {
      await onSave({ date, weightLbs: Number(weightLbs) });
      onClose();
    } catch {
      setError("Something went wrong saving that entry.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center overflow-y-auto p-4 sm:items-center"
      style={{ background: "rgba(20, 40, 55, 0.35)", backdropFilter: "blur(2px)", height: "100dvh" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fade-up my-auto w-full max-w-sm overflow-y-auto rounded-[22px] p-6" style={{ background: "var(--surface)", boxShadow: "var(--shadow)", maxHeight: "calc(100dvh - 2rem)" }}>
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[1.05rem] font-extrabold">
            <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--weight)" }} />
            Log weight
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--surface-2)", color: "var(--ink-faint)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="w-date" className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
              Date
            </label>
            <input
              ref={firstInputRef}
              id="w-date"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-[0.94rem] font-semibold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label htmlFor="w-weight" className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
              Weight (lb)
            </label>
            <input
              id="w-weight"
              type="number"
              step="0.1"
              min="0"
              inputMode="decimal"
              placeholder="180.2"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-[0.94rem] font-semibold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>

          {error && (
            <p className="text-[0.82rem] font-semibold" style={{ color: "var(--status-critical)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving}
            className="mt-1 rounded-2xl py-3 text-[0.92rem] font-bold text-white transition-opacity disabled:opacity-50"
            style={{ background: "var(--weight)" }}
          >
            {saving ? "Saving…" : "Save weight"}
          </button>
        </form>
      </div>
    </div>
  );
}
