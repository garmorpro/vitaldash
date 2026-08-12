"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEntries, type Entry } from "@/hooks/useEntries";
import Masthead from "./Masthead";
import WeightStatCard from "./WeightStatCard";
import BpStatCard from "./BpStatCard";
import StepsDialCard from "./StepsDialCard";
import BpChart from "./BpChart";
import WeightChart from "./WeightChart";
import StepsChart from "./StepsChart";
import HistoryTable from "./HistoryTable";
import EntryFab from "./EntryFab";

export default function EntryDashboard() {
  const router = useRouter();
  const { entries, loading, error, deleteEntry } = useEntries();

  // Swipe-to-delete is already a deliberate two-step gesture (swipe, then
  // tap Delete), so it deletes immediately — no extra confirm dialog on
  // top of that, matching the native list pattern it's based on.
  const handleSwipeDelete = useCallback(
    (entry: Entry) => {
      deleteEntry(entry.date).catch(() => {});
    },
    [deleteEntry]
  );

  const handleRowClick = useCallback(
    (entry: Entry) => {
      router.push(`/log/edit/${entry.date}`);
    },
    [router]
  );

  return (
    <div className="mx-auto flex w-full max-w-[980px] flex-col gap-5 px-5 py-8 sm:py-10">
      <Masthead />

      {error && (
        <div
          className="rounded-2xl px-4 py-3 text-sm font-semibold"
          style={{ background: "var(--status-critical-soft)", color: "var(--status-critical)" }}
        >
          {error}
        </div>
      )}

      <main className="flex flex-col gap-4">
        <section className="grid grid-cols-1 gap-3.5 sm:grid-cols-2 lg:grid-cols-[1fr_1fr_0.85fr]">
          <WeightStatCard entries={entries} />
          <BpStatCard entries={entries} />
          <StepsDialCard entries={entries} />
        </section>

        <BpChart entries={entries} />
        <WeightChart entries={entries} />
        <StepsChart entries={entries} />
        <HistoryTable entries={entries} loading={loading} onRowClick={handleRowClick} onDelete={handleSwipeDelete} />
      </main>

      <footer className="tabular pb-2 text-center text-[0.76rem] font-semibold" style={{ color: "var(--ink-faint)" }}>
        SELF-HOSTED <span className="mx-2 opacity-50">·</span> POSTGRES <span className="mx-2 opacity-50">·</span> PM2
      </footer>

      <EntryFab />
    </div>
  );
}
