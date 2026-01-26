# Ubuntu Database Backup Setup Guide

This guide will help you set up automated database backups for your OKR system on Ubuntu.

## Prerequisites

- Ubuntu server with root/sudo access
- PostgreSQL database running
- Node.js installed (the script will check and install if needed)
- Your project deployed to `/opt/okr` (or adjust paths accordingly)

## Step 1: Copy Backup Files to Server

First, copy the backup scripts to your Ubuntu server:

```bash
# On your local machine, use scp to copy files
scp scripts/backup-db.js scripts/okr-backup.service scripts/okr-backup.timer scripts/install-backup-system.sh user@your-server:/tmp/okr-backup/

# Or if you have the project on the server, navigate to the project directory
cd /opt/okr
```

## Step 2: Run Installation Script

SSH into your Ubuntu server and run the installation script as root:

```bash
# Make the script executable
chmod +x /tmp/okr-backup/install-backup-system.sh

# Run as root
sudo /tmp/okr-backup/install-backup-system.sh
```

Or if files are already in the project directory:

```bash
cd /opt/okr
sudo chmod +x scripts/install-backup-system.sh
sudo scripts/install-backup-system.sh
```

This script will:
- Install PostgreSQL client tools
- Install Node.js (if not present)
- Create `okr-backup` system user
- Create backup directories (`/var/backups/okr` and `/var/log/okr`)
- Copy backup scripts to `/opt/okr/scripts/`
- Install systemd service and timer files
- Set up proper permissions

## Step 3: Configure Environment Variables

Create or edit the environment file:

```bash
sudo nano /etc/okr/.env
```

Add your database connection string and optional email settings:

```env
# Required: Database connection
DATABASE_URL=postgresql://username:password@localhost:5432/okr_db

# Optional: Email notifications
EMAIL_NOTIFICATION=true
ADMIN_EMAIL=admin@example.com
SMTP_HOST=smtp.yandex.ru
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=your-email@yandex.ru
SMTP_PASS=your-app-password
SMTP_FROM=noreply@example.com
```

**Important:** Make sure the `okr-backup` user can read this file:
```bash
sudo chown okr-backup:okr-backup /etc/okr/.env
sudo chmod 640 /etc/okr/.env
```

## Step 4: Install Required npm Packages

The backup script requires `nodemailer` and `dotenv`. Install them:

```bash
# Navigate to your project directory
cd /opt/okr

# Install packages (as the user that owns the project)
npm install nodemailer dotenv @prisma/client
```

If your project uses a different Node.js setup, ensure these packages are available in the path where the backup script runs.

## Step 5: Test the Backup Manually

Before enabling automatic backups, test the script manually:

```bash
sudo -u okr-backup node /opt/okr/scripts/backup-db.js
```

Check the output and verify a backup file was created:

```bash
ls -lh /var/backups/okr/
tail -f /var/log/okr/backup.log
```

## Step 6: Enable and Start the Backup Timer

Enable the systemd timer to run backups automatically:

```bash
# Enable the timer (starts automatically on boot)
sudo systemctl enable okr-backup.timer

# Start the timer immediately
sudo systemctl start okr-backup.timer

# Check timer status
sudo systemctl status okr-backup.timer

# List all timers to see when next backup will run
systemctl list-timers | grep okr-backup
```

The default schedule is **every Sunday at 2:00 AM** with a randomized delay of up to 1 hour.

## Step 7: Verify Backup System

Check that everything is working:

```bash
# Check service status
sudo systemctl status okr-backup.service

# View recent logs
sudo journalctl -u okr-backup.service -n 50 --no-pager

# Check backup files
ls -lh /var/backups/okr/

# View backup log
sudo tail -f /var/log/okr/backup.log
```

## Backup Schedule Configuration

The backup runs weekly on Sundays at 2:00 AM by default. To change the schedule, edit the timer file:

```bash
sudo nano /etc/systemd/system/okr-backup.timer
```

Modify the `OnCalendar` line. Examples:
- Daily at 2 AM: `OnCalendar=*-*-* 02:00:00`
- Every Monday at 3 AM: `OnCalendar=Mon *-*-* 03:00:00`
- Twice daily (2 AM and 2 PM): `OnCalendar=*-*-* 02,14:00:00`

After editing, reload systemd:
```bash
sudo systemctl daemon-reload
sudo systemctl restart okr-backup.timer
```

## Manual Backup

To create a backup manually at any time:

```bash
sudo -u okr-backup node /opt/okr/scripts/backup-db.js
```

## Restoring from Backup

To restore a backup:

```bash
# Stop your application
sudo systemctl stop your-okr-app.service

# Restore the database (replace with your actual backup file)
sudo -u postgres pg_restore -d okr_db -c /var/backups/okr/okr-backup-2025-01-26T00-00-00Z.sql

# Or if using a different database user
pg_restore -h localhost -U your-db-user -d okr_db -c /var/backups/okr/okr-backup-2025-01-26T00-00-00Z.sql

# Restart your application
sudo systemctl start your-okr-app.service
```

## Backup Retention

The system automatically keeps the **4 most recent backups** and deletes older ones. To change this, edit `/opt/okr/scripts/backup-db.js` and modify the `KEEP_BACKUPS` constant.

## Troubleshooting

### Backup fails with "DATABASE_URL not set"
- Check that `/etc/okr/.env` exists and contains `DATABASE_URL`
- Verify file permissions: `sudo ls -la /etc/okr/.env`
- Test reading as backup user: `sudo -u okr-backup cat /etc/okr/.env`

### Backup fails with "pg_dump: command not found"
- Install PostgreSQL client: `sudo apt-get install postgresql-client`

### Permission denied errors
- Check directory permissions: `sudo ls -la /var/backups/okr/`
- Ensure `okr-backup` user owns directories: `sudo chown -R okr-backup:okr-backup /var/backups/okr /var/log/okr`

### Email notifications not working
- Check SMTP settings in `/etc/okr/.env`
- Verify `EMAIL_NOTIFICATION=true` is set
- Test email script: `sudo -u okr-backup node /opt/okr/scripts/email-notification.js recipient@example.com "Test" "Test message"`

## Monitoring

### View Backup History in Database

The backup system logs all backups to the `BackupLog` table. You can query it:

```sql
SELECT * FROM "BackupLog" ORDER BY "created_at" DESC LIMIT 10;
```

### Check Backup File Integrity

```bash
# List contents of a backup file
pg_restore -l /var/backups/okr/okr-backup-YYYY-MM-DDTHH-MM-SSZ.sql
```

## Security Notes

- Backup files are stored with permissions `600` (read/write for owner only)
- The `okr-backup` user has minimal privileges
- Environment file with database credentials has restricted permissions (`640`)
- Consider encrypting backups if they contain sensitive data
- For production, consider storing backups off-site or in cloud storage
