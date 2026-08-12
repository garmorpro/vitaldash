"use client";

import type { Entry } from "@/hooks/useEntries";
import { fmtDateFull } from "@/lib/chart-math";

export default function HistoryTable({ entries, loading }: { entries: Entry[]; loading: boolean }) {
  const sorted = [...entries].sort((a, b) => (a.date < b.date ? 1 : -1));

  return (
    <section className="fade-up rounded-[3px] border p-5 sm:p-6" style={{ background: "var(--surface)", borderColor: "var(--border)", animationDelay: "0.2s" }}>
      <div className="mb-4">
        <h2 className="display text-[1.05rem]">History</h2>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
          Loading…
        </p>
      ) : sorted.length === 0 ? (
        <p className="text-sm" style={{ color: "var(--ink-faint)" }}>
          No entries yet — tap the + button to log your first one.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[0.88rem]" style={{ borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th className="border-b pb-2.5 pr-2.5 text-left text-[0.68rem] font-semibold uppercase tracking-[0.1em]" style={{ borderColor: "var(--border-strong)", color: "var(--ink-faint)" }}>
                  Date
                </th>
                <th className="border-b pb-2.5 pr-2.5 text-right text-[0.68rem] font-semibold uppercase tracking-[0.1em]" style={{ borderColor: "var(--border-strong)", color: "var(--ink-faint)" }}>
                  Weight (lb)
                </th>
                <th className="border-b pb-2.5 text-right text-[0.68rem] font-semibold uppercase tracking-[0.1em]" style={{ borderColor: "var(--border-strong)", color: "var(--ink-faint)" }}>
                  Steps
                </th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((e) => (
                <tr key={e.id}>
                  <td className="mono border-b py-2.5 pr-2.5" style={{ borderColor: "var(--border)", color: "var(--ink-muted)", fontSize: "0.83rem" }}>
                    {fmtDateFull(e.date)}
                  </td>
                  <td
                    className="mono border-b py-2.5 pr-2.5 text-right font-semibold"
                    style={{ borderColor: "var(--border)", color: e.weightLbs != null ? "var(--weight-strong)" : "var(--ink-faint)" }}
                  >
                    {e.weightLbs != null ? e.weightLbs.toFixed(1) : "—"}
                  </td>
                  <td
                    className="mono border-b py-2.5 text-right font-semibold"
                    style={{ borderColor: "var(--border)", color: e.steps != null ? "var(--steps-strong)" : "var(--ink-faint)" }}
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
