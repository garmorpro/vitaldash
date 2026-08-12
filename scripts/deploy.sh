#!/usr/bin/env bash
# Run this on the Ubuntu server after every `git pull` to actually apply
# the changes. A pull alone does NOT update the running app — Next.js
# serves a pre-built .next folder, and pm2 keeps the old process alive
# until explicitly restarted.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> Pulling latest changes"
git pull

echo "==> Installing dependencies"
npm install

echo "==> Applying any schema changes"
npx prisma db push

echo "==> Rebuilding"
npm run build

echo "==> Restarting pm2 process"
pm2 restart vitaldash

echo "==> Done. Tail logs with: pm2 logs vitaldash"
