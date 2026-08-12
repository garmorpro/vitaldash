"use client";

export default function ChoiceSheet({
  onClose,
  onPickWeight,
  onPickBp,
}: {
  onClose: () => void;
  onPickWeight: () => void;
  onPickBp: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: "rgba(20, 40, 55, 0.35)", backdropFilter: "blur(2px)" }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="fade-up w-full max-w-sm overflow-hidden rounded-[22px] p-2" style={{ background: "var(--surface)", boxShadow: "var(--shadow)" }}>
        <div className="px-3.5 pb-1.5 pt-3 text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
          LOG A READING
        </div>

        <button
          type="button"
          onClick={onPickWeight}
          className="flex w-full items-center gap-3 rounded-2xl p-3.5 text-left transition-colors hover:opacity-90"
          style={{ background: "transparent" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--weight-soft)", color: "var(--weight-strong)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[19px] w-[19px]">
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2.5 2.5M9 3h6" />
            </svg>
          </span>
          <span>
            <span className="block text-[0.92rem] font-bold">Weight</span>
            <span className="block text-[0.76rem]" style={{ color: "var(--ink-faint)" }}>
              Log today&apos;s weight
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onPickBp}
          className="flex w-full items-center gap-3 rounded-2xl p-3.5 text-left"
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
            style={{ background: "var(--bp-soft)", color: "var(--bp-strong)" }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="h-[19px] w-[19px]">
              <path d="M4 12h4l2-6 4 12 2-6h4" />
            </svg>
          </span>
          <span>
            <span className="block text-[0.92rem] font-bold">Blood pressure</span>
            <span className="block text-[0.76rem]" style={{ color: "var(--ink-faint)" }}>
              Systolic, diastolic &amp; pulse
            </span>
          </span>
        </button>

        <button
          type="button"
          onClick={onClose}
          className="mt-1 w-full rounded-2xl p-3 text-center text-[0.86rem] font-bold"
          style={{ color: "var(--ink-muted)" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--surface-2)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}
