import { ImageResponse } from "next/og";

// Same V + heartbeat + footprint + sensor glyph as icon.svg, embedded as
// raw SVG inside the JSX tree — Satori passes through basic SVG
// primitives (path/rect/circle/ellipse), so the geometry matches exactly.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundImage: "linear-gradient(155deg, #182338 0%, #0A0F1A 100%)",
        }}
      >
        <svg width="150" height="150" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="leftLeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#3DDC97" />
              <stop offset="1" stopColor="#2563EB" />
            </linearGradient>
            <linearGradient id="rightLeg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#38BDF8" />
              <stop offset="1" stopColor="#1D4ED8" />
            </linearGradient>
          </defs>
          <path d="M30,26 L60,90" fill="none" stroke="url(#leftLeg)" strokeWidth="16" strokeLinecap="round" />
          <path d="M90,26 L60,90" fill="none" stroke="url(#rightLeg)" strokeWidth="16" strokeLinecap="round" />
          <path
            d="M15,72 L40,72 L48,58 L56,86 L64,66 L72,72 L105,72"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="4.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <ellipse cx="98" cy="93" rx="8" ry="12" fill="#3DDC97" transform="rotate(-14 98 93)" />
          <ellipse cx="96" cy="107" rx="5.5" ry="6.5" fill="#3DDC97" />
          <circle cx="93" cy="79" r="2.6" fill="#3DDC97" />
          <circle cx="99" cy="76" r="2.6" fill="#3DDC97" />
          <circle cx="105" cy="78" r="2.4" fill="#3DDC97" />
          <rect x="8" y="82" width="26" height="26" rx="7" fill="none" stroke="#FFFFFF" strokeWidth="3" />
          <path d="M21,89 q6,7 0,13 q-6,-6 0,-13 Z" fill="#3DDC97" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
