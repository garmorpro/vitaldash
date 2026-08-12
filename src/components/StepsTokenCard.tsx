"use client";

import { useState } from "react";

export default function StepsTokenCard({ token }: { token: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(token);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard API can be unavailable; the token is still visible and
      // selectable, so this is a soft failure.
    }
  }

  return (
    <div className="w-full rounded-2xl p-4" style={{ background: "var(--surface)", boxShadow: "var(--shadow)" }}>
      <p className="mb-2 text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
        STEPS IMPORT TOKEN
      </p>
      <p
        className="mb-3 break-all rounded-xl px-3 py-2.5 font-mono text-[0.82rem]"
        style={{ background: "var(--surface-2)", color: "var(--ink)" }}
      >
        {token}
      </p>
      <p className="mb-3 text-[0.78rem]" style={{ color: "var(--ink-faint)" }}>
        Use this as the Bearer token in your Apple Shortcut&apos;s request to /api/import/steps.
      </p>
      <button
        type="button"
        onClick={handleCopy}
        className="w-full rounded-xl py-2.5 text-[0.86rem] font-bold"
        style={{ background: "var(--surface-2)", color: "var(--weight)" }}
      >
        {copied ? "Copied!" : "Copy token"}
      </button>
    </div>
  );
}
