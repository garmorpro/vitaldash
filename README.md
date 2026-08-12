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

This app is developed on one machine and deployed/run on a separate Ubuntu
server — the server hosts both the running app and its Postgres database
(managed/browsed with pgAdmin). Nothing needs to run locally on a dev
machine except editing code and `git push`.

**On the Ubuntu server:**

1. Install and start Postgres (skip if already running):
   ```bash
   sudo apt update && sudo apt install postgresql postgresql-contrib
   sudo systemctl enable --now postgresql
   ```
2. Create the app database + a dedicated user (skip if already created):
   ```bash
   sudo -u postgres psql -c "CREATE USER vitaldash_app WITH PASSWORD 'your_password_here';"
   sudo -u postgres psql -c "CREATE DATABASE vitaldash OWNER vitaldash_app;"
   ```
3. Pull the repo, install dependencies:
   ```bash
   git clone https://github.com/garmorpro/vitaldash.git
   cd vitaldash
   npm install
   ```
4. Copy `.env.example` to `.env` and set `DATABASE_URL` to match the
   user/password/db name above (host is `localhost` since the app and DB
   run on the same server).
5. Push the schema to the database:
   ```bash
   npx prisma db push
   ```
6. Build and run:
   ```bash
   npm run build
   npm run start
   ```
   (For a persistent process across reboots/crashes, run this under a
   process manager like `pm2` or a systemd service — not covered yet.)

### Deploying updates

The running app is managed by **pm2** and serves a pre-built `.next`
folder — a `git pull` alone does not update it. After pulling new
changes, run:

```bash
./scripts/deploy.sh
```

This pulls, reinstalls dependencies, applies any schema changes, rebuilds,
and restarts the pm2 process. Useful pm2 commands: `pm2 status`,
`pm2 logs vitaldash`, `pm2 restart vitaldash`.

### Connecting pgAdmin

pgAdmin can run wherever's convenient (on the server itself, or on your
Mac pointed at the server if its Postgres port is reachable). Register a
new server:
- **General tab** → Name: anything, e.g. `VitalDash`
- **Connection tab** → Host: `localhost` (if pgAdmin runs on the server) or
  the server's address (if connecting remotely — only do this if the
  Postgres port is firewalled to trusted IPs), Port: `5432`, Maintenance
  DB: `vitaldash`, Username: `vitaldash_app`, Password: whatever you set
  above

From there you can browse the `daily_entries` table visually, same as
you'd use phpMyAdmin for MySQL.

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
