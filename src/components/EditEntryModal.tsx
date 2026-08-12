"use client";

import { useEffect, useRef, useState } from "react";
import type { Entry, SaveInput } from "@/hooks/useEntries";
import { fmtDateFull } from "@/lib/chart-math";

// Scrolls the just-focused field into view once the keyboard has had a
// moment to start animating in — more reliable across repeated opens than
// trying to precompute available height (dvh and visualViewport both
// proved flaky on iOS across repeat keyboard show/hide cycles).
function handleFocusScroll(e: React.FocusEvent<HTMLElement>) {
  const target = e.target;
  setTimeout(() => {
    target.scrollIntoView({ block: "center", behavior: "smooth" });
  }, 300);
}

export default function EditEntryModal({
  entry,
  onClose,
  onSave,
  onDelete,
}: {
  entry: Entry;
  onClose: () => void;
  onSave: (input: SaveInput) => Promise<void>;
  onDelete: (date: string) => Promise<void>;
}) {
  const [weightLbs, setWeightLbs] = useState(entry.weightLbs != null ? String(entry.weightLbs) : "");
  const [systolic, setSystolic] = useState(entry.systolic != null ? String(entry.systolic) : "");
  const [diastolic, setDiastolic] = useState(entry.diastolic != null ? String(entry.diastolic) : "");
  const [pulse, setPulse] = useState(entry.pulse != null ? String(entry.pulse) : "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
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
    if ((systolic && !diastolic) || (!systolic && diastolic)) {
      setError("Enter both systolic and diastolic, or neither.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        date: entry.date,
        weightLbs: weightLbs ? Number(weightLbs) : undefined,
        systolic: systolic ? Number(systolic) : undefined,
        diastolic: diastolic ? Number(diastolic) : undefined,
        pulse: pulse ? Number(pulse) : undefined,
      });
      onClose();
    } catch {
      setError("Something went wrong saving those changes.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!confirmingDelete) {
      setConfirmingDelete(true);
      return;
    }
    setDeleting(true);
    try {
      await onDelete(entry.date);
      onClose();
    } catch {
      setError("Something went wrong deleting this entry.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: "rgba(20, 40, 55, 0.35)", backdropFilter: "blur(2px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fade-up w-full max-w-sm overflow-y-auto rounded-[22px] p-6" style={{ background: "var(--surface)", boxShadow: "var(--shadow)", maxHeight: "85vh" }}>
        <div className="mb-1 flex items-center justify-between gap-3">
          <h2 className="text-[1.05rem] font-extrabold">Edit entry</h2>
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
        <p className="mb-5 text-[0.8rem] font-semibold" style={{ color: "var(--ink-faint)" }}>
          {fmtDateFull(entry.date)}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="e-weight" className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
              Weight (lb)
            </label>
            <input
              ref={firstInputRef}
              id="e-weight"
              type="number"
              step="0.1"
              min="0"
              inputMode="decimal"
              placeholder="Not logged"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              onFocus={handleFocusScroll}
              className="w-full rounded-xl px-3.5 py-2.5 text-[0.94rem] font-semibold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="e-sys" className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
                Systolic
              </label>
              <input
                id="e-sys"
                type="number"
                step="1"
                min="0"
                inputMode="numeric"
                placeholder="—"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                onFocus={handleFocusScroll}
                className="w-full rounded-xl px-3 py-2.5 text-[0.94rem] font-semibold"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="e-dia" className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
                Diastolic
              </label>
              <input
                id="e-dia"
                type="number"
                step="1"
                min="0"
                inputMode="numeric"
                placeholder="—"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                onFocus={handleFocusScroll}
                className="w-full rounded-xl px-3 py-2.5 text-[0.94rem] font-semibold"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="e-pulse" className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
                Pulse
              </label>
              <input
                id="e-pulse"
                type="number"
                step="1"
                min="0"
                inputMode="numeric"
                placeholder="—"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                onFocus={handleFocusScroll}
                className="w-full rounded-xl px-3 py-2.5 text-[0.94rem] font-semibold"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)" }}
              />
            </div>
          </div>

          {entry.steps != null && (
            <p className="text-[0.76rem]" style={{ color: "var(--ink-faint)" }}>
              Steps ({entry.steps.toLocaleString()}) sync automatically and aren&apos;t edited here.
            </p>
          )}

          {error && (
            <p className="text-[0.82rem] font-semibold" style={{ color: "var(--status-critical)" }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={saving || deleting}
            className="mt-1 rounded-2xl py-3 text-[0.92rem] font-bold text-white transition-opacity disabled:opacity-50"
            style={{ background: "var(--weight)" }}
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        </form>

        <button
          type="button"
          onClick={handleDelete}
          disabled={saving || deleting}
          className="mt-3 w-full rounded-2xl py-2.5 text-[0.86rem] font-bold transition-opacity disabled:opacity-50"
          style={{
            background: confirmingDelete ? "var(--status-critical-soft)" : "transparent",
            color: "var(--status-critical)",
          }}
        >
          {deleting ? "Deleting…" : confirmingDelete ? "Tap again to confirm delete" : "Delete this day's entry"}
        </button>
      </div>
    </div>
  );
}
