"use client";

import { useState } from "react";
import type { Entry } from "@/hooks/useEntries";
import { fmtDateFull, fmtDateShort } from "@/lib/chart-math";
import { STEPS_GOAL } from "./StepsDialCard";

export default function StepsChart({ entries }: { entries: Entry[] }) {
  const stepEntries = entries
    .filter((e): e is Entry & { steps: number } => e.steps != null)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-7);

  const [hover, setHover] = useState<number | null>(null);

  const w = 720;
  const h = 190;
  const padL = 40;
  const padR = 12;
  const padT = 14;
  const padB = 24;

  if (stepEntries.length === 0) {
    return (
      <section className="fade-up rounded-[var(--radius)] p-5 sm:p-6" style={{ background: "var(--surface)", boxShadow: "var(--shadow)", animationDelay: "0.18s" }}>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="text-[1rem] font-bold">Steps</h2>
        </div>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          No step entries yet.
        </p>
      </section>
    );
  }

  const max = Math.max(STEPS_GOAL * 1.1, Math.max(...stepEntries.map((e) => e.steps)) * 1.08);
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;
  const slot = innerW / stepEntries.length;
  const barW = Math.min(42, slot * 0.48);
  const yFor = (v: number) => padT + innerH - (v / max) * innerH;
  const goalY = yFor(STEPS_GOAL);
  const gridVals = [0, 0.5, 1].map((fr) => max * fr);

  const hoverEntry = hover != null ? stepEntries[hover] : null;

  return (
    <section className="fade-up rounded-[var(--radius)] p-5 sm:p-6" style={{ background: "var(--surface)", boxShadow: "var(--shadow)", animationDelay: "0.18s" }}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="text-[1rem] font-bold">
          Steps <span className="text-[0.82rem] font-medium" style={{ color: "var(--ink-faint)" }}>· last {stepEntries.length} days</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <div className="relative" style={{ minWidth: 520 }}>
          <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block h-auto w-full overflow-visible">
            {gridVals.map((val, g) => (
              <g key={g}>
                <line x1={padL} y1={yFor(val)} x2={w - padR} y2={yFor(val)} className="grid-line" />
                <text x={0} y={yFor(val) + 3} className="axis-label">
                  {val >= 1000 ? `${(val / 1000).toFixed(1)}k` : Math.round(val)}
                </text>
              </g>
            ))}

            <line x1={padL} y1={goalY} x2={w - padR} y2={goalY} stroke="var(--ink-faint)" strokeWidth="1" strokeDasharray="2,4" />

            {stepEntries.map((e, i) => {
              const cx = padL + slot * i + slot / 2;
              const barY = yFor(e.steps);
              const barH = Math.max(padT + innerH - barY, 2);
              const hit = e.steps >= STEPS_GOAL;
              return (
                <g key={e.date}>
                  <rect
                    x={cx - barW / 2}
                    y={barY}
                    width={barW}
                    height={barH}
                    rx={10}
                    ry={10}
                    fill="var(--steps)"
                    opacity={hit ? 1 : 0.55}
                    onMouseEnter={() => setHover(i)}
                    onMouseLeave={() => setHover(null)}
                  />
                  <text x={cx} y={h - 6} className="axis-label" textAnchor="middle">
                    {fmtDateShort(e.date)}
                  </text>
                </g>
              );
            })}
          </svg>

          {hoverEntry && (
            <div
              className="tabular pointer-events-none absolute z-10 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[0.74rem] leading-snug"
              style={{
                background: "var(--ink)",
                color: "var(--surface)",
                left: `${((padL + slot * hover! + slot / 2) / w) * 100}%`,
                top: `${(yFor(hoverEntry.steps) / h) * 100}%`,
                transform: "translate(-50%, -132%)",
              }}
            >
              <span className="block text-[0.66rem] font-semibold opacity-65">{fmtDateFull(hoverEntry.date)}</span>
              <span className="font-extrabold">{hoverEntry.steps.toLocaleString()} steps</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
