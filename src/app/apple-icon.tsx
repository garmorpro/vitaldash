import { ImageResponse } from "next/og";

// Apple's home-screen icon convention needs an actual PNG — SVG isn't
// supported there, unlike the regular browser-tab favicon (icon.svg).
// Next.js renders this to a PNG at build time from JSX/CSS, so no
// external image tooling is needed.
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
          background: "#15171A",
        }}
      >
        <div
          style={{
            fontSize: 112,
            fontWeight: 700,
            color: "#BD7B2A",
            fontFamily: "Georgia, serif",
          }}
        >
          V
        </div>
      </div>
    ),
    { ...size }
  );
}
