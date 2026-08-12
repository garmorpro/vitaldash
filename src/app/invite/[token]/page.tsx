"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import EnrollForm from "@/components/EnrollForm";
import CenteredMessage from "@/components/CenteredMessage";

type Phase = "checking" | "valid" | "invalid" | "done";

export default function InvitePage() {
  const router = useRouter();
  const params = useParams<{ token: string }>();
  const token = params.token;
  const [phase, setPhase] = useState<Phase>("checking");
  const [invitedBy, setInvitedBy] = useState<string | null>(null);

  useEffect(() => {
    fetch(`/api/invites/validate?token=${encodeURIComponent(token)}`)
      .then((res) => res.json())
      .then((body) => {
        if (body.valid) {
          setInvitedBy(body.invitedBy ?? null);
          setPhase("valid");
        } else {
          setPhase("invalid");
        }
      })
      .catch(() => setPhase("invalid"));
  }, [token]);

  if (phase === "checking") {
    return <CenteredMessage>Checking invite…</CenteredMessage>;
  }

  if (phase === "invalid") {
    return (
      <CenteredMessage>
        This invite link is invalid or has expired.
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

  if (phase === "done") {
    return (
      <div
        className="mx-auto flex min-h-dvh w-full max-w-md flex-col items-center justify-center gap-6 px-6 text-center"
        style={{ background: "var(--ground)" }}
      >
        <div className="text-2xl font-extrabold">You&apos;re all set.</div>
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
          {invitedBy ? `${invitedBy} invited you.` : "You've been invited."} Set your name and enroll Face ID.
        </p>
      </div>
      <EnrollForm inviteToken={token} onEnrolled={() => setPhase("done")} />
    </div>
  );
}
