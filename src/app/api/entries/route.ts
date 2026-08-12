import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import type { DailyEntry } from "@/generated/prisma/client";

// This route is the ONLY thing that talks to the database for daily
// entries. Client components call fetch("/api/entries") — they never
// import PrismaClient or hold a DB connection string.
//
// proxy.ts already blocks unauthenticated requests before they get here,
// but every handler re-checks the session itself — a route handler should
// never trust that it was only ever reached through the gate in front of it.

function serialize(e: DailyEntry) {
  return {
    id: e.id,
    date: e.date.toISOString().slice(0, 10),
    weightLbs: e.weightLbs ? Number(e.weightLbs) : null,
    steps: e.steps,
    systolic: e.systolic,
    diastolic: e.diastolic,
    pulse: e.pulse,
  };
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const entries = await prisma.dailyEntry.findMany({
    where: { userId: session.userId },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(entries.map(serialize));
}

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const body = await request.json();
  const { date, weightLbs, steps, systolic, diastolic, pulse } = body ?? {};

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date is required as YYYY-MM-DD" },
      { status: 400 }
    );
  }
  if (weightLbs == null && steps == null && systolic == null && diastolic == null) {
    return NextResponse.json(
      { error: "provide weightLbs, steps, and/or a blood pressure reading" },
      { status: 400 }
    );
  }
  if (weightLbs != null && (typeof weightLbs !== "number" || weightLbs <= 0)) {
    return NextResponse.json({ error: "weightLbs must be a positive number" }, { status: 400 });
  }
  if (steps != null && (!Number.isInteger(steps) || steps < 0)) {
    return NextResponse.json({ error: "steps must be a non-negative integer" }, { status: 400 });
  }
  if ((systolic != null) !== (diastolic != null)) {
    return NextResponse.json({ error: "systolic and diastolic must be provided together" }, { status: 400 });
  }
  if (systolic != null && (!Number.isInteger(systolic) || systolic <= 0)) {
    return NextResponse.json({ error: "systolic must be a positive integer" }, { status: 400 });
  }
  if (diastolic != null && (!Number.isInteger(diastolic) || diastolic <= 0)) {
    return NextResponse.json({ error: "diastolic must be a positive integer" }, { status: 400 });
  }
  if (pulse != null && (!Number.isInteger(pulse) || pulse <= 0)) {
    return NextResponse.json({ error: "pulse must be a positive integer" }, { status: 400 });
  }

  const entry = await prisma.dailyEntry.upsert({
    where: { userId_date: { userId: session.userId, date: new Date(date) } },
    update: {
      ...(weightLbs != null ? { weightLbs } : {}),
      ...(steps != null ? { steps } : {}),
      ...(systolic != null ? { systolic } : {}),
      ...(diastolic != null ? { diastolic } : {}),
      ...(pulse != null ? { pulse } : {}),
    },
    create: {
      userId: session.userId,
      date: new Date(date),
      weightLbs: weightLbs ?? null,
      steps: steps ?? null,
      systolic: systolic ?? null,
      diastolic: diastolic ?? null,
      pulse: pulse ?? null,
    },
  });

  return NextResponse.json(serialize(entry), { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in." }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date");

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "date query param is required as YYYY-MM-DD" }, { status: 400 });
  }

  await prisma.dailyEntry.deleteMany({ where: { userId: session.userId, date: new Date(date) } });

  return NextResponse.json({ ok: true });
}
