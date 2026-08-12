"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import EnrollForm from "@/components/EnrollForm";
import StepsTokenCard from "@/components/StepsTokenCard";
import CenteredMessage from "@/components/CenteredMessage";

type Phase = "checking" | "ready" | "unavailable" | "done";

function SetupInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const [phase, setPhase] = useState<Phase>("checking");
  const [result, setResult] = useState<{ displayName: string; stepsImportToken: string } | null>(null);

  useEffect(() => {
    // Nothing to check yet — the render below shows the missing-token
    // message directly, without needing a state transition for it.
    if (!token) return;
    fetch("/api/setup/status")
      .then((res) => res.json())
      .then((body) => setPhase(body.available ? "ready" : "unavailable"))
      .catch(() => setPhase("unavailable"));
  }, [token]);

  if (!token) {
    return <CenteredMessage>This setup link is missing its token.</CenteredMessage>;
  }

  if (phase === "checking") {
    return <CenteredMessage>Checking…</CenteredMessage>;
  }

  if (phase === "unavailable") {
    return (
      <CenteredMessage>
        Setup has already been completed.
        <br />
        <button
          type="button"
          onClick={() => router.push("/login")}
          className="mt-4 font-bold"
          style={{ color: "var(--weight)" }}
        >
          Go to sign in
        </button>
      </CenteredMessage>
    );
  }

  if (phase === "done" && result) {
    return (
      <div
        className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6"
        style={{ background: "var(--ground)" }}
      >
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="text-2xl font-extrabold">You&apos;re all set, {result.displayName}.</div>
          <p className="text-[0.88rem]" style={{ color: "var(--ink-faint)" }}>
            Face ID is enrolled, and your existing entries are now attached to this account.
          </p>
        </div>

        <StepsTokenCard token={result.stepsImportToken} />

        <button
          type="button"
          onClick={() => router.push("/")}
          className="w-full rounded-2xl py-3.5 text-[0.96rem] font-bold text-white"
          style={{ background: "var(--weight)" }}
        >
          Go to VitalDash
        </button>
      </div>
    );
  }

  return (
    <div
      className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-8 px-6"
      style={{ background: "var(--ground)" }}
    >
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="text-2xl font-extrabold tracking-tight">
          VitalDash<span style={{ color: "var(--weight)" }}>.</span>
        </div>
        <p className="text-[0.9rem]" style={{ color: "var(--ink-faint)" }}>
          Set up your account and enroll Face ID.
        </p>
      </div>
      <EnrollForm
        setupToken={token ?? undefined}
        onEnrolled={(r) => {
          setResult(r);
          setPhase("done");
        }}
      />
    </div>
  );
}

export default function SetupPage() {
  return (
    <Suspense fallback={<CenteredMessage>Checking…</CenteredMessage>}>
      <SetupInner />
    </Suspense>
  );
}
