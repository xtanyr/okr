#!/bin/bash

# Exit on error
set -e

echo "=== Testing OKR Backup and Restore ==="

# Check if running as root
if [ "$(id -u)" -ne 0 ]; then
    echo "This script must be run as root"
    exit 1
fi

# Create a test database
TEST_DB="okr_backup_test_$(date +%s)"
TEST_USER="okr_test_$(date +%s)"
TEST_PASSWORD="test_$(openssl rand -hex 8)"

# Get the database owner (usually postgres)
DB_OWNER=$(psql -t -c "SELECT usename FROM pg_user WHERE usesysid = 1;" | tr -d '[:space:]')

# Create test database and user
echo "Creating test database and user..."
sudo -u $DB_OWNER psql -c "CREATE DATABASE $TEST_DB;"
sudo -u $DB_OWNER psql -c "CREATE USER $TEST_USER WITH PASSWORD '$TEST_PASSWORD';"
sudo -u $DB_OWNER psql -c "GRANT ALL PRIVILEGES ON DATABASE $TEST_DB TO $TEST_USER;"

# Set up environment for testing
TEST_ENV_FILE="/tmp/okr-test-env-$(date +%s).env"
cat > "$TEST_ENV_FILE" << EOF
DATABASE_URL=postgresql://$TEST_USER:$TEST_PASSWORD@localhost:5432/$TEST_DB
EMAIL_NOTIFICATION=false
EOF

# Run Prisma migrations
echo "Running migrations on test database..."
cp "$TEST_ENV_FILE" .env
npx prisma migrate deploy

# Create some test data
echo "Creating test data..."
npx prisma db seed

# Create a backup
echo "Creating backup..."
BACKUP_FILE="/tmp/okr-test-backup-$(date +%s).sql"
PGPASSWORD="$TEST_PASSWORD" pg_dump -h localhost -U "$TEST_USER" -d "$TEST_DB" -F c -f "$BACKUP_FILE"

# Drop and recreate the database
echo "Dropping test database..."
sudo -u $DB_OWNER psql -c "DROP DATABASE $TEST_DB;"
sudo -u $DB_OWNER psql -c "CREATE DATABASE $TEST_DB;"
sudo -u $DB_OWNER psql -c "GRANT ALL PRIVILEGES ON DATABASE $TEST_DB TO $TEST_USER;"

# Restore from backup
echo "Restoring from backup..."
PGPASSWORD="$TEST_PASSWORD" pg_restore -h localhost -U "$TEST_USER" -d "$TEST_DB" "$BACKUP_FILE"

# Verify the restore
echo "Verifying restore..."
TABLE_COUNT=$(PGPASSWORD="$TEST_PASSWORD" psql -h localhost -U "$TEST_USER" -d "$TEST_DB" -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d '[:space:]')

if [ "$TABLE_COUNT" -gt 0 ]; then
    echo "✅ Restore verified successfully! Found $TABLE_COUNT tables."
    echo "=== Backup and Restore Test PASSED ==="
    # Clean up
    sudo -u $DB_OWNER psql -c "DROP DATABASE $TEST_DB;"
    sudo -u $DB_OWNER psql -c "DROP USER $TEST_USER;"
    rm -f "$BACKUP_FILE"
    rm -f "$TEST_ENV_FILE"
    exit 0
else
    echo "❌ Restore verification failed! No tables found in the restored database."
    echo "=== Backup and Restore Test FAILED ==="
    # Leave the test database for inspection
    echo "Test database left for inspection: $TEST_DB"
    echo "Test user: $TEST_USER"
    echo "Backup file: $BACKUP_FILE"
    exit 1
fi
