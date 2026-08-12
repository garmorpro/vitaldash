"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import StepsTokenCard from "@/components/StepsTokenCard";

type Account = { id: string; displayName: string; stepsImportToken: string; createdAt: string };
type InviteResult = { url: string; expiresAt: string };

export default function AccountPage() {
  const router = useRouter();
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [label, setLabel] = useState("");
  const [invite, setInvite] = useState<InviteResult | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [creatingInvite, setCreatingInvite] = useState(false);
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    fetch("/api/account")
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then(setAccount)
      .catch(() => router.push("/login"))
      .finally(() => setLoading(false));
  }, [router]);

  async function handleCreateInvite() {
    setInviteError(null);
    setCreatingInvite(true);
    try {
      const res = await fetch("/api/invites", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ label: label || undefined }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not create an invite.");
      setInvite({ url: `${window.location.origin}/invite/${body.token}`, expiresAt: body.expiresAt });
      setLabel("");
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : "Could not create an invite.");
    } finally {
      setCreatingInvite(false);
    }
  }

  async function handleCopyInvite() {
    if (!invite) return;
    try {
      await navigator.clipboard.writeText(invite.url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Soft failure — the link is still visible to copy manually.
    }
  }

  async function handleLogout() {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.push("/login");
    router.refresh();
  }

  if (loading || !account) {
    return <div className="mx-auto min-h-dvh w-full max-w-md" style={{ background: "var(--ground)" }} />;
  }

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col gap-6 px-5 py-6" style={{ background: "var(--ground)" }}>
      <div className="flex items-center justify-between">
        <h1 className="text-[1.15rem] font-extrabold">Account</h1>
        <button
          type="button"
          onClick={() => router.push("/")}
          aria-label="Close"
          className="flex h-8 w-8 items-center justify-center rounded-full"
          style={{ background: "var(--surface-2)", color: "var(--ink-faint)" }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="h-4 w-4">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </div>

      <div>
        <p className="text-[1rem] font-bold">{account.displayName}</p>
        <p className="text-[0.8rem]" style={{ color: "var(--ink-faint)" }}>
          Signed in with Face ID
        </p>
      </div>

      <StepsTokenCard token={account.stepsImportToken} />

      <div className="rounded-2xl p-4" style={{ background: "var(--surface)", boxShadow: "var(--shadow)" }}>
        <p className="mb-3 text-[0.74rem] font-bold" style={{ color: "var(--ink-faint)" }}>
          INVITE SOMEONE
        </p>

        {invite ? (
          <div className="flex flex-col gap-2.5">
            <p
              className="break-all rounded-xl px-3 py-2.5 font-mono text-[0.8rem]"
              style={{ background: "var(--surface-2)", color: "var(--ink)" }}
            >
              {invite.url}
            </p>
            <p className="text-[0.76rem]" style={{ color: "var(--ink-faint)" }}>
              Expires {new Date(invite.expiresAt).toLocaleDateString()}. Anyone with this link can enroll their own
              Face ID and get their own private entries.
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleCopyInvite}
                className="flex-1 rounded-xl py-2.5 text-[0.86rem] font-bold"
                style={{ background: "var(--surface-2)", color: "var(--weight)" }}
              >
                {copied ? "Copied!" : "Copy link"}
              </button>
              <button
                type="button"
                onClick={() => setInvite(null)}
                className="flex-1 rounded-xl py-2.5 text-[0.86rem] font-bold"
                style={{ background: "var(--surface-2)", color: "var(--ink-muted)" }}
              >
                New invite
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            <input
              type="text"
              placeholder="Label (optional) — e.g. Mom"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="w-full rounded-xl px-3.5 py-2.5 text-[0.9rem] font-semibold"
              style={{ background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--ink)" }}
            />
            {inviteError && (
              <p className="text-[0.82rem] font-semibold" style={{ color: "var(--status-critical)" }}>
                {inviteError}
              </p>
            )}
            <button
              type="button"
              onClick={handleCreateInvite}
              disabled={creatingInvite}
              className="w-full rounded-xl py-2.5 text-[0.86rem] font-bold text-white transition-opacity disabled:opacity-60"
              style={{ background: "var(--weight)" }}
            >
              {creatingInvite ? "Creating…" : "Generate invite link"}
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-2 w-full rounded-2xl py-3 text-[0.9rem] font-bold transition-opacity disabled:opacity-50"
        style={{ background: "transparent", color: "var(--status-critical)" }}
      >
        {loggingOut ? "Signing out…" : "Log out"}
      </button>
    </div>
  );
}
