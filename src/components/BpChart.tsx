"use client";

import { useRef, useState } from "react";
import type { Entry } from "@/hooks/useEntries";
import { fmtDateFull, fmtDateShort } from "@/lib/chart-math";

export default function BpChart({ entries }: { entries: Entry[] }) {
  const bpEntries = entries
    .filter((e): e is Entry & { systolic: number; diastolic: number } => e.systolic != null && e.diastolic != null)
    .sort((a, b) => (a.date < b.date ? -1 : 1))
    .slice(-14);

  const svgRef = useRef<SVGSVGElement>(null);
  const [hover, setHover] = useState<number | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);

  const w = 720;
  const h = 210;
  const padL = 30;
  const padR = 12;
  const padT = 14;
  const padB = 24;

  if (bpEntries.length < 2) {
    return (
      <section className="fade-up rounded-[var(--radius)] p-5 sm:p-6" style={{ background: "var(--surface)", boxShadow: "var(--shadow)" }}>
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <h2 className="text-[1rem] font-bold">Blood pressure</h2>
        </div>
        <p className="text-sm" style={{ color: "var(--ink-muted)" }}>
          Log a few more readings to see your trend here.
        </p>
      </section>
    );
  }

  const allVals = bpEntries.map((e) => e.systolic).concat(bpEntries.map((e) => e.diastolic));
  const min = Math.floor(Math.min(...allVals) / 5) * 5 - 5;
  const max = Math.ceil(Math.max(...allVals) / 5) * 5 + 5;
  const range = max - min || 1;
  const innerW = w - padL - padR;
  const innerH = h - padT - padB;

  const xFor = (i: number) => padL + (i / (bpEntries.length - 1)) * innerW;
  const yFor = (v: number) => padT + innerH - ((v - min) / range) * innerH;

  const sysPoints = bpEntries.map((e, i) => [xFor(i), yFor(e.systolic)] as const);
  const diaPoints = bpEntries.map((e, i) => [xFor(i), yFor(e.diastolic)] as const);
  const lineOf = (pts: readonly (readonly [number, number])[]) => "M" + pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");

  const gridLines = Array.from({ length: 4 }, (_, g) => min + (range * g) / 3);
  const xLabelIdxs = [0, Math.floor((bpEntries.length - 1) / 2), bpEntries.length - 1];

  function handleMove(evt: React.MouseEvent<SVGRectElement>) {
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const localX = ((evt.clientX - rect.left) / rect.width) * w;
    let i = Math.round(((localX - padL) / innerW) * (bpEntries.length - 1));
    i = Math.max(0, Math.min(bpEntries.length - 1, i));
    setHover(i);
    const [px, py] = sysPoints[i];
    setTooltipPos({ x: (px / w) * rect.width, y: (py / h) * rect.height });
  }

  const hoverEntry = hover != null ? bpEntries[hover] : null;

  return (
    <section className="fade-up rounded-[var(--radius)] p-5 sm:p-6" style={{ background: "var(--surface)", boxShadow: "var(--shadow)", animationDelay: "0.1s" }}>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h2 className="text-[1rem] font-bold">
          Blood pressure <span className="text-[0.82rem] font-medium" style={{ color: "var(--ink-faint)" }}>· last {bpEntries.length} readings</span>
        </h2>
      </div>
      <div className="mb-3 flex gap-4">
        <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold" style={{ color: "var(--ink-muted)" }}>
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--bp)" }} />
          Systolic
        </span>
        <span className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold" style={{ color: "var(--ink-muted)" }}>
          <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: "var(--bp)", opacity: 0.4 }} />
          Diastolic
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="relative" style={{ minWidth: 520 }}>
          <svg ref={svgRef} viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="block h-auto w-full overflow-visible">
            {gridLines.map((val, g) => (
              <g key={g}>
                <line x1={padL} y1={yFor(val)} x2={w - padR} y2={yFor(val)} className="grid-line" />
                <text x={0} y={yFor(val) + 3} className="axis-label">
                  {Math.round(val)}
                </text>
              </g>
            ))}
            {xLabelIdxs.map((i) => (
              <text
                key={i}
                x={xFor(i)}
                y={h - 6}
                className="axis-label"
                textAnchor={i === 0 ? "start" : i === bpEntries.length - 1 ? "end" : "middle"}
              >
                {fmtDateShort(bpEntries[i].date)}
              </text>
            ))}

            <path d={lineOf(diaPoints)} fill="none" stroke="var(--bp)" strokeOpacity="0.4" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d={lineOf(sysPoints)} fill="none" stroke="var(--bp)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

            {sysPoints.map(([x, y], i) => {
              const isLast = i === sysPoints.length - 1;
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={isLast ? 5 : 2.8}
                  fill={isLast ? "var(--surface)" : "var(--bp)"}
                  stroke={isLast ? "var(--bp)" : "none"}
                  strokeWidth={isLast ? 2.5 : 0}
                  opacity={isLast ? 1 : 0.6}
                />
              );
            })}

            {hover != null && (
              <line x1={sysPoints[hover][0]} y1={padT} x2={sysPoints[hover][0]} y2={padT + innerH} stroke="var(--ink-faint)" strokeWidth="1" strokeDasharray="3,3" />
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
              className="tabular pointer-events-none absolute z-10 whitespace-nowrap rounded-xl px-2.5 py-1.5 text-[0.74rem] leading-snug"
              style={{
                background: "var(--ink)",
                color: "var(--surface)",
                left: tooltipPos.x,
                top: tooltipPos.y,
                transform: "translate(-50%, -132%)",
              }}
            >
              <span className="block text-[0.66rem] font-semibold opacity-65">{fmtDateFull(hoverEntry.date)}</span>
              <span className="font-extrabold">
                {hoverEntry.systolic}/{hoverEntry.diastolic} mmHg
              </span>
              {hoverEntry.pulse != null && <span className="block font-semibold opacity-80">Pulse {hoverEntry.pulse} bpm</span>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
