import { NextRequest, NextResponse } from "next/server";
import { getSession, SESSION_COOKIE, SESSION_INACTIVITY_SECONDS } from "@/lib/session";

// Everything in the app is gated behind a signed-in session except the
// handful of routes needed to *get* signed in, and the steps-import
// webhook (which authenticates itself with its own per-account token,
// not a browser session).
const PUBLIC_PAGE_PREFIXES = ["/login", "/invite/", "/setup"];
const PUBLIC_API_PREFIXES = ["/api/auth/", "/api/invites/validate", "/api/setup/status", "/api/import/steps"];

function isPublic(pathname: string, prefixes: string[]) {
  return prefixes.some((prefix) => pathname === prefix || pathname.startsWith(prefix));
}

// Every authenticated request slides the session cookie's expiry forward
// by another SESSION_INACTIVITY_SECONDS — the actual inactivity-logout
// mechanism. Re-set the same token (it's still cryptographically valid;
// only the cookie's own Max-Age changes), so stop using the app and the
// browser quietly deletes the cookie on its own once the window lapses.
function withRefreshedSession(response: NextResponse, request: NextRequest) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return response;
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_INACTIVITY_SECONDS,
  });
  return response;
}

// This is an optimistic, cookie-only check (no DB call) — the right call
// per Next's own guidance for Proxy. Every route handler still re-checks
// the session itself; this is just the first gate.
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api/")) {
    if (isPublic(pathname, PUBLIC_API_PREFIXES)) return NextResponse.next();
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Not signed in." }, { status: 401 });
    return withRefreshedSession(NextResponse.next(), request);
  }

  if (isPublic(pathname, PUBLIC_PAGE_PREFIXES)) return NextResponse.next();

  const session = await getSession();
  if (!session) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return withRefreshedSession(NextResponse.next(), request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|.*\\.png$).*)"],
};
