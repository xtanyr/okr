#!/usr/bin/env bash

set -euo pipefail

# OKR deployment script (Ubuntu, no domain). Run from project root.
# Automates README steps 2–10.

if [[ "${EUID:-$(id -u)}" -ne 0 ]]; then
  SUDO="sudo"
else
  SUDO=""
fi

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")"/.. && pwd)"
FRONTEND_DIST="$PROJECT_ROOT/frontend/dist"
NGINX_SITE_NAME="okr"
NGINX_SITE_PATH="/etc/nginx/sites-available/${NGINX_SITE_NAME}"

echo "[2/10] Installing dependencies (Node.js 20, PostgreSQL, PM2, Nginx)" >&2
$SUDO bash -c "\
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
  apt update && \
  DEBIAN_FRONTEND=noninteractive apt install -y nodejs postgresql postgresql-contrib nginx && \
  npm install -g pm2 \
"

echo "[3/10] Configuring PostgreSQL database" >&2

# Load .env if exists to pick DB_* vars; otherwise use defaults
set +u
if [[ -f "$PROJECT_ROOT/.env" ]]; then
  # shellcheck disable=SC2046
  export $(grep -E '^(DB_NAME|DB_USER|DB_PASS|DB_HOST|DB_PORT|DATABASE_URL)=' "$PROJECT_ROOT/.env" | xargs -d '\n')
fi
set -u

DB_NAME="${DB_NAME:-okr_db}"
DB_USER="${DB_USER:-okr_user}"
DB_PASS="${DB_PASS:-okr_password}"
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"

echo " - Ensuring role and database exist (db=$DB_NAME, user=$DB_USER)" >&2
$SUDO -u postgres psql <<SQL
DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${DB_USER}') THEN
      CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASS}';
   END IF;
END
\$\$;

DO \$\$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '${DB_NAME}') THEN
      CREATE DATABASE ${DB_NAME};
   END IF;
END
\$\$;

GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};
SQL

echo "[4/10] Installing project dependencies (npm ci)" >&2
cd "$PROJECT_ROOT"
npm ci

if [[ ! -f "$PROJECT_ROOT/.env" ]]; then
  echo "[WARN] .env not found at $PROJECT_ROOT/.env. Create it before proceeding for correct Prisma/SMTP behavior." >&2
fi

echo "[4/10] Applying Prisma (generate, migrate deploy)" >&2
npx prisma generate
npx prisma migrate deploy

echo "[5/10] Building backend (tsc) and frontend (vite build)" >&2
npm run build
cd "$PROJECT_ROOT/frontend"
npm ci
npm run build
cd "$PROJECT_ROOT"

echo "[6/10] Starting backend with PM2 (name=okr-api)" >&2
pm2 start "$PROJECT_ROOT/dist/index.js" --name okr-api || true
pm2 save
pm2 startup | sed -n '2,$p' >&2 || true

echo "[7/10] Configuring Nginx (static + API proxy)" >&2
SERVER_ROOT_ESCAPED="${FRONTEND_DIST//\//\/}"

NGINX_CONF="server {
    listen 80 default_server;
    server_name _;

    root ${SERVER_ROOT_ESCAPED};
    index index.html index.htm;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /auth {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host $host;
    }
    location /user {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host $host;
    }
    location /okr {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection \"upgrade\";
        proxy_set_header Host $host;
    }
}"

echo "$NGINX_CONF" | $SUDO tee "$NGINX_SITE_PATH" >/dev/null
$SUDO ln -sf "$NGINX_SITE_PATH" "/etc/nginx/sites-enabled/${NGINX_SITE_NAME}"
$SUDO nginx -t
$SUDO systemctl restart nginx

echo "[9/10] Installing backup timers" >&2
$SUDO mkdir -p /opt/okr/scripts /var/backups/okr /var/log/okr
$SUDO chown -R "${SUDO:+$USER:}$USER" /var/backups/okr /var/log/okr || true
$SUDO bash "$PROJECT_ROOT/scripts/install-backup-system.sh" || true
$SUDO systemctl daemon-reload || true
$SUDO systemctl enable --now okr-backup.timer || true

echo "[10/10] Verifying health endpoint (if available)" >&2
set +e
IP_ADDR=$(hostname -I | awk '{print $1}')
curl -fsS "http://127.0.0.1:4000/health" || true
echo
echo "Deployment complete. Open: http://$IP_ADDR" >&2


