#!/usr/bin/env bash
# Builds the site and syncs dist/ to the VPS, where Caddy serves DEPLOY_DIR
# directly (no restart or sudo needed).
#
# Server details live in .env.prod.local (git-ignored); see .env.example.
#   npm run deploy        build and upload
#   npm run deploy:dry    preview the upload without changing anything
set -euo pipefail
cd "$(dirname "$0")/.."

URL="https://electricity-bill-calculator.pknspace.com"

if [ ! -f .env.prod.local ]; then
  echo "Missing .env.prod.local. Copy .env.example and fill in the DEPLOY_* values." >&2
  exit 1
fi
# Read KEY=VALUE lines literally (values such as deploy keys contain "|", so the
# file is not sourced as shell). Surrounding quotes are stripped.
while IFS= read -r line || [ -n "$line" ]; do
  case "$line" in ''|\#*) continue ;; esac
  key="${line%%=*}"
  value="${line#*=}"
  value="${value%\"}"; value="${value#\"}"; value="${value%\'}"; value="${value#\'}"
  export "$key=$value"
done < .env.prod.local
: "${DEPLOY_HOST:?DEPLOY_HOST is not set in .env.prod.local}"
: "${DEPLOY_PORT:?DEPLOY_PORT is not set in .env.prod.local}"
: "${DEPLOY_DIR:?DEPLOY_DIR is not set in .env.prod.local}"

echo "› Checks"
npm run check

echo "› Build"
npm run build

echo "› Upload"
rsync -avz --delete ${DRY_RUN:+--dry-run} \
  -e "ssh -p $DEPLOY_PORT" \
  dist/ "$DEPLOY_HOST:$DEPLOY_DIR/"

if [ -n "${DRY_RUN:-}" ]; then
  echo "Dry run: nothing was uploaded."
else
  echo "Deployed to $URL"
fi
