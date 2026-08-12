import { NextRequest, NextResponse } from "next/server";
import { verifyAuthenticationResponse, type AuthenticatorTransportFuture, type WebAuthnCredential } from "@simplewebauthn/server";
import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/session";
import { origin, rpID, getPendingLogin, clearPendingLogin } from "@/lib/webauthn";

export async function POST(request: NextRequest) {
  const challenge = await getPendingLogin();
  if (!challenge) {
    return NextResponse.json({ error: "That took too long — try again." }, { status: 400 });
  }

  const body = await request.json().catch(() => null);
  const credentialId = body?.response?.id;
  if (typeof credentialId !== "string") {
    return NextResponse.json({ error: "Missing passkey response." }, { status: 400 });
  }

  const passkey = await prisma.passkey.findUnique({ where: { credentialId } });
  if (!passkey) {
    await clearPendingLogin();
    return NextResponse.json({ error: "That passkey isn't recognized." }, { status: 401 });
  }

  const credential: WebAuthnCredential = {
    id: passkey.credentialId,
    publicKey: passkey.publicKey,
    counter: passkey.counter,
    transports: passkey.transports ? (passkey.transports.split(",") as AuthenticatorTransportFuture[]) : undefined,
  };

  let verification;
  try {
    verification = await verifyAuthenticationResponse({
      response: body.response,
      expectedChallenge: challenge,
      expectedOrigin: origin(),
      expectedRPID: rpID(),
      credential,
    });
  } catch {
    await clearPendingLogin();
    return NextResponse.json({ error: "Could not verify that passkey." }, { status: 400 });
  }

  if (!verification.verified) {
    await clearPendingLogin();
    return NextResponse.json({ error: "Could not verify that passkey." }, { status: 401 });
  }

  await prisma.passkey.update({
    where: { id: passkey.id },
    data: { counter: verification.authenticationInfo.newCounter, lastUsedAt: new Date() },
  });

  await clearPendingLogin();
  await createSession(passkey.userId);

  return NextResponse.json({ ok: true });
}
