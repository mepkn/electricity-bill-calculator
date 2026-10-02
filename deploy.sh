#!/usr/bin/env bash
# Build the site and sync it to the VPS. Caddy serves
# /var/www/electricity-bill-calculator, so no restart or sudo is needed.
# Use DRY_RUN=1 to preview the upload.
set -euo pipefail

cd "$(dirname "$0")"

HOST="user@your-server"
PORT=22
REMOTE_DIR="/var/www/electricity-bill-calculator"
URL="https://electricity-bill-calculator.pknspace.com"

npm run build

rsync -avz --delete ${DRY_RUN:+--dry-run} \
  -e "ssh -p $PORT" \
  dist/ "$HOST:$REMOTE_DIR/"

echo "Deployed to $URL"
