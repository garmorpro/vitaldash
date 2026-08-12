"use client";

import type { Entry } from "@/hooks/useEntries";
import { fmtDateFull } from "@/lib/chart-math";
import HistoryRow from "./HistoryRow";

export default function HistoryTable({
  entries,
  loading,
  onRowClick,
  onDelete,
}: {
  entries: Entry[];
  loading: boolean;
  onRowClick: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
}) {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <section className="fade-up rounded-[var(--radius)] p-5 sm:p-6" style={{ background: "var(--surface)", boxShadow: "var(--shadow)", animationDelay: "0.22s" }}>
      <div className="mb-1 flex items-baseline justify-between gap-3">
        <h2 className="text-[1rem] font-bold">History</h2>
        {sorted.length > 0 && (
          <span className="hidden text-[0.74rem] font-medium sm:inline" style={{ color: "var(--ink-faint)" }}>
            Tap a row to edit
          </span>
        )}
        {sorted.length > 0 && (
          <span className="text-[0.74rem] font-medium sm:hidden" style={{ color: "var(--ink-faint)" }}>
            Swipe left for actions
          </span>
        )}
      </div>

      {loading ? (
        <p className="mt-3 text-sm" style={{ color: "var(--ink-faint)" }}>
          Loading…
        </p>
      ) : sorted.length === 0 ? (
        <p className="mt-3 text-sm" style={{ color: "var(--ink-faint)" }}>
          No entries yet — tap + to log your first one.
        </p>
      ) : (
        <>
          {/* Mobile: swipeable rows (Edit / Delete revealed on swipe) */}
          <div className="mt-3 flex flex-col gap-2 sm:hidden">
            {sorted.map((e) => (
              <HistoryRow key={e.id} entry={e} onEdit={onRowClick} onDelete={onDelete} />
            ))}
          </div>

          {/* Desktop: full table */}
          <div className="mt-3 hidden overflow-x-auto sm:block">
            <table className="w-full text-[0.86rem]" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th className="pb-2.5 pr-2.5 text-left text-[0.68rem] font-bold uppercase tracking-[0.04em]" style={{ color: "var(--ink-faint)" }}>
                    Date
                  </th>
                  <th className="pb-2.5 pr-2.5 text-right text-[0.68rem] font-bold uppercase tracking-[0.04em]" style={{ color: "var(--ink-faint)" }}>
                    Weight
                  </th>
                  <th className="pb-2.5 pr-2.5 text-right text-[0.68rem] font-bold uppercase tracking-[0.04em]" style={{ color: "var(--ink-faint)" }}>
                    BP
                  </th>
                  <th className="pb-2.5 pr-2.5 text-right text-[0.68rem] font-bold uppercase tracking-[0.04em]" style={{ color: "var(--ink-faint)" }}>
                    Pulse
                  </th>
                  <th className="pb-2.5 text-right text-[0.68rem] font-bold uppercase tracking-[0.04em]" style={{ color: "var(--ink-faint)" }}>
                    Steps
                  </th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((e) => (
                  <tr
                    key={e.id}
                    onClick={() => onRowClick(e)}
                    className="cursor-pointer transition-colors"
                    onMouseEnter={(evt) => (evt.currentTarget.style.background = "var(--surface-2)")}
                    onMouseLeave={(evt) => (evt.currentTarget.style.background = "transparent")}
                  >
                    <td className="tabular rounded-l-lg py-2.5 pl-2 pr-2.5 font-medium" style={{ borderTop: "1px solid var(--border)", color: "var(--ink-muted)" }}>
                      {fmtDateFull(e.date)}
                    </td>
                    <td
                      className="tabular py-2.5 pr-2.5 text-right font-bold"
                      style={{ borderTop: "1px solid var(--border)", color: e.weightLbs != null ? "var(--weight-strong)" : "var(--ink-faint)" }}
                    >
                      {e.weightLbs != null ? e.weightLbs.toFixed(1) : "—"}
                    </td>
                    <td
                      className="tabular py-2.5 pr-2.5 text-right font-bold"
                      style={{ borderTop: "1px solid var(--border)", color: e.systolic != null ? "var(--bp-strong)" : "var(--ink-faint)" }}
                    >
                      {e.systolic != null ? `${e.systolic}/${e.diastolic}` : "—"}
                    </td>
                    <td className="tabular py-2.5 pr-2.5 text-right font-medium" style={{ borderTop: "1px solid var(--border)", color: "var(--ink-faint)" }}>
                      {e.pulse != null ? e.pulse : "—"}
                    </td>
                    <td
                      className="tabular rounded-r-lg py-2.5 pr-2 text-right font-bold"
                      style={{ borderTop: "1px solid var(--border)", color: e.steps != null ? "var(--steps-strong)" : "var(--ink-faint)" }}
                    >
                      {e.steps != null ? e.steps.toLocaleString() : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
