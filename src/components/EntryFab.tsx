"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ChoiceSheet from "./ChoiceSheet";

export default function EntryFab() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Log a reading"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8"
        style={{ background: "var(--weight)", boxShadow: "0 10px 26px rgba(27,127,173,0.35)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-6 w-6">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {open && (
        <ChoiceSheet
          onClose={() => setOpen(false)}
          onPickWeight={() => router.push("/log/weight")}
          onPickBp={() => router.push("/log/bp")}
        />
      )}
    </>
  );
}
