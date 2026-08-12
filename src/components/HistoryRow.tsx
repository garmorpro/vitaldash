"use client";

import { useRef, useState } from "react";
import type { Entry } from "@/hooks/useEntries";
import { fmtDateShort } from "@/lib/chart-math";

const ACTIONS_WIDTH = 160; // px — two pill buttons + gap + edge padding

function WeightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[11px] w-[11px]">
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5M9 3h6" />
    </svg>
  );
}
function BpIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[11px] w-[11px]">
      <path d="M4 12h4l2-6 4 12 2-6h4" />
    </svg>
  );
}
function StepsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-[11px] w-[11px]">
      <path d="M5 20V13M12 20V9M19 20V5" />
    </svg>
  );
}

export default function HistoryRow({
  entry,
  onEdit,
  onDelete,
}: {
  entry: Entry;
  onEdit: (entry: Entry) => void;
  onDelete: (entry: Entry) => void;
}) {
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const revealedRef = useRef(false);
  const startXRef = useRef<number | null>(null);
  const baseXRef = useRef(0);

  function handleTouchStart(e: React.TouchEvent) {
    startXRef.current = e.touches[0].clientX;
    baseXRef.current = revealedRef.current ? -ACTIONS_WIDTH : 0;
    setDragging(true);
  }
  function handleTouchMove(e: React.TouchEvent) {
    if (startXRef.current == null) return;
    const delta = e.touches[0].clientX - startXRef.current;
    const next = Math.min(0, Math.max(-ACTIONS_WIDTH, baseXRef.current + delta));
    setDragX(next);
  }
  function handleTouchEnd() {
    startXRef.current = null;
    setDragging(false);
    const shouldReveal = dragX < -ACTIONS_WIDTH / 2;
    revealedRef.current = shouldReveal;
    setDragX(shouldReveal ? -ACTIONS_WIDTH : 0);
  }

  // Swipe-only — tapping the row does nothing except close an already
  // revealed row. Edit only happens via the revealed Edit pill.
  function handleRowClick() {
    if (revealedRef.current) {
      revealedRef.current = false;
      setDragX(0);
    }
  }

  const pills: { text: string; icon: React.ReactNode; bg: string; fg: string }[] = [];
  if (entry.weightLbs != null) {
    pills.push({ text: `${entry.weightLbs.toFixed(1)} lb`, icon: <WeightIcon />, bg: "var(--weight-soft)", fg: "var(--weight-strong)" });
  }
  if (entry.systolic != null) {
    pills.push({ text: `${entry.systolic}/${entry.diastolic}`, icon: <BpIcon />, bg: "var(--bp-soft)", fg: "var(--bp-strong)" });
  }
  if (entry.steps != null) {
    pills.push({ text: entry.steps.toLocaleString(), icon: <StepsIcon />, bg: "var(--steps-soft)", fg: "var(--steps-strong)" });
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-y-0 right-0 flex items-center gap-2 pr-2" style={{ width: ACTIONS_WIDTH }}>
        <button
          type="button"
          onClick={() => {
            revealedRef.current = false;
            setDragX(0);
            onEdit(entry);
          }}
          className="flex h-10 flex-1 items-center justify-center rounded-full text-[0.8rem] font-bold text-white"
          style={{ background: "var(--weight)" }}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => {
            revealedRef.current = false;
            setDragX(0);
            onDelete(entry);
          }}
          className="flex h-10 flex-1 items-center justify-center rounded-full text-[0.8rem] font-bold text-white"
          style={{ background: "var(--status-critical)" }}
        >
          Delete
        </button>
      </div>

      <div
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleRowClick}
        className="relative flex items-start justify-between gap-2.5 rounded-2xl px-3 py-3"
        style={{
          background: "var(--surface)",
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
      >
        <span className="mt-[3px] shrink-0 text-[0.78rem] font-bold" style={{ color: "var(--ink-muted)" }}>
          {fmtDateShort(entry.date)}
        </span>
        <span className="tabular flex flex-1 flex-wrap justify-end gap-1.5">
          {pills.length === 0 ? (
            <span className="mt-[3px] text-[0.78rem] font-medium" style={{ color: "var(--ink-faint)" }}>
              No data
            </span>
          ) : (
            pills.map((p, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-[3px] text-[0.76rem] font-bold"
                style={{ background: p.bg, color: p.fg }}
              >
                {p.icon}
                {p.text}
              </span>
            ))
          )}
        </span>
      </div>
    </div>
  );
}
