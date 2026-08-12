"use client";

import { useCallback, useEffect, useState } from "react";

export type Entry = {
  id: string;
  date: string; // YYYY-MM-DD
  weightLbs: number | null;
  steps: number | null;
};

export type SaveInput = {
  date: string;
  weightLbs?: number | null;
  steps?: number | null;
};

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch("/api/entries");
    if (!res.ok) throw new Error("Failed to load entries");
    const data = await res.json();
    setEntries(data);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function run() {
      try {
        const res = await fetch("/api/entries");
        if (!res.ok) throw new Error("Failed to load entries");
        const data = await res.json();
        if (!ignore) setEntries(data);
      } catch {
        if (!ignore) setError("Couldn't load entries — check the server connection.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    run();
    return () => {
      ignore = true;
    };
  }, []);

  const saveEntry = useCallback(
    async (input: SaveInput) => {
      setError(null);
      const res = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        const message = body.error ?? "Something went wrong saving that entry.";
        setError(message);
        throw new Error(message);
      }
      await reload();
    },
    [reload]
  );

  return { entries, loading, error, saveEntry, reload };
}
