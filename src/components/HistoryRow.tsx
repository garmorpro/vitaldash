"use client";

import { useRef, useState } from "react";
import type { Entry } from "@/hooks/useEntries";
import { fmtDateShort } from "@/lib/chart-math";

const ACTIONS_WIDTH = 144; // px, two 72px buttons

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

  function handleRowClick() {
    if (revealedRef.current) {
      revealedRef.current = false;
      setDragX(0);
      return;
    }
    onEdit(entry);
  }

  const parts: { text: string; color: string }[] = [];
  if (entry.weightLbs != null) parts.push({ text: `${entry.weightLbs.toFixed(1)} lb`, color: "var(--weight-strong)" });
  if (entry.systolic != null) parts.push({ text: `${entry.systolic}/${entry.diastolic} mmHg`, color: "var(--bp-strong)" });
  if (entry.steps != null) parts.push({ text: `${entry.steps.toLocaleString()} steps`, color: "var(--steps-strong)" });

  return (
    <div className="relative overflow-hidden rounded-2xl">
      <div className="absolute inset-y-0 right-0 flex" style={{ width: ACTIONS_WIDTH }}>
        <button
          type="button"
          onClick={() => {
            revealedRef.current = false;
            setDragX(0);
            onEdit(entry);
          }}
          className="flex w-[72px] items-center justify-center text-[0.8rem] font-bold text-white"
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
          className="flex w-[72px] items-center justify-center text-[0.8rem] font-bold text-white"
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
        className="relative flex cursor-pointer items-center justify-between gap-3 rounded-2xl px-3 py-3"
        style={{
          background: "var(--surface)",
          transform: `translateX(${dragX}px)`,
          transition: dragging ? "none" : "transform 0.2s ease",
        }}
      >
        <span className="shrink-0 text-[0.82rem] font-semibold" style={{ color: "var(--ink-muted)" }}>
          {fmtDateShort(entry.date)}
        </span>
        <span className="tabular flex flex-wrap justify-end gap-x-2 gap-y-0.5 text-right text-[0.82rem] font-bold">
          {parts.length === 0 ? (
            <span style={{ color: "var(--ink-faint)", fontWeight: 500 }}>No data</span>
          ) : (
            parts.map((p, i) => (
              <span key={i} style={{ color: p.color }}>
                {p.text}
              </span>
            ))
          )}
        </span>
      </div>
    </div>
  );
}
