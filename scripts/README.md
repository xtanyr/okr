# OKR System Backup

This directory contains scripts for backing up the OKR system database.

## Files

- `backup-db.js` - Main backup script
- `okr-backup.service` - Systemd service file
- `okr-backup.timer` - Systemd timer for weekly backups
- `install-backup-system.sh` - Installation script for Ubuntu
- `setup-backup-task.ps1` - Windows task scheduler setup (for development)

## Installation on Ubuntu

1. Copy all files to your server:
   ```bash
   mkdir -p /opt/okr/scripts
   cp backup-db.js okr-backup.service okr-backup.timer install-backup-system.sh /opt/okr/scripts/
   ```

2. Run the installation script as root:
   ```bash
   chmod +x /opt/okr/scripts/install-backup-system.sh
   sudo /opt/okr/scripts/install-backup-system.sh
   ```

3. Configure the environment:
   ```bash
   sudo nano /etc/okr/.env
   ```
   Add your database URL:
   ```
   DATABASE_URL=postgresql://user:password@localhost:5432/okr_db
   ```

## Manual Backup

To create a manual backup:

```bash
sudo -u okr-backup node /opt/okr/scripts/backup-db.js
```

## Monitoring

Check backup logs:
```bash
sudo tail -f /var/log/okr/backup.log
```

Check backup status:
```bash
sudo systemctl status okr-backup.service
```

List upcoming backup times:
```bash
sudo systemctl list-timers | grep okr-backup
```

## Backup Location

Backups are stored in `/var/backups/okr/` with the following naming pattern:
- `okr-backup-<timestamp>.sql` - Individual backup files
- `okr-latest.sql` - Symlink to the most recent backup

## Restoring from Backup

To restore from a backup:

```bash
# Stop the application
sudo systemctl stop your-okr-app.service

# Restore the database
sudo -u postgres pg_restore -d okr_db /var/backups/okr/okr-backup-2023-01-01T00-00-00Z.sql

# Restart the application
sudo systemctl start your-okr-app.service
```

## Testing the Backup System

To test the backup and restore process:

```bash
# Make the test script executable
chmod +x /opt/okr/scripts/test-backup-restore.sh

# Run the test (as root)
sudo /opt/okr/scripts/test-backup-restore.sh
```

## Maintenance

The system keeps the 4 most recent backups and automatically removes older ones.

### Verifying Backups

You can verify the integrity of a backup without restoring it:

```bash
# List the contents of a backup
pg_restore -l /var/backups/okr/okr-backup-2023-01-01T00-00-00Z.sql

# Check for errors in the backup
pg_restore --list /var/backups/okr/okr-backup-2023-01-01T00-00-00Z.sql | grep -v "^;" | grep -v "^;"
```

### Monitoring

Check the status of the backup service:

```bash
# View service status
sudo systemctl status okr-backup.service

# View timer status
systemctl list-timers | grep okr-backup

# View logs
sudo journalctl -u okr-backup.service -n 50 --no-pager
```
