"use client";

import ThemeToggle from "./ThemeToggle";

export default function Masthead() {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" });
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <header
      className="flex flex-wrap items-end justify-between gap-5 border-b pb-5"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="flex flex-col gap-1.5">
        <div className="flex items-baseline gap-0.5 text-3xl sm:text-4xl">
          <span className="display">Vital</span>
          <span className="italic-accent">Dash</span>
          <span className="display" style={{ color: "var(--weight)" }}>.</span>
        </div>
        <div className="italic-accent text-sm" style={{ color: "var(--ink-muted)" }}>
          Daily weight and steps, kept in one instrument.
        </div>
      </div>

      <div className="flex items-center gap-3.5">
        <div className="mono text-right leading-tight">
          <span
            className="block text-[0.7rem] uppercase tracking-[0.12em]"
            style={{ color: "var(--ink-faint)" }}
          >
            {day}
          </span>
          <span className="block text-sm" style={{ color: "var(--ink-muted)" }}>
            {date}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
