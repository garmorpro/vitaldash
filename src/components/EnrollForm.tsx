"use client";

import { useState } from "react";
import { startRegistration } from "@simplewebauthn/browser";

// Shared by /setup (the one-time bootstrap account) and /invite/[token]
// (every account after that) — both are "pick a name, enroll Face ID,"
// they just differ in which token authorizes the signup.
export default function EnrollForm({
  setupToken,
  inviteToken,
  onEnrolled,
}: {
  setupToken?: string;
  inviteToken?: string;
  onEnrolled: (result: { displayName: string; stepsImportToken: string }) => void;
}) {
  const [displayName, setDisplayName] = useState("");
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleEnroll(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const name = displayName.trim();
    if (!name) {
      setError("Enter a name.");
      return;
    }
    setWorking(true);
    try {
      const optionsRes = await fetch("/api/auth/register/options", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ displayName: name, setupToken, inviteToken }),
      });
      const optionsBody = await optionsRes.json().catch(() => ({}));
      if (!optionsRes.ok) throw new Error(optionsBody.error ?? "Could not start setup.");

      const response = await startRegistration({ optionsJSON: optionsBody });

      const verifyRes = await fetch("/api/auth/register/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      const verifyBody = await verifyRes.json().catch(() => ({}));
      if (!verifyRes.ok) throw new Error(verifyBody.error ?? "Could not verify that passkey.");

      onEnrolled({ displayName: verifyBody.displayName, stepsImportToken: verifyBody.stepsImportToken });
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      // The browser throws its own error if Face ID is dismissed — that's
      // not a real failure, just let them try again quietly.
      setError(!message || /abort|cancel/i.test(message) ? null : message);
      setWorking(false);
    }
  }

  return (
    <form onSubmit={handleEnroll} className="flex w-full flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <label htmlFor="enroll-name" className="text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
          Your name
        </label>
        <input
          id="enroll-name"
          type="text"
          autoComplete="name"
          placeholder="e.g. Garrett"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          className="w-full rounded-xl px-4 py-3 text-[1rem] font-semibold"
          style={{ background: "var(--surface)", border: "1px solid var(--border)", color: "var(--ink)" }}
        />
      </div>

      {error && (
        <p className="text-[0.85rem] font-semibold" style={{ color: "var(--status-critical)" }}>
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={working}
        className="mt-1 rounded-2xl py-3.5 text-[0.96rem] font-bold text-white transition-opacity disabled:opacity-60"
        style={{ background: "var(--weight)" }}
      >
        {working ? "Waiting for Face ID…" : "Set up Face ID"}
      </button>
    </form>
  );
}
