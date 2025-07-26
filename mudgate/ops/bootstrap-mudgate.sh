#!/usr/bin/env bash
#
# bootstrap-mudgate.sh – Idempotent server setup for the mudgate droplet.
#
#  * Installs Docker + Compose
#  * Installs Node 22 from NodeSource APT repo
#  * Clones / updates the mudgate repo
#  * Installs the /usr/local/bin/mudgate-deploy wrapper
#  * Seeds .env.production (if not present)
#  * Runs the first deploy
set -euo pipefail

REPO_URL="https://github.com/ifwn/mudgate.git"
REPO_DIR="/opt/mudgate"
DEPLOY_WRAPPER="/usr/local/bin/mudgate-deploy"
NODE_VERSION="22.x"

echo "=== [1] Install Docker + Compose ==="
if ! command -v docker >/dev/null; then
  curl -fsSL https://get.docker.com | sh
  usermod -aG docker "$USER"
fi
if ! command -v docker-compose >/dev/null; then
  curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) \
    -o /usr/local/bin/docker-compose
  chmod +x /usr/local/bin/docker-compose
fi

echo "=== [2] Install Node ${NODE_VERSION} ==="
curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION} | bash -
apt-get install -y nodejs
# Ensure npm >=10 (optional)
npm install -g npm@latest

echo "=== [3] Clone or update repo ==="
if [[ ! -d "$REPO_DIR/.git" ]]; then
  git clone --depth 1 "$REPO_URL" "$REPO_DIR"
else
  git -C "$REPO_DIR" fetch --prune origin main
  git -C "$REPO_DIR" reset --hard origin/main
fi

echo "=== [4] Install wrapper ==="
cat >"$DEPLOY_WRAPPER" <<"WRAP"
#!/usr/bin/env bash
set -euo pipefail
REPO_DIR="/opt/mudgate"
BRANCH="main"
cd "$REPO_DIR"
git fetch --prune origin "$BRANCH"
git reset --hard "origin/$BRANCH"
exec bash "$REPO_DIR/deploy.sh" "$@"
WRAP
chmod +x "$DEPLOY_WRAPPER"

echo "=== [5] Seed env file (first‑run only) ==="
ENV_FILE="$REPO_DIR/.env.production"
if [[ ! -f "$ENV_FILE" ]]; then
  cat >"$ENV_FILE" <<EOF
VITE_AUTH_CLIENT_ID=bernard-spa
VITE_AUTH_URL=https://cloaking.bernard-labs.com
EOF
  chmod 600 "$ENV_FILE"
fi

echo "=== [6] First deploy ==="
/usr/local/bin/mudgate-deploy
echo "=== bootstrap complete ==="
