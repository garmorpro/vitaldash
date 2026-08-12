"use client";

import type { Entry } from "@/hooks/useEntries";
import { arcPath, polar, todayISO } from "@/lib/chart-math";

export const STEPS_GOAL = 8000;

export default function StepsDialCard({ entries }: { entries: Entry[] }) {
  const today = entries.find((e) => e.date === todayISO());
  const steps = today?.steps ?? 0;
  const hasData = today?.steps != null;

  const cx = 100;
  const cy = 100;
  const r = 78;
  const startA = -130;
  const endA = 130;
  const pct = Math.max(0, Math.min(1.06, steps / STEPS_GOAL));
  const progEnd = startA + pct * (endA - startA);
  const goalHit = hasData && steps >= STEPS_GOAL;
  const pctLabel = Math.round((steps / STEPS_GOAL) * 100);

  const ticks = Array.from({ length: 25 }, (_, i) => i);

  return (
    <article
      className="fade-up flex flex-col items-center gap-3.5 rounded-[3px] border p-5 text-center sm:p-6"
      style={{ background: "var(--surface)", borderColor: "var(--border)", animationDelay: "0.08s" }}
    >
      <span className="w-full text-[0.68rem] font-semibold uppercase tracking-[0.14em]" style={{ color: "var(--ink-faint)" }}>
        Steps · today
      </span>

      <div className="relative mx-auto w-full max-w-[210px]">
        <svg viewBox="0 0 200 160" className="block h-auto w-full">
          {ticks.map((i) => {
            const a = startA + (i / 24) * (endA - startA);
            const major = i % 4 === 0;
            const p1 = polar(cx, cy, r + 6, a);
            const p2 = polar(cx, cy, r + (major ? 13 : 9), a);
            return (
              <line
                key={i}
                x1={p1[0]}
                y1={p1[1]}
                x2={p2[0]}
                y2={p2[1]}
                stroke="var(--border-strong)"
                strokeWidth={major ? 1.6 : 1}
              />
            );
          })}
          <path d={arcPath(cx, cy, r, startA, endA)} fill="none" stroke="var(--surface-3)" strokeWidth="10" strokeLinecap="round" />
          {pct > 0 && (
            <path d={arcPath(cx, cy, r, startA, progEnd)} fill="none" stroke="var(--steps)" strokeWidth="10" strokeLinecap="round" />
          )}
        </svg>

        <div className="absolute left-1/2 top-[54%] flex -translate-x-1/2 -translate-y-1/2 flex-col items-center gap-0.5">
          <span className="display mono text-[clamp(1.6rem,5vw,1.9rem)] leading-none" style={{ fontVariantNumeric: "tabular-nums" }}>
            {steps.toLocaleString()}
          </span>
          {!hasData ? (
            <span className="mono text-[0.72rem]" style={{ color: "var(--ink-muted)" }}>
              No steps yet today
            </span>
          ) : goalHit ? (
            <span className="inline-flex items-center gap-1 text-[0.72rem]" style={{ color: "var(--steps-strong)" }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="h-[11px] w-[11px]">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Goal reached · {pctLabel}%
            </span>
          ) : (
            <span className="mono text-[0.72rem]" style={{ color: "var(--ink-muted)" }}>
              of {STEPS_GOAL.toLocaleString()} goal · {pctLabel}%
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
