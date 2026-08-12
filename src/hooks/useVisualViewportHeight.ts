"use client";

import { useEffect, useState } from "react";

// CSS `dvh` is supposed to track the visible area (shrinking when the
// on-screen keyboard opens), but iOS Safari has a known bug where it
// doesn't reliably recompute on repeat keyboard show/hide cycles — works
// the first time, then reports a stale value. Reading window.visualViewport
// directly in JS doesn't have that problem, so modals use this instead of
// a `dvh`-based max-height.
export function useVisualViewportHeight() {
  const [height, setHeight] = useState<number | null>(null);

  useEffect(() => {
    const vv = typeof window !== "undefined" ? window.visualViewport : null;

    function update() {
      setHeight(vv ? vv.height : window.innerHeight);
    }

    update();

    if (vv) {
      vv.addEventListener("resize", update);
      vv.addEventListener("scroll", update);
      return () => {
        vv.removeEventListener("resize", update);
        vv.removeEventListener("scroll", update);
      };
    }

    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  return height;
}
