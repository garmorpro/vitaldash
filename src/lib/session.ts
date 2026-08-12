import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// The signed-in session. Long-lived (180 days) since the whole point of
// passkey auth is that Face ID is the re-auth step — a short cookie would
// just mean re-doing Face ID more often for no security benefit.
const SESSION_COOKIE = "vitaldash_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 180;

function secretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("Server missing SESSION_SECRET");
  }
  return new TextEncoder().encode(secret);
}

export type Session = { userId: string };

export async function createSession(userId: string) {
  const token = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE_SECONDS}s`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, secretKey(), { algorithms: ["HS256"] });
    if (typeof payload.userId !== "string") return null;
    return { userId: payload.userId };
  } catch {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
