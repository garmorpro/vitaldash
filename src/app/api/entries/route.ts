import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { DailyEntry } from "@/generated/prisma/client";

// This route is the ONLY thing that talks to the database for daily
// entries. Client components call fetch("/api/entries") — they never
// import PrismaClient or hold a DB connection string.

export async function GET() {
  const entries = await prisma.dailyEntry.findMany({
    orderBy: { date: "asc" },
  });

  return NextResponse.json(
    entries.map((e: DailyEntry) => ({
      id: e.id,
      date: e.date.toISOString().slice(0, 10),
      weightLbs: e.weightLbs ? Number(e.weightLbs) : null,
      steps: e.steps,
    }))
  );
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { date, weightLbs, steps } = body ?? {};

  if (typeof date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json(
      { error: "date is required as YYYY-MM-DD" },
      { status: 400 }
    );
  }
  if (weightLbs == null && steps == null) {
    return NextResponse.json(
      { error: "provide weightLbs and/or steps" },
      { status: 400 }
    );
  }
  if (weightLbs != null && (typeof weightLbs !== "number" || weightLbs <= 0)) {
    return NextResponse.json({ error: "weightLbs must be a positive number" }, { status: 400 });
  }
  if (steps != null && (!Number.isInteger(steps) || steps < 0)) {
    return NextResponse.json({ error: "steps must be a non-negative integer" }, { status: 400 });
  }

  const entry = await prisma.dailyEntry.upsert({
    where: { date: new Date(date) },
    update: {
      ...(weightLbs != null ? { weightLbs } : {}),
      ...(steps != null ? { steps } : {}),
    },
    create: {
      date: new Date(date),
      weightLbs: weightLbs ?? null,
      steps: steps ?? null,
    },
  });

  return NextResponse.json(
    {
      id: entry.id,
      date: entry.date.toISOString().slice(0, 10),
      weightLbs: entry.weightLbs ? Number(entry.weightLbs) : null,
      steps: entry.steps,
    },
    { status: 201 }
  );
}
