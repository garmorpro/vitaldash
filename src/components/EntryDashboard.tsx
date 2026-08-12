"use client";

import { useState } from "react";
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
import EditEntryModal from "./EditEntryModal";

export default function EntryDashboard() {
  const { entries, loading, error, saveEntry, deleteEntry } = useEntries();
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null);

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
        <HistoryTable entries={entries} loading={loading} onRowClick={setEditingEntry} />
      </main>

      <footer className="tabular pb-2 text-center text-[0.76rem] font-semibold" style={{ color: "var(--ink-faint)" }}>
        SELF-HOSTED <span className="mx-2 opacity-50">·</span> POSTGRES <span className="mx-2 opacity-50">·</span> PM2
      </footer>

      <EntryFab onSave={saveEntry} />

      {editingEntry && (
        <EditEntryModal entry={editingEntry} onClose={() => setEditingEntry(null)} onSave={saveEntry} onDelete={deleteEntry} />
      )}
    </div>
  );
}
