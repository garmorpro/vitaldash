import localFont from "next/font/local";

// Fraunces — the display face used (with restraint) for the wordmark, big
// stat numbers, and section headings. Self-hosted as static files so it's
// bundled at build time, not fetched from a CDN at runtime.
export const frauncesDisplay = localFont({
  src: [
    { path: "../fonts/fraunces-600.woff2", weight: "600", style: "normal" },
    { path: "../fonts/fraunces-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
});
