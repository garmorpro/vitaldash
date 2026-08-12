"use client";

import type { Entry } from "@/hooks/useEntries";
import { bpStatus, type BpLevel } from "@/lib/chart-math";

const STATUS_ICON: Record<BpLevel, string> = {
  good: "M20 6L9 17l-5-5",
  warn: "M12 9v4M12 17h.01",
  critical: "M12 8v5M12 16h.01",
};

const STATUS_TOKEN: Record<BpLevel, { bg: string; fg: string }> = {
  good: { bg: "var(--status-good-soft)", fg: "var(--status-good)" },
  warn: { bg: "var(--status-warn-soft)", fg: "var(--status-warn)" },
  critical: { bg: "var(--status-critical-soft)", fg: "var(--status-critical)" },
};

export default function BpStatCard({ entries }: { entries: Entry[] }) {
  const bpEntries = entries
    .filter((e): e is Entry & { systolic: number; diastolic: number } => e.systolic != null && e.diastolic != null)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  if (bpEntries.length === 0) {
    return (
      <article
        className="fade-up flex flex-col gap-2 rounded-[var(--radius)] p-5"
        style={{ background: "var(--surface)", boxShadow: "var(--shadow)", animationDelay: "0.06s" }}
      >
        <span className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
          BLOOD PRESSURE
        </span>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          No readings yet — tap + to log one.
        </p>
      </article>
    );
  }

  const latest = bpEntries[bpEntries.length - 1];
  const status = bpStatus(latest.systolic, latest.diastolic);
  const token = STATUS_TOKEN[status.level];

  const sysVals = bpEntries.slice(-14).map((e) => e.systolic);
  const diaVals = bpEntries.slice(-14).map((e) => e.diastolic);
  const all = sysVals.concat(diaVals);
  const min = Math.min(...all);
  const max = Math.max(...all);
  const range = max - min || 1;
  const w = 280,
    h = 60,
    pad = 6;
  function toPts(vals: number[]) {
    return vals.map((v, i) => {
      const x = pad + (i / Math.max(1, vals.length - 1)) * (w - pad * 2);
      const y = h - pad - ((v - min) / range) * (h - pad * 2);
      return [x, y] as const;
    });
  }
  const sysPts = toPts(sysVals);
  const diaPts = toPts(diaVals);
  const lineOf = (pts: readonly (readonly [number, number])[]) =>
    "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
  const lastSys = sysPts[sysPts.length - 1];

  return (
    <article
      className="fade-up flex flex-col gap-2.5 rounded-[var(--radius)] p-5 sm:p-6"
      style={{ background: "var(--surface)", boxShadow: "var(--shadow)", animationDelay: "0.06s" }}
    >
      <span className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
        BLOOD PRESSURE
      </span>

      <div className="flex flex-wrap items-baseline gap-1.5">
        <span className="tabular text-[2.1rem] font-extrabold leading-none">
          {latest.systolic}/{latest.diastolic}
        </span>
        <span className="text-sm font-semibold" style={{ color: "var(--ink-muted)" }}>
          mmHg
        </span>
      </div>

      <span
        className="inline-flex w-fit items-center gap-1 rounded-full py-[4px] pl-[8px] pr-[10px] text-[0.76rem] font-bold"
        style={{ background: token.bg, color: token.fg }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="h-2.5 w-2.5">
          <path d={STATUS_ICON[status.level]} />
          {status.level !== "good" && <circle cx="12" cy="12" r="9" />}
        </svg>
        {status.label}
      </span>

      {latest.pulse != null && (
        <div className="text-[0.78rem]" style={{ color: "var(--ink-faint)" }}>
          Pulse {latest.pulse} bpm
        </div>
      )}

      <svg viewBox="0 0 280 60" preserveAspectRatio="none" className="mt-0.5 h-auto w-full overflow-visible" aria-hidden="true">
        <path d={lineOf(diaPts)} fill="none" stroke="var(--bp)" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d={lineOf(sysPts)} fill="none" stroke="var(--bp)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={lastSys[0]} cy={lastSys[1]} r="5" fill="var(--surface)" stroke="var(--bp)" strokeWidth="2.5" />
      </svg>
    </article>
  );
}
