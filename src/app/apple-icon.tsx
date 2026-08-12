import { ImageResponse } from "next/og";

// Matches icon.svg's gold-medallion look. Satori (what ImageResponse
// renders with) doesn't reliably support gradient-fill text, so the ring
// gets the gradient and the monogram uses a solid warm gold instead —
// still reads as the same badge at this size.
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
        <div
          style={{
            width: 132,
            height: 132,
            borderRadius: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            border: "3px solid #D6A257",
            boxShadow: "inset 0 0 0 1px rgba(243,203,142,0.25)",
          }}
        >
          <div
            style={{
              fontSize: 76,
              fontWeight: 700,
              color: "#E9BE7D",
              fontFamily: "Georgia, serif",
            }}
          >
            V
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
