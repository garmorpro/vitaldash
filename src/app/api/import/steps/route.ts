import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Receives a daily step count from an external automation (an Apple
// Shortcut running on a schedule, hitting this over the internet — not
// just the LAN). Unlike /api/entries, this is protected by a shared
// secret token so a stranger can't POST fake step counts into the DB.
export async function POST(request: NextRequest) {
  const expected = process.env.STEPS_IMPORT_TOKEN;
  if (!expected) {
    return NextResponse.json({ error: "Server missing STEPS_IMPORT_TOKEN" }, { status: 500 });
  }

  const auth = request.headers.get("authorization") ?? "";
  const token = auth.replace(/^Bearer\s+/i, "");
  if (!token || token !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const date = body?.date;
  // Apple Shortcuts sometimes has to route the step count through a "Text"
  // action to dodge an unrelated Health-data-sharing restriction, which
  // turns the number into a JSON string ("8342" instead of 8342). Accept
  // either.
  const rawSteps = body?.steps;
  const steps = typeof rawSteps === "string" ? Number(rawSteps) : rawSteps;

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date is required as YYYY-MM-DD" }, { status: 400 });
  }
  if (typeof steps !== "number" || !Number.isFinite(steps) || steps < 0) {
    return NextResponse.json({ error: "steps must be a non-negative number" }, { status: 400 });
  }

  const entry = await prisma.dailyEntry.upsert({
    where: { date: new Date(date) },
    update: { steps: Math.round(steps) },
    create: { date: new Date(date), steps: Math.round(steps) },
  });

  return NextResponse.json({
    ok: true,
    date: entry.date.toISOString().slice(0, 10),
    steps: entry.steps,
  });
}
