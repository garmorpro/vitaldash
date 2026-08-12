"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { todayISO } from "@/lib/chart-math";

export default function LogBpPage() {
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [systolic, setSystolic] = useState("");
  const [diastolic, setDiastolic] = useState("");
  const [pulse, setPulse] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!systolic || !diastolic) {
      setError("Enter systolic and diastolic.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          systolic: Number(systolic),
          diastolic: Number(diastolic),
          pulse: pulse ? Number(pulse) : null,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong saving that reading.");
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong saving that reading.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6" style={{ background: "var(--ground)" }}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-[1.15rem] font-extrabold">
          <span className="h-[10px] w-[10px] rounded-full" style={{ background: "var(--bp)" }} />
          Log blood pressure
        </h1>
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: "var(--surface-2)", color: "var(--ink-faint)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex min-w-0 flex-col gap-4">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="b-date" className="text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
            Date
          </label>
          {/* iOS Safari's native date control ignores a percentage width and
              renders at its own intrinsic size, which is wider than this
              field. Taking it out of flow with absolute positioning inside a
              fixed-size, overflow-hidden box forces it into the same
              footprint as the other inputs instead of pushing the page wide. */}
          <div
            className="relative h-12 w-full min-w-0 overflow-hidden rounded-xl"
            style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
          >
            <input
              ref={firstInputRef}
              id="b-date"
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="absolute inset-0 h-full w-full appearance-none border-none bg-transparent px-4 text-[1rem] font-semibold outline-none"
              style={{ color: "var(--ink)" }}
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="b-sys" className="text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
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
              className="w-full rounded-xl px-3 py-3 text-[1rem] font-semibold"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="b-dia" className="text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
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
              className="w-full rounded-xl px-3 py-3 text-[1rem] font-semibold"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="b-pulse" className="text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
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
              className="w-full rounded-xl px-3 py-3 text-[1rem] font-semibold"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>
        </div>

        {error && (
          <p className="text-[0.85rem] font-semibold" style={{ color: "var(--status-critical)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="mt-2 rounded-2xl py-3.5 text-[0.96rem] font-bold text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--bp)" }}
        >
          {saving ? "Saving…" : "Save reading"}
        </button>
      </form>
    </div>
  );
}
