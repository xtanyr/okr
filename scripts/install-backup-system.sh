#!/bin/bash

# Exit on error
set -e

echo "Setting up OKR database backup system..."

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root"
    exit 1
fi

# Install required packages if not already installed
echo "Installing required packages..."
apt-get update
apt-get install -y postgresql-client

# Install Node.js if not already installed
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_16.x | bash -
    apt-get install -y nodejs
fi

# Install required npm packages
echo "Installing npm packages..."
npm install --prefix /opt/okr nodemailer dotenv

# Create backup user and group if they don't exist
if ! id -u okr-backup >/dev/null 2>&1; then
    echo "Creating backup user..."
    adduser --system --group --no-create-home --shell /bin/false okr-backup
fi

# Create directories
mkdir -p /var/backups/okr
mkdir -p /var/log/okr
chown -R okr-backup:okr-backup /var/backups/okr /var/log/okr
chmod 750 /var/backups/okr /var/log/okr

# Install backup script
BACKUP_SCRIPT_DIR="/opt/okr/scripts"
mkdir -p "$BACKUP_SCRIPT_DIR"
cp "$(dirname "$0")/backup-db.js" "$BACKUP_SCRIPT_DIR/"
chown -R okr-backup:okr-backup "$BACKUP_SCRIPT_DIR"
chmod 750 "$BACKUP_SCRIPT_DIR"
chmod 750 "$BACKUP_SCRIPT_DIR/backup-db.js"

# Install systemd service and timer
cp "$(dirname "$0")/okr-backup.service" /etc/systemd/system/
cp "$(dirname "$0")/okr-backup.timer" /etc/systemd/system/
chmod 644 /etc/systemd/system/okr-backup.{service,timer}

# Create environment file if it doesn't exist
if [ ! -f "/etc/okr/.env" ]; then
    mkdir -p /etc/okr
    touch /etc/okr/.env
    chown -R okr-backup:okr-backup /etc/okr
    chmod 640 /etc/okr/.env
    echo "Created /etc/okr/.env - please add your DATABASE_URL and other required environment variables"
fi

# Reload systemd
systemctl daemon-reload

# Enable and start the timer
systemctl enable okr-backup.timer
systemctl start okr-backup.timer

# Show status
echo "Backup system installed successfully!"
echo "Next steps:"
echo "1. Edit /etc/okr/.env and add your DATABASE_URL and other required environment variables"
echo "2. Test the backup manually with: sudo -u okr-backup node /opt/okr/scripts/backup-db.js"
echo "3. Check the backup log: tail -f /var/log/okr/backup.log"
echo "4. Check timer status: systemctl list-timers | grep okr-backup"
