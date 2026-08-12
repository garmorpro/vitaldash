import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

// Two different lifetimes at play here:
//  - the signed JWT itself is valid for up to 180 days — a hard cap so a
//    session can never be extended forever, no matter how active.
//  - the *cookie's* Max-Age is much shorter and gets refreshed on every
//    request (see proxy.ts) — that's what actually enforces "log out after
//    N minutes of inactivity." Stop using the app and the browser deletes
//    the cookie on its own once that window passes; the still-valid JWT
//    never even gets sent again.
export const SESSION_COOKIE = "vitaldash_session";
const SESSION_ABSOLUTE_MAX_SECONDS = 60 * 60 * 24 * 180;
export const SESSION_INACTIVITY_SECONDS = 60 * 30;

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
    .setExpirationTime(`${SESSION_ABSOLUTE_MAX_SECONDS}s`)
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_INACTIVITY_SECONDS,
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
