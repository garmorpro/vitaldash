"use client";

import { useState } from "react";
import type { SaveInput } from "@/hooks/useEntries";
import EntryModal from "./EntryModal";

export default function EntryFab({ onSave }: { onSave: (input: SaveInput) => Promise<void> }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Log an entry"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full shadow-lg transition-transform hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8"
        style={{ background: "var(--weight)", color: "var(--surface)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" className="h-6 w-6">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {open && <EntryModal onClose={() => setOpen(false)} onSave={onSave} />}
    </>
  );
}
