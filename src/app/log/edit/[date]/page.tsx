"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useEntries, type Entry } from "@/hooks/useEntries";
import { fmtDateFull } from "@/lib/chart-math";

export default function EditEntryPage() {
  const params = useParams<{ date: string }>();
  const date = params.date;
  const { entries, loading } = useEntries();

  if (loading) {
    return (
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6" style={{ background: "var(--ground)" }}>
        <p className="text-[0.9rem] font-semibold" style={{ color: "var(--ink-faint)" }}>
          Loading…
        </p>
      </div>
    );
  }

  const entry = entries.find((e) => e.date === date);

  // Keying by date forces a fresh mount (and fresh useState initializers)
  // whenever the target entry changes, instead of syncing prefill values
  // in via a setState-in-effect.
  return <EditEntryForm key={date} date={date} entry={entry} />;
}

function EditEntryForm({ date, entry }: { date: string; entry: Entry | undefined }) {
  const router = useRouter();
  const { saveEntry, deleteEntry } = useEntries();

  const [weightLbs, setWeightLbs] = useState(entry?.weightLbs != null ? String(entry.weightLbs) : "");
  const [systolic, setSystolic] = useState(entry?.systolic != null ? String(entry.systolic) : "");
  const [diastolic, setDiastolic] = useState(entry?.diastolic != null ? String(entry.diastolic) : "");
  const [pulse, setPulse] = useState(entry?.pulse != null ? String(entry.pulse) : "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmingDelete, setConfirmingDelete] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    firstInputRef.current?.focus();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if ((systolic && !diastolic) || (!systolic && diastolic)) {
      setError("Enter both systolic and diastolic, or neither.");
      return;
    }
    setSaving(true);
    try {
      await saveEntry({
        date,
        weightLbs: weightLbs ? Number(weightLbs) : undefined,
        systolic: systolic ? Number(systolic) : undefined,
        diastolic: diastolic ? Number(diastolic) : undefined,
        pulse: pulse ? Number(pulse) : undefined,
      });
      router.push("/");
    } catch {
      setError("Something went wrong saving those changes.");
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
      await deleteEntry(date);
      router.push("/");
    } catch {
      setError("Something went wrong deleting this entry.");
      setDeleting(false);
      setConfirmingDelete(false);
    }
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-5 py-6" style={{ background: "var(--ground)" }}>
      <div className="mb-1 flex items-center justify-between">
        <h1 className="text-[1.15rem] font-extrabold">Edit entry</h1>
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
      <p className="mb-6 text-[0.85rem] font-semibold" style={{ color: "var(--ink-faint)" }}>
        {fmtDateFull(date)}
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="e-weight" className="text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
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
            className="w-full rounded-xl px-4 py-3 text-[1rem] font-semibold"
            style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
          />
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="e-sys" className="text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
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
              className="w-full rounded-xl px-3 py-3 text-[1rem] font-semibold"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="e-dia" className="text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
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
              className="w-full rounded-xl px-3 py-3 text-[1rem] font-semibold"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="e-pulse" className="text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
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
              className="w-full rounded-xl px-3 py-3 text-[1rem] font-semibold"
              style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
          </div>
        </div>

        {entry?.steps != null && (
          <p className="text-[0.8rem]" style={{ color: "var(--ink-faint)" }}>
            Steps ({entry.steps.toLocaleString()}) sync automatically and aren&apos;t edited here.
          </p>
        )}

        {error && (
          <p className="text-[0.85rem] font-semibold" style={{ color: "var(--status-critical)" }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={saving || deleting}
          className="mt-2 rounded-2xl py-3.5 text-[0.96rem] font-bold text-white transition-opacity disabled:opacity-50"
          style={{ background: "var(--weight)" }}
        >
          {saving ? "Saving…" : "Save changes"}
        </button>
      </form>

      <button
        type="button"
        onClick={handleDelete}
        disabled={saving || deleting}
        className="mt-4 w-full rounded-2xl py-3 text-[0.9rem] font-bold transition-opacity disabled:opacity-50"
        style={{
          background: confirmingDelete ? "var(--status-critical-soft)" : "transparent",
          color: "var(--status-critical)",
        }}
      >
        {deleting ? "Deleting…" : confirmingDelete ? "Tap again to confirm delete" : "Delete this day's entry"}
      </button>
    </div>
  );
}
