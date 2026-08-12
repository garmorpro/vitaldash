import { randomBytes } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { verifyRegistrationResponse } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { origin, rpID, getPendingRegistration, clearPendingRegistration } from "@/lib/webauthn";

export async function POST(request: NextRequest) {
  const pending = await getPendingRegistration();
  if (!pending) {
    return NextResponse.json({ error: "That took too long — start again." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  if (!body?.response) {
    return NextResponse.json({ error: "Missing passkey response." }, { status: 400 });
  }

  let verification;
  try {
    verification = await verifyRegistrationResponse({
      response: body.response,
      expectedChallenge: pending.challenge,
      expectedOrigin: origin(),
      expectedRPID: rpID(),
    });
  } catch {
    return NextResponse.json({ error: "Could not verify that passkey." }, { status: 400 });
  }

  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: "Could not verify that passkey." }, { status: 400 });
  }

  const { credential, credentialDeviceType, credentialBackedUp } = verification.registrationInfo;
  const stepsImportToken = randomBytes(24).toString("hex");

  try {
    const user = await prisma.$transaction(async (tx) => {
      // Re-check right before writing to keep the race window as small as
      // possible (the options step already checked this once).
      if (pending.setupToken) {
        const expected = process.env.SETUP_TOKEN;
        const userCount = await tx.user.count();
        if (!expected || pending.setupToken !== expected || userCount > 0) {
          throw new Error("SETUP_UNAVAILABLE");
        }
      } else if (pending.inviteToken) {
        const invite = await tx.invite.findUnique({ where: { token: pending.inviteToken } });
        if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
          throw new Error("INVITE_INVALID");
        }
      } else {
        throw new Error("SETUP_UNAVAILABLE");
      }

      const newUser = await tx.user.create({
        data: {
          displayName: pending.displayName,
          stepsImportToken,
          passkeys: {
            create: {
              credentialId: credential.id,
              publicKey: credential.publicKey,
              counter: credential.counter,
              deviceType: credentialDeviceType,
              backedUp: credentialBackedUp,
              transports: credential.transports?.join(",") ?? null,
            },
          },
        },
      });

      if (pending.inviteToken) {
        await tx.invite.update({ where: { token: pending.inviteToken }, data: { usedAt: new Date() } });
      }
      if (pending.setupToken) {
        await tx.dailyEntry.updateMany({ where: { userId: null }, data: { userId: newUser.id } });
      }

      return newUser;
    });

    await clearPendingRegistration();
    await createSession(user.id);

    return NextResponse.json({ ok: true, displayName: user.displayName, stepsImportToken: user.stepsImportToken });
  } catch (err) {
    await clearPendingRegistration();
    if (err instanceof Error && err.message === "INVITE_INVALID") {
      return NextResponse.json({ error: "This invite link is invalid or has expired." }, { status: 404 });
    }
    return NextResponse.json({ error: "Setup is no longer available." }, { status: 403 });
  }
}
