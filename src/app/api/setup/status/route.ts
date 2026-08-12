import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public — lets the /setup page tell "not set up yet" from "someone already
// claimed this" without needing the setup token itself. No sensitive info
// leaked either way.
export async function GET() {
  const count = await prisma.user.count();
  return NextResponse.json({ available: count === 0 });
}
