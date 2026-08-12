"use client";

import { useEffect, useRef, useState } from "react";
import type { SaveInput } from "@/hooks/useEntries";
import { todayISO } from "@/lib/chart-math";

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

export default function BpModal({
  onClose,
  onSave,
}: {
  onClose: () => void;
  onSave: (input: SaveInput) => Promise<void>;
}) {
  const [date, setDate] = useState(todayISO());
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
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
    if (!systolic || !diastolic) {
      setError("Enter systolic and diastolic.");
      return;
    }
    setSaving(true);
    try {
      await onSave({
        date,
        systolic: Number(systolic),
        diastolic: Number(diastolic),
        pulse: pulse ? Number(pulse) : null,
      });
      onClose();
    } catch {
      setError("Something went wrong saving that reading.");
    } finally {
      setSaving(false);
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
        <div className="mb-5 flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-[1.05rem] font-extrabold">
            <span className="h-[9px] w-[9px] rounded-full" style={{ background: "var(--bp)" }} />
            Log blood pressure
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
            <label htmlFor="b-date" className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
              Date
            </label>
            <input
              ref={firstInputRef}
              id="b-date"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              onFocus={handleFocusScroll}
              className="w-full rounded-xl px-3.5 py-2.5 text-[0.94rem] font-semibold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>

          <div className="grid grid-cols-3 gap-2.5">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="b-sys" className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
                Systolic
              </label>
              <input
                id="b-sys"
                type="number"
                step="1"
                min="0"
                inputMode="numeric"
                placeholder="118"
                value={systolic}
                onChange={(e) => setSystolic(e.target.value)}
                onFocus={handleFocusScroll}
                className="w-full rounded-xl px-3 py-2.5 text-[0.94rem] font-semibold"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="b-dia" className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
                Diastolic
              </label>
              <input
                id="b-dia"
                type="number"
                step="1"
                min="0"
                inputMode="numeric"
                placeholder="76"
                value={diastolic}
                onChange={(e) => setDiastolic(e.target.value)}
                onFocus={handleFocusScroll}
                className="w-full rounded-xl px-3 py-2.5 text-[0.94rem] font-semibold"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)" }}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="b-pulse" className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
                Pulse
              </label>
              <input
                id="b-pulse"
                type="number"
                step="1"
                min="0"
                inputMode="numeric"
                placeholder="68"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                onFocus={handleFocusScroll}
                className="w-full rounded-xl px-3 py-2.5 text-[0.94rem] font-semibold"
                style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)" }}
              />
            </div>
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
            style={{ background: "var(--bp)" }}
          >
            {saving ? "Saving…" : "Save reading"}
          </button>
        </form>
      </div>
    </div>
  );
}
