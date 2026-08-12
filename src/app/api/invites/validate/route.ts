import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public — lets the /invite/[token] page show a friendly "invalid or
// expired" state, or the inviter's name, before anyone starts enrolling.
export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ valid: false });
  }

  const invite = await prisma.invite.findUnique({
    where: { token },
    include: { createdBy: { select: { displayName: true } } },
  });

  if (!invite || invite.usedAt || invite.expiresAt < new Date()) {
    return NextResponse.json({ valid: false });
  }

  return NextResponse.json({ valid: true, invitedBy: invite.createdBy.displayName, label: invite.label });
}
