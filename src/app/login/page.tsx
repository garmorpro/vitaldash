"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startAuthentication } from "@simplewebauthn/browser";

export default function LoginPage() {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    setError(null);
    setWorking(true);
    try {
      const optionsRes = await fetch("/api/auth/login/options", { method: "POST" });
      if (!optionsRes.ok) throw new Error("Could not start sign-in.");
      const optionsJSON = await optionsRes.json();

      const response = await startAuthentication({ optionsJSON });

      const verifyRes = await fetch("/api/auth/login/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ response }),
      });
      if (!verifyRes.ok) {
        const body = await verifyRes.json().catch(() => ({}));
        throw new Error(body.error ?? "Could not verify that passkey.");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      // The browser throws its own error (e.g. "user cancelled") if Face ID
      // is dismissed — that's not a real failure, just don't show a scary
      // message for it.
      const message = err instanceof Error ? err.message : "";
      if (message && !/abort|cancel/i.test(message)) {
        setError(message || "Something went wrong signing in.");
      }
      setWorking(false);
    }
  }

  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-10 px-6"
      style={{ background: "var(--ground)" }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="text-3xl font-extrabold tracking-tight">
          VitalDash<span style={{ color: "var(--weight)" }}>.</span>
        </div>
        <p className="text-[0.9rem]" style={{ color: "var(--ink-faint)" }}>
          Sign in with the passkey on this device.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3">
        <button
          type="button"
          onClick={handleLogin}
          disabled={working}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl py-4 text-[1rem] font-bold text-white transition-opacity disabled:opacity-60"
          style={{ background: "var(--weight)" }}
        >
          <FaceIdIcon />
          {working ? "Waiting for Face ID…" : "Continue with Face ID"}
        </button>

        {error && (
          <p className="text-center text-[0.85rem] font-semibold" style={{ color: "var(--status-critical)" }}>
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

function FaceIdIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
    >
      <path d="M4 8V6a2 2 0 0 1 2-2h2M4 16v2a2 2 0 0 0 2 2h2M20 8V6a2 2 0 0 0-2-2h-2M20 16v2a2 2 0 0 1-2 2h-2M9 10v1M15 10v1M9 15c.7.7 1.8 1 3 1s2.3-.3 3-1" />
    </svg>
  );
}
