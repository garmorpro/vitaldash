"use client";

import { useRef, useState } from "react";
import type { Entry } from "@/hooks/useEntries";
import { fmtDateFull, fmtDateShort } from "@/lib/chart-math";

export default function WeightChart({ entries }: { entries: Entry[] }) {
  const weightEntries = entries
    .filter((e): e is Entry & { weightLbs: number } => e.weightLbs != null)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-14);

  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const w = 720;
  const h = 220;
  const padL = 40;
  const padR = 12;
  const padT = 16;
  const padB = 26;

  if (weightEntries.length < 2) {
    return (
      <section className="fade-up rounded-[3px] border p-5 sm:p-6" style={{ background: "var(--surface)", borderColor: "var(--border)" }}>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="display text-[1.05rem]">Weight</h2>
        </div>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Log a few more days to see your trend here.
        </p>
      </section>
    );
  }

  const values = weightEntries.map((e) => e.weightLbs);
  const min = Math.floor(Math.min(...values) - 0.6);
  const max = Math.ceil(Math.max(...values) + 0.6);
  const range = max - min || 1;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const xFor = (i: number) => padL + (i / (weightEntries.length - 1)) * innerW;
  const yFor = (v: number) => padT + innerH - ((v - min) / range) * innerH;

  const points = weightEntries.map((e, i) => [xFor(i), yFor(e.weightLbs)] as const);
  const line = "M" + points.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${padT + innerH} L${points[0][0].toFixed(1)},${padT + innerH} Z`;

  const gridSteps = 3;
  const gridLines = Array.from({ length: gridSteps + 1 }, (_, g) => min + (range * g) / gridSteps);
  const xLabelIdxs = [0, Math.floor((weightEntries.length - 1) / 2), weightEntries.length - 1];

  function handleMove(evt: React.MouseEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const localX = ((evt.clientX - rect.left) / rect.width) * w;
    let i = Math.round(((localX - padL) / innerW) * (weightEntries.length - 1));
    i = Math.max(0, Math.min(weightEntries.length - 1, i));
    setHover(i);
    const [px, py] = points[i];
    setTooltipPos({ x: (px / w) * rect.width, y: (py / h) * rect.height });
  }

  const hoverEntry = hover != null ? weightEntries[hover] : null;

  return (
    <section className="fade-up rounded-[3px] border p-5 sm:p-6" style={{ background: "var(--surface)", borderColor: "var(--border)", animationDelay: "0.12s" }}>
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <h2 className="display text-[1.05rem]">
          Weight <span className="italic-accent text-[0.85rem]" style={{ color: "var(--ink-faint)" }}>· last {weightEntries.length} days</span>
        </h2>
      </div>

      <div className="overflow-x-auto">
        <div className="relative" style={{ minWidth: 520 }}>
          <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block h-auto w-full overflow-visible">
            {gridLines.map((val, g) => (
              <g key={g}>
                <line x1={padL} y1={yFor(val)} x2={w - padR} y2={yFor(val)} className="grid-line" />
                <text x={0} y={yFor(val) + 3} className="axis-label">
                  {val.toFixed(1)}
                </text>
              </g>
            ))}
            {xLabelIdxs.map((i) => (
              <text
                key={i}
                x={xFor(i)}
                y={h - 6}
                className="axis-label"
                textAnchor={i === 0 ? "start" : i === weightEntries.length - 1 ? "end" : "middle"}
              >
                {fmtDateShort(weightEntries[i].date)}
              </text>
            ))}

            <path d={area} fill="var(--weight-soft)" stroke="none" />
            <path d={line} fill="none" stroke="var(--weight)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

            {points.map(([x, y], i) => {
              const isLast = i === points.length - 1;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isLast ? 4.5 : 2.6}
                  fill={isLast ? "var(--surface)" : "var(--weight)"}
                  stroke={isLast ? "var(--weight)" : "none"}
                  strokeWidth={isLast ? 2 : 0}
                  opacity={isLast ? 1 : 0.55}
                />
              );
            })}

            {hover != null && (
              <line x1={points[hover][0]} y1={padT} x2={points[hover][0]} y2={padT + innerH} stroke="var(--ink-faint)" strokeWidth="1" strokeDasharray="3,3" />
            )}

            <rect
              x={padL}
              y={padT}
              width={innerW}
              height={innerH}
              fill="transparent"
              onMouseMove={handleMove}
              onMouseLeave={() => setHover(null)}
            />
          </svg>

          {hoverEntry && tooltipPos && (
            <div
              className="pointer-events-none absolute z-10 whitespace-nowrap rounded-[2px] px-2.5 py-1.5 text-[0.72rem] leading-snug"
              style={{
                background: "var(--ink)",
                color: "var(--ground)",
                left: tooltipPos.x,
                top: tooltipPos.y,
                transform: "translate(-50%, -130%)",
              }}
            >
              <span className="block text-[0.65rem] uppercase tracking-[0.06em] opacity-65">{fmtDateFull(hoverEntry.date)}</span>
              <span className="mono font-semibold">{hoverEntry.weightLbs.toFixed(1)} lb</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
