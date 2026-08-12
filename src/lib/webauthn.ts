import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

export const rpName = "VitalDash";

export function rpID() {
  const id = process.env.WEBAUTHN_RP_ID;
  if (!id) throw new Error("Server missing WEBAUTHN_RP_ID");
  return id;
}

export function origin() {
  const o = process.env.WEBAUTHN_ORIGIN;
  if (!o) throw new Error("Server missing WEBAUTHN_ORIGIN");
  return o;
}

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("Server missing SESSION_SECRET");
  return new TextEncoder().encode(secret);
}

// Registration (enrolling a new passkey) and login are each a two-step
// handshake: the server hands the browser a random challenge, the browser
// signs it with the Secure Enclave, and the server has to check the
// signature against the *exact* challenge it issued. These short-lived,
// signed, httpOnly cookies are where that pending challenge lives between
// the two requests — a few minutes, then they're useless even if replayed.
const CHALLENGE_MAX_AGE_SECONDS = 5 * 60;

type PendingRegistration = {
  kind: "register";
  challenge: string;
  displayName: string;
  // Exactly one of these identifies which flow authorized this signup.
  setupToken?: string;
  inviteToken?: string;
};

const REGISTER_COOKIE = "vitaldash_reg_challenge";

export async function setPendingRegistration(data: Omit<PendingRegistration, "kind">) {
  const token = await new SignJWT({ kind: "register", ...data })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CHALLENGE_MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(REGISTER_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CHALLENGE_MAX_AGE_SECONDS,
  });
}

export async function getPendingRegistration(): Promise<PendingRegistration | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(REGISTER_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.kind !== "register" || typeof payload.challenge !== "string") return null;
    return payload as unknown as PendingRegistration;
  } catch {
    return null;
  }
}

export async function clearPendingRegistration() {
  const cookieStore = await cookies();
  cookieStore.delete(REGISTER_COOKIE);
}

const LOGIN_COOKIE = "vitaldash_login_challenge";

export async function setPendingLogin(challenge: string) {
  const token = await new SignJWT({ kind: "login", challenge })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${CHALLENGE_MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(LOGIN_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CHALLENGE_MAX_AGE_SECONDS,
  });
}

export async function getPendingLogin(): Promise<string | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(LOGIN_COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (payload.kind !== "login" || typeof payload.challenge !== "string") return null;
    return payload.challenge;
  } catch {
    return null;
  }
}

export async function clearPendingLogin() {
  const cookieStore = await cookies();
  cookieStore.delete(LOGIN_COOKIE);
}
