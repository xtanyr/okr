# OKR System Deployment Guide (Ubuntu server)

Этот гайд описывает продакшн-развёртывание на собственном Ubuntu‑сервере без домена. Доступ к приложению будет по IP: `http://YOUR_SERVER_IP`.
## 1. Server Setup

```bash
# Connect to server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install essentials
apt install -y git curl wget

# Set timezone (optional)
timedatectl set-timezone Asia/Almaty

# Create deployer user
adduser deployer
usermod -aG sudo deployer
```

## 2. Install Dependencies

```bash
# Node.js 20 LTS (рекомендуется)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
apt install -y nodejs

# PostgreSQL
apt install -y postgresql postgresql-contrib

# PM2
npm install -g pm2

# Nginx
apt install -y nginx
```

## 3. Database Setup

```bash
sudo -u postgres psql
CREATE DATABASE okr_db;
CREATE USER okr_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE okr_db TO okr_user;
\q
```

## 4. Deploy Application

```bash
# As deployer
su - deployer
mkdir -p ~/apps/okr
cd ~/apps/okr
git clone https://github.com/xtanyr/okr.git .

# Install deps (root project)
npm ci

# Configure .env (create file in project root)
nano .env
```

Примените Prisma:

```bash
npx prisma generate
npx prisma migrate deploy
```

## 5. Build

Backend (TypeScript → dist): добавьте скрипты в `package.json`, если их ещё нет:

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  }
}
```

Соберите backend и frontend:

```bash
# Backend
npm run build

# Frontend
cd frontend
npm ci
npm run build
cd ..
```

## 6. Process manager (PM2)

Запустите backend под PM2 и включите автозапуск:

```bash
pm2 start dist/index.js --name okr-api
pm2 save
pm2 startup  # выполните предложенную команду от root
```

## 7. Nginx (static frontend + API proxy)

```bash
sudo nano /etc/nginx/sites-available/okr

# Add:
server {
    listen 80;
    server_name _;

    # Статика фронтенда (Vite build)
    root okr/frontend/dist;
    index index.html index.htm;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Прокси к backend API (порт 4000 по коду)
    location /auth {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    location /user {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
    location /okr {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/okr /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## 8. SSL (опционально)

```bash
# Если у вас нет домена, шаг можно пропустить
# При наличии домена:
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 9. Backup System

В репозитории есть готовые скрипты и юниты systemd. Рекомендуется пользоваться инсталлером:

```bash
sudo mkdir -p /opt/okr/scripts /var/backups/okr /var/log/okr
sudo chown -R deployer:deployer /var/backups/okr /var/log/okr

sudo bash scripts/install-backup-system.sh
sudo systemctl daemon-reload
sudo systemctl enable --now okr-backup.timer
```

Проверка бэкапа:

```bash
sudo -u deployer node /opt/okr/scripts/backup-db.js
tail -f /var/log/okr/backup.log
```

## 10. Verify

1. Откройте `http://YOUR_SERVER_IP`
2. Проверьте, что эндпоинт `/health` отвечает через Nginx

## Maintenance

```bash
# Update app
cd ~/apps/okr
git pull
npm ci
npx prisma migrate deploy
npm run build
cd frontend && npm ci && npm run build && cd ..
pm2 restart okr-api

# Check logs
pm2 logs okr-api
journalctl -u okr-backup.service -n 50
```

## Security

```bash
# Enable firewall
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

## Troubleshooting

- Check app logs: `pm2 logs okr-api`
- Check backup logs: `journalctl -u okr-backup.service`
- Check Nginx: `sudo systemctl status nginx`
- Check PostgreSQL: `sudo systemctl status postgresql`
