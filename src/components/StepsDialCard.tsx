"use client";

import type { Entry } from "@/hooks/useEntries";
import { arcPath, todayISO } from "@/lib/chart-math";

export const STEPS_GOAL = 8000;

export default function StepsDialCard({ entries }: { entries: Entry[] }) {
  const today = entries.find((e) => e.date === todayISO());
  const steps = today?.steps ?? 0;
  const hasData = today?.steps != null;

  const cx = 100;
  const cy = 100;
  const r = 76;
  const startA = -120;
  const endA = 120;
  const pct = Math.max(0, Math.min(1, steps / STEPS_GOAL));
  const progEnd = startA + pct * (endA - startA);
  const goalHit = hasData && steps >= STEPS_GOAL;
  const pctLabel = Math.round((steps / STEPS_GOAL) * 100);

  return (
    <article
      className="fade-up flex flex-col items-center gap-2.5 rounded-[var(--radius)] p-5 text-center sm:p-6"
      style={{ background: "var(--surface)", boxShadow: "var(--shadow)", animationDelay: "0.1s" }}
    >
      <span className="w-full text-[0.72rem] font-bold" style={{ color: "var(--ink-faint)" }}>
        STEPS · TODAY
      </span>

      <div className="relative mx-auto mt-1 w-full max-w-[172px]">
        <svg viewBox="0 0 200 160" className="block h-auto w-full">
          <path d={arcPath(cx, cy, r, startA, endA)} fill="none" stroke="var(--surface-2)" strokeWidth="14" strokeLinecap="round" />
          {pct > 0 && (
            <path d={arcPath(cx, cy, r, startA, progEnd)} fill="none" stroke="var(--steps)" strokeWidth="14" strokeLinecap="round" />
          )}
        </svg>

        <div className="absolute left-1/2 top-[54%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5">
          <span className="tabular text-[1.55rem] font-extrabold leading-none">{steps.toLocaleString()}</span>
          {!hasData ? (
            <span className="text-[0.72rem] font-semibold" style={{ color: "var(--ink-muted)" }}>
              No steps yet
            </span>
          ) : goalHit ? (
            <span className="inline-flex items-center gap-1 text-[0.72rem] font-semibold" style={{ color: "var(--status-good)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" className="h-[11px] w-[11px]">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Goal reached
            </span>
          ) : (
            <span className="text-[0.72rem] font-semibold" style={{ color: "var(--ink-muted)" }}>
              {pctLabel}% of goal
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
