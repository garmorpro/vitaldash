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

### Automatic step import (Apple Shortcuts)

`POST /api/import/steps` accepts a daily step count from an external
automation — no Health Auto Export subscription needed, just the free,
built-in Shortcuts app.

**⚠️ Prerequisite:** your phone needs to be able to reach this endpoint
whenever the automation runs — including on cellular, away from home. That
means `vitaldash.morganserver.com` (or similar) needs to actually resolve
and be reachable from the internet, which isn't set up yet (right now the
app is only reachable at the server's LAN IP). Get that working first, or
the Shortcut will silently fail to log steps anytime you're not on your
home WiFi.

**1. Set the secret token on the server**, in `.env`:
```
STEPS_IMPORT_TOKEN="<a long random string — generate with: openssl rand -hex 32>"
```
Redeploy (`./scripts/deploy.sh`) after adding it.

**2. Build the Shortcut** (Shortcuts app → + → new shortcut):
1. Add action **Find Health Samples** — Type: `Steps`, Date: `Today`,
   sort/limit not needed since the next step sums them.
2. Add action **Calculate Statistics** — Statistic: `Sum`, Input: the
   health samples from step 1.
3. Add action **Get Contents of URL**:
   - URL: `https://vitaldash.morganserver.com/api/import/steps`
   - Method: `POST`
   - Headers: `Authorization` → `Bearer <the same token from .env>`
   - Request Body: `JSON`, with fields:
     - `date` → `Current Date` formatted as `ISO8601` (or just today's
       date as `YYYY-MM-DD`)
     - `steps` → the Sum result from step 2

**3. Automate it** (Automation tab → + → Personal Automation → Time of
Day): pick a time (e.g. 11:55 PM daily), choose **Run Immediately** (not
"Ask Before Running") so it fires silently in the background, and set the
action to run your new shortcut.

Test it once manually from the Shortcuts app first — if `Authorization`
header or the JSON body is malformed, the endpoint responds `400`/`401`
with an error message explaining what's wrong.

## Project structure

- `src/app/page.tsx` — home page (renders the dashboard)
- `src/components/EntryDashboard.tsx` — assembles the full dashboard
- `src/app/api/entries/route.ts` — reads/writes entries from the UI
- `src/app/api/import/steps/route.ts` — token-protected webhook for the
  Apple Shortcuts step import
- `src/lib/prisma.ts` — the only place `PrismaClient` is instantiated
- `prisma/schema.prisma` — database schema (`DailyEntry` model)

## Roadmap

- v1: daily weight entry + daily step count
- v2: blood pressure (systolic/diastolic/pulse), with clinical range
  status (Normal / Elevated / High)
- v3 candidates: body measurements, mood/energy tag, weekly averages
- Calorie tracking is deliberately out of scope for now
