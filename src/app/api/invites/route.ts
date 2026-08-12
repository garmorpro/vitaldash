import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const INVITE_TTL_DAYS = 7;

// Only someone already signed in can mint an invite — this is the only way
// (besides the one-time /setup bootstrap) that a new account gets created.
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const label = typeof body?.label === "string" && body.label.trim() ? body.label.trim().slice(0, 60) : null;

  const token = randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + INVITE_TTL_DAYS * 24 * 60 * 60 * 1000);

  await prisma.invite.create({
    data: { token, label, createdByUserId: session.userId, expiresAt },
  });

  return NextResponse.json({ token, label, expiresAt: expiresAt.toISOString() }, { status: 201 });
}
