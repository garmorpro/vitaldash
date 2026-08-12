# VitalDash

A personal health tracker — daily weight and step logging, with a trend
history. Built with Next.js, TypeScript, Tailwind CSS, Prisma, and Postgres.

## Architecture

Strict three-layer separation — the frontend never talks to the database
directly:

```
Frontend (React components, src/app + src/components)
      │  fetch() to same-origin API routes only
      ▼
Backend (Next.js Route Handlers, src/app/api/**/route.ts)
      │  Prisma Client (src/lib/prisma.ts)
      ▼
Database (Postgres)
```

Database credentials (`DATABASE_URL`) only ever exist in `.env` on the
server side — they are never exposed to the browser.

## Getting started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy `.env.example` to `.env` and fill in a real Postgres connection
   string (e.g. from a free [Supabase](https://supabase.com) project).
3. Push the schema to your database:
   ```bash
   npx prisma db push
   ```
4. Run the dev server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000).

## Project structure

- `src/app/page.tsx` — home page (renders the dashboard)
- `src/components/EntryDashboard.tsx` — the weight/steps form + history UI
- `src/app/api/entries/route.ts` — the only code that reads/writes entries
- `src/lib/prisma.ts` — the only place `PrismaClient` is instantiated
- `prisma/schema.prisma` — database schema (`DailyEntry` model)

## Roadmap

- v1: daily weight entry + daily step count (this scaffold)
- v2 candidates: body measurements, mood/energy tag, weekly averages
- Calorie tracking is deliberately out of scope for now
