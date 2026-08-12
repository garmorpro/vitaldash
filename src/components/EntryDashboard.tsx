"use client";

import { useEffect, useState } from "react";

type Entry = {
  id: string;
  date: string; // YYYY-MM-DD
  weightLbs: number | null;
  steps: number | null;
};

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export default function EntryDashboard() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(todayISO());
  const [weightLbs, setWeightLbs] = useState("");
  const [steps, setSteps] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadEntries() {
    const res = await fetch("/api/entries");
    const data = await res.json();
    setEntries(data);
    setLoading(false);
  }

  useEffect(() => {
    let ignore = false;

    async function run() {
      const res = await fetch("/api/entries");
      const data = await res.json();
      if (!ignore) {
        setEntries(data);
        setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!weightLbs && !steps) {
      setError("Enter a weight, step count, or both.");
      return;
    }

    setSaving(true);
    const res = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        date,
        weightLbs: weightLbs ? Number(weightLbs) : null,
        steps: steps ? Number(steps) : null,
      }),
    });
    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Something went wrong saving that entry.");
      return;
    }

    setWeightLbs("");
    setSteps("");
    await loadEntries();
  }

  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));
  const latest = sorted[0];

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-6 py-16">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">VitalDash</h1>
        <p className="mt-1 text-zinc-500 dark:text-zinc-400">
          Daily weight and steps, tracked in one place.
        </p>
      </header>

      {latest && (
        <div className="grid grid-cols-2 gap-4">
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Latest weight</p>
            <p className="mt-1 text-2xl font-semibold">
              {latest.weightLbs ? `${latest.weightLbs} lb` : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-zinc-200 p-4 dark:border-zinc-800">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Latest steps</p>
            <p className="mt-1 text-2xl font-semibold">
              {latest.steps != null ? latest.steps.toLocaleString() : "—"}
            </p>
          </div>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="flex flex-col gap-4 rounded-lg border border-zinc-200 p-5 dark:border-zinc-800"
      >
        <h2 className="font-medium">Log an entry</h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="flex flex-col gap-1 text-sm">
            Date
            <input
              type="date"
              value={date}
              max={todayISO()}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Weight (lb)
            <input
              type="number"
              step="0.1"
              min="0"
              placeholder="e.g. 172.4"
              value={weightLbs}
              onChange={(e) => setWeightLbs(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            Steps
            <input
              type="number"
              step="1"
              min="0"
              placeholder="e.g. 8500"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className="rounded-md border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
            />
          </label>
        </div>

        {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}

        <button
          type="submit"
          disabled={saving}
          className="self-start rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
        >
          {saving ? "Saving…" : "Save entry"}
        </button>
      </form>

      <section>
        <h2 className="mb-3 font-medium">History</h2>
        {loading ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : sorted.length === 0 ? (
          <p className="text-sm text-zinc-500">No entries yet — log your first one above.</p>
        ) : (
          <div className="overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-800">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left dark:bg-zinc-900">
                <tr>
                  <th className="px-4 py-2 font-medium">Date</th>
                  <th className="px-4 py-2 font-medium">Weight (lb)</th>
                  <th className="px-4 py-2 font-medium">Steps</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((entry) => (
                  <tr key={entry.id} className="border-t border-zinc-200 dark:border-zinc-800">
                    <td className="px-4 py-2">{entry.date}</td>
                    <td className="px-4 py-2">{entry.weightLbs ?? "—"}</td>
                    <td className="px-4 py-2">
                      {entry.steps != null ? entry.steps.toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
