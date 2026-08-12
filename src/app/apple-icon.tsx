import { ImageResponse } from "next/og";

// Same gauge-glyph as icon.svg, embedded as raw SVG inside the JSX tree —
// Satori (what ImageResponse renders with) passes through basic SVG
// primitives like path/line/circle, so the geometry can match exactly.
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
          backgroundImage: "linear-gradient(155deg, #232529 0%, #0a0b0c 100%)",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32">
          <defs>
            <linearGradient id="gold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F3CB8E" />
              <stop offset="0.55" stopColor="#D6A257" />
              <stop offset="1" stopColor="#9C6A2C" />
            </linearGradient>
          </defs>
          <path
            d="M23.66,22.43 A10,10 0 1 0 8.34,22.43"
            fill="none"
            stroke="url(#gold)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line x1="16" y1="16" x2="20" y2="9.07" stroke="url(#gold)" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="16" cy="16" r="1.7" fill="url(#gold)" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
