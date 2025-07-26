#!/usr/bin/env bash
# deploy.sh — one-shot updater for Mudgate
set -euo pipefail

LOG=/var/log/mudgate-deploy.log
exec > >(tee -a "$LOG") 2>&1

echo "=== $(date -Iseconds)  Mudgate deploy started ==="

cd /opt/mudgate

# Optional: pass a service name, e.g. ./deploy.sh qr-bridge
SVC="${1:-}"

echo "[git] pulling latest repo changes…"
git pull --ff-only

# ──────────────── NEW: build the static lander ────────────────
echo "[lander] installing deps + building Kingslander…"
pushd kingslander
npm ci --prefer-offline
npm run build          # Vite ⇒ outputs /opt/mudgate/kingslander/dist
popd
# ───────────────────────────────────────────────────────────────

echo "[docker] stopping existing containers…"
if [[ -n "$SVC" ]]; then
  docker-compose stop "$SVC"
  docker-compose rm -f "$SVC"
else
  docker-compose down
fi


echo "[docker] pulling latest images…"
if [[ -n "$SVC" ]]; then
  docker-compose pull "$SVC"
else
  docker-compose pull
fi

echo "[docker] recreating containers…"
if [[ -n "$SVC" ]]; then
  docker-compose up -d --remove-orphans "$SVC"
else
  docker-compose up -d --remove-orphans
fi

echo "[nginx] testing and reloading config…"
sudo nginx -t && sudo systemctl reload nginx

echo "=== $(date -Iseconds)  Deploy complete ==="
