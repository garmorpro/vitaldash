"use client";

import { useState } from "react";
import type { SaveInput } from "@/hooks/useEntries";
import ChoiceSheet from "./ChoiceSheet";
import WeightModal from "./WeightModal";
import BpModal from "./BpModal";

type Stage = "closed" | "choice" | "weight" | "bp";

export default function EntryFab({ onSave }: { onSave: (input: SaveInput) => Promise<void> }) {
  const [stage, setStage] = useState<Stage>("closed");

  return (
    <>
      <button
        type="button"
        onClick={() => setStage("choice")}
        aria-label="Log a reading"
        className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full text-white transition-transform hover:scale-105 active:scale-95 sm:bottom-8 sm:right-8"
        style={{ background: "var(--weight)", boxShadow: "0 10px 26px rgba(27,127,173,0.35)" }}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" className="h-6 w-6">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>

      {stage === "choice" && (
        <ChoiceSheet
          onClose={() => setStage("closed")}
          onPickWeight={() => setStage("weight")}
          onPickBp={() => setStage("bp")}
        />
      )}
      {stage === "weight" && <WeightModal onClose={() => setStage("closed")} onSave={onSave} />}
      {stage === "bp" && <BpModal onClose={() => setStage("closed")} onSave={onSave} />}
    </>
  );
}
