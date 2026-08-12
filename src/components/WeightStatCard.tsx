"use client";

import type { Entry } from "@/hooks/useEntries";
import { buildLinePath } from "@/lib/chart-math";

function daysBetween(a: string, b: string) {
  const msPerDay = 86400000;
  return Math.round((new Date(a + "T00:00:00").getTime() - new Date(b + "T00:00:00").getTime()) / msPerDay);
}

export default function WeightStatCard({ entries }: { entries: Entry[] }) {
  const weightEntries = entries
    .filter((e): e is Entry & { weightLbs: number } => e.weightLbs != null)
    .sort((a, b) => (a.date < b.date ? -1 : 1));

  if (weightEntries.length === 0) {
    return (
      <article
        className="fade-up flex flex-col gap-2 rounded-[var(--radius)] p-5"
        style={{ background: "var(--surface)", boxShadow: "var(--shadow)" }}
      >
        <span className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
          WEIGHT
        </span>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          No weight logged yet — tap + to log your first entry.
        </p>
      </article>
    );
  }

  const latest = weightEntries[weightEntries.length - 1];
  const targetIdx = [...weightEntries].reverse().find((e) => daysBetween(latest.date, e.date) >= 7);
  const sparkSource = weightEntries.slice(-14).map((e) => e.weightLbs);
  const { line, area, points } = buildLinePath(sparkSource, 280, 60);
  const last = points[points.length - 1];

  const delta = targetIdx ? latest.weightLbs - targetIdx.weightLbs : null;
  const arrowDown = delta != null && delta <= 0;

  return (
    <article
      className="fade-up flex flex-col gap-2.5 rounded-[var(--radius)] p-5 sm:p-6"
      style={{ background: "var(--surface)", boxShadow: "var(--shadow)" }}
    >
      <span className="text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
        WEIGHT
      </span>

      <div className="flex flex-wrap items-baseline gap-1.5">
        <span className="tabular text-[2.1rem] font-extrabold leading-none">{latest.weightLbs.toFixed(1)}</span>
        <span className="text-sm font-semibold" style={{ color: "var(--ink-muted)" }}>
          lb
        </span>
      </div>

      {delta != null && (
        <span
          className="inline-flex w-fit items-center gap-1 whitespace-nowrap rounded-full py-[4px] pl-[8px] pr-[10px] text-[0.76rem] font-bold"
          style={{ background: "var(--weight-soft)", color: "var(--weight-strong)" }}
        >
          <svg viewBox="0 0 10 10" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" className="h-2.5 w-2.5">
            {arrowDown ? <path d="M5 1.5v7M2 5.5l3 3 3-3" /> : <path d="M5 8.5v-7M2 4.5l3-3 3 3" />}
          </svg>
          {Math.abs(delta).toFixed(1)} lb / 7d
        </span>
      )}

      {targetIdx && (
        <div className="text-[0.78rem]" style={{ color: "var(--ink-faint)" }}>
          vs. {targetIdx.weightLbs.toFixed(1)} lb a week ago
        </div>
      )}

      <svg viewBox="0 0 280 60" preserveAspectRatio="none" className="mt-0.5 h-auto w-full overflow-visible" aria-hidden="true">
        <path d={area} fill="var(--weight-soft)" stroke="none" />
        <path d={line} fill="none" stroke="var(--weight)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx={last[0]} cy={last[1]} r="5" fill="var(--surface)" stroke="var(--weight)" strokeWidth="2.5" />
      </svg>
    </article>
  );
}
