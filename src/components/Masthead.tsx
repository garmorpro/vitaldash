"use client";

import ThemeToggle from "./ThemeToggle";

export default function Masthead() {
  const now = new Date();
  const day = now.toLocaleDateString("en-US", { weekday: "long" }).toUpperCase();
  const date = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 px-1 pb-2 pt-1">
      <div className="text-2xl font-extrabold tracking-tight">
        VitalDash<span style={{ color: "var(--weight)" }}>.</span>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right leading-tight">
          <span className="block text-[0.68rem] tracking-[0.06em]" style={{ color: "var(--ink-faint)" }}>
            {day}
          </span>
          <span className="block text-[0.85rem] font-semibold" style={{ color: "var(--ink-muted)" }}>
            {date}
          </span>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
}
