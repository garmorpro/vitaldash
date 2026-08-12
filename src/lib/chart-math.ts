// Shared geometry + formatting helpers for the sparkline, trend chart, bar
// chart, and steps dial. Kept framework-agnostic (pure functions) so each
// chart component just maps data through these.

export type Point = [number, number];

// Rounded to 3 decimals: raw Math.cos/sin output can differ by a single
// float ULP between server (Node) and client (browser) engines, which is
// enough to fail React's SSR hydration check on numeric SVG attributes.
export function polar(cx: number, cy: number, r: number, angleDeg: number): Point {
  const a = ((angleDeg - 90) * Math.PI) / 180;
  const x = Math.round((cx + r * Math.cos(a)) * 1000) / 1000;
  const y = Math.round((cy + r * Math.sin(a)) * 1000) / 1000;
  return [x, y];
}

/** SVG arc path (as a stroke, not a filled wedge) from startAngle to endAngle. */
export function arcPath(cx: number, cy: number, r: number, startAngle: number, endAngle: number): string {
  const s = polar(cx, cy, r, endAngle);
  const e = polar(cx, cy, r, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;
  return `M${s[0].toFixed(2)},${s[1].toFixed(2)} A${r},${r} 0 ${largeArc} 0 ${e[0].toFixed(2)},${e[1].toFixed(2)}`;
}

export function buildLinePath(values: number[], w: number, h: number, padding = 6) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const points: Point[] = values.map((v, i) => {
    const x = padding + (i / Math.max(1, values.length - 1)) * (w - padding * 2);
    const y = h - padding - ((v - min) / range) * (h - padding * 2);
    return [x, y];
  });
  const line = "M" + points.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" L");
  const area = `${line} L${points[points.length - 1][0].toFixed(1)},${h} L${points[0][0].toFixed(1)},${h} Z`;
  return { points, line, area, min, max };
}

export function fmtDateShort(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function fmtDateFull(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" });
}

// Deliberately NOT toISOString().slice(0, 10) — that returns the UTC
// calendar date, which drifts a day off from "today" for anyone west of
// UTC once local evening arrives. Build the date from local components
// instead so it always matches the phone/browser's actual calendar day.
export function todayISO() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
