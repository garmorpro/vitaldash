"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "vitaldash-theme";

function applyTheme(theme: "light" | "dark" | null) {
  const root = document.documentElement;
  if (theme) {
    root.setAttribute("data-theme", theme);
  } else {
    root.removeAttribute("data-theme");
  }
}

export default function ThemeToggle() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");

    function init() {
      const stored = localStorage.getItem(STORAGE_KEY) as "light" | "dark" | null;
      const dark = stored ? stored === "dark" : mq.matches;
      setIsDark(dark);
      if (stored) applyTheme(stored);
    }
    init();

    const onChange = () => {
      if (!localStorage.getItem(STORAGE_KEY)) setIsDark(mq.matches);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  function toggle() {
    const next = !isDark;
    setIsDark(next);
    localStorage.setItem(STORAGE_KEY, next ? "dark" : "light");
    applyTheme(next ? "dark" : "light");
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle color theme"
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors"
      style={{ borderColor: "var(--border-strong)", background: "var(--surface)" }}
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.6" strokeLinecap="round" className="h-4 w-4">
          <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4a6.8 6.8 0 0 0 10.5 10.5z" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="var(--ink-muted)" strokeWidth="1.6" strokeLinecap="round" className="h-4 w-4">
          <circle cx="12" cy="12" r="4.2" />
          <path d="M12 2.5v2.4M12 19.1v2.4M4.6 4.6l1.7 1.7M17.7 17.7l1.7 1.7M2.5 12h2.4M19.1 12h2.4M4.6 19.4l1.7-1.7M17.7 6.3l1.7-1.7" />
        </svg>
      )}
    </button>
  );
}
