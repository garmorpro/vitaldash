"use client";

import { useEntries } from "@/hooks/useEntries";
import Masthead from "./Masthead";
import WeightStatCard from "./WeightStatCard";
import StepsDialCard from "./StepsDialCard";
import WeightChart from "./WeightChart";
import StepsChart from "./StepsChart";
import HistoryTable from "./HistoryTable";
import EntryFab from "./EntryFab";

export default function EntryDashboard() {
  const { entries, loading, error, saveEntry } = useEntries();

  return (
    <div className="mx-auto flex w-full max-w-[960px] flex-col gap-7 px-6 py-10 sm:py-12">
      <Masthead />

      {error && (
        <div
          className="rounded-[3px] border px-4 py-3 text-sm"
          style={{ borderColor: "var(--border)", background: "var(--weight-soft)", color: "var(--weight-strong)" }}
        >
          {error}
        </div>
      )}

      <main className="flex flex-col gap-4">
        <section className="grid grid-cols-1 gap-4 sm:grid-cols-[1.15fr_1fr]">
          <WeightStatCard entries={entries} />
          <StepsDialCard entries={entries} />
        </section>

        <WeightChart entries={entries} />
        <StepsChart entries={entries} />
        <HistoryTable entries={entries} loading={loading} />
      </main>

      <footer className="mono pb-2 text-center text-[0.72rem]" style={{ color: "var(--ink-faint)" }}>
        SELF-HOSTED <span className="mx-2 opacity-50">·</span> POSTGRES <span className="mx-2 opacity-50">·</span> PM2
      </footer>

      <EntryFab onSave={saveEntry} />
    </div>
  );
}
