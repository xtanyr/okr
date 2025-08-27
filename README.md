# OKR System Deployment Guide

## 1. Server Setup

```bash
# Connect to server
ssh root@your-server-ip

# Update system
apt update && apt upgrade -y

# Install essentials
apt install -y git curl wget

# Set timezone
timedatectl set-timezone Asia/Almaty

# Create deployer user
adduser deployer
usermod -aG sudo deployer
```

## 2. Install Dependencies

```bash
# Node.js
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
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
git clone https://github.com/xtanyr/okr.git

# Configure .env
cp .env.example .env
nano .env  # Update with your config

# Install deps
npm install
npx prisma generate
npx prisma migrate deploy
```

## 5. Configure Backup System

```bash
# Create dirs
sudo mkdir -p /var/backups/okr /var/log/okr
sudo chown -R deployer:deployer /var/backups/okr /var/log/okr

# Copy scripts
sudo cp scripts/backup-db.js /opt/okr/scripts/
sudo cp scripts/okr-backup.* /etc/systemd/system/

# Enable service
sudo systemctl daemon-reload
sudo systemctl enable --now okr-backup.timer
```

## 6. Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/okr

# Add:
server {
    listen 80;
    server_name your-domain.com;
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}

# Enable site
sudo ln -s /etc/nginx/sites-available/okr /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl restart nginx
```

## 7. Start Application

```bash
# Build frontend
cd frontend
npm install
npm run build
cd ..

# Start with PM2
pm2 start npm --name "okr-app" -- start
pm2 save
pm2 startup  # Follow instructions
```

## 8. SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## 9. Verify

1. Access your site at `https://your-domain.com`
2. Test backup:
   ```bash
   sudo -u deployer node /opt/okr/scripts/backup-db.js
   tail -f /var/log/okr/backup.log
   ```

## Maintenance

```bash
# Update app
cd ~/apps/okr
git pull
npm install
npx prisma migrate deploy
cd frontend && npm run build && cd ..
pm2 restart okr-app

# Check logs
pm2 logs okr-app
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

- Check app logs: `pm2 logs okr-app`
- Check backup logs: `journalctl -u okr-backup.service`
- Check Nginx: `sudo systemctl status nginx`
- Check PostgreSQL: `sudo systemctl status postgresql`
