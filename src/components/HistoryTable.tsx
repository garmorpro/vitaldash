"use client";

import type { Entry } from "@/hooks/useEntries";
import { fmtDateFull } from "@/lib/chart-math";

export default function HistoryTable({ entries, loading }: { entries: Entry[]; loading: boolean }) {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <section className="fade-up rounded-[var(--radius)] p-5 sm:p-6" style={{ background: "var(--surface)", boxShadow: "var(--shadow)", animationDelay: "0.22s" }}>
      <div className="mb-4">
        <h2 className="text-[1rem] font-bold">History</h2>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
          Loading…
        </p>
      ) : sorted.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
          No entries yet — tap + to log your first one.
        </p>
      ) : (
        <div className="overflow-x-auto">
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
                <tr key={e.id}>
                  <td className="tabular py-2.5 pr-2.5 font-medium" style={{ borderTop: "1px solid var(--border)", color: "var(--ink-muted)" }}>
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
                    className="tabular py-2.5 text-right font-bold"
                    style={{ borderTop: "1px solid var(--border)", color: e.steps != null ? "var(--steps-strong)" : "var(--ink-faint)" }}
                  >
                    {e.steps != null ? e.steps.toLocaleString() : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
