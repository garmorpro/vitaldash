"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { todayISO } from "@/lib/chart-math";

// A real page instead of a floating modal — deliberately. Fixed-position
// overlays have deep, inconsistent iOS Safari keyboard-handling bugs;
// normal in-flow pages don't, since the browser's native "scroll the
// focused field into view above the keyboard" behavior just works there.
export default function LogWeightPage() {
  const router = useRouter();
  const [date, setDate] = useState(todayISO());
  const [weightLbs, setWeightLbs] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!weightLbs) {
      setError("Enter a weight.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, weightLbs: Number(weightLbs) }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Something went wrong saving that entry.");
      }
      router.push("/");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong saving that entry.");
      setSaving(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6" style={{ background: "var(--ground)" }}>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="flex items-center gap-2 text-[1.15rem] font-extrabold">
          <span className="h-[10px] w-[10px] rounded-full" style={{ background: "var(--weight)" }} />
          Log weight
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
          <label htmlFor="w-date" className="text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
            Date
          </label>
          <input
            ref={firstInputRef}
            id="w-date"
            type="date"
            value={date}
            max={todayISO()}
            onChange={(e) => setDate(e.target.value)}
            className="w-full min-w-0 rounded-xl px-4 py-3 text-[1rem] font-semibold"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="w-weight" className="text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
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
            className="w-full rounded-xl px-4 py-3 text-[1rem] font-semibold"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
          />
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
          style={{ background: "var(--weight)" }}
        >
          {saving ? "Saving…" : "Save weight"}
        </button>
      </form>
    </div>
  );
}
