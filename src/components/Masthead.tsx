"use client";

import { useRouter } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

export default function Masthead() {
  const router = useRouter();
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
        <button
          type="button"
          onClick={() => router.push("/account")}
          aria-label="Account"
          className="flex h-9 w-9 items-center justify-center rounded-full"
          style={{ background: "var(--surface)", color: "var(--ink-muted)", boxShadow: "var(--shadow)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
            <circle cx="12" cy="8" r="3.5" />
            <path d="M4.5 20c1.4-3.4 4.3-5.2 7.5-5.2s6.1 1.8 7.5 5.2" />
          </svg>
        </button>
        <ThemeToggle />
      </div>
    </header>
  );
}
