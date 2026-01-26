const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { sendEmail } = require('./email-notification');

// Load environment variables
require('dotenv').config({ path: '/etc/okr/.env' });

// Configuration
const BACKUP_DIR = '/var/backups/okr';
const KEEP_BACKUPS = 4; // Number of backups to keep
const LOG_FILE = '/var/log/okr/backup.log';

// Ensure backup directory exists
const ensureDirectoryExists = (dir) => {
  if (!fs.existsSync(dir)) {
    try {
      fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
      console.log(`Created directory: ${dir}`);
    } catch (err) {
      console.error(`Failed to create directory ${dir}:`, err);
      process.exit(1);
    }
  }
};

// Ensure log directory exists
const logDir = path.dirname(LOG_FILE);
ensureDirectoryExists(logDir);

// Log function
const log = (message) => {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}\n`;
  console.log(message);
  fs.appendFileSync(LOG_FILE, logMessage, { mode: 0o644 });
};

// Ensure backup directory exists
ensureDirectoryExists(BACKUP_DIR);

// Generate timestamp for filename
const now = new Date();
const timestamp = now.toISOString().replace(/[:.]/g, '-');
const backupFile = path.join(BACKUP_DIR, `okr-backup-${timestamp}.sql`);
const backupLogFile = path.join(BACKUP_DIR, 'latest-backup.log');

// Get database URL from environment variables
const prisma = new PrismaClient();
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  const errorMsg = 'Error: DATABASE_URL environment variable is not set';
  log(errorMsg);
  process.exit(1);
}

// Parse database URL to extract connection details
const dbConfig = new URL(dbUrl);
const dbName = dbConfig.pathname.replace(/^\/+/, '');
const dbUser = dbConfig.username;
const dbPass = dbConfig.password;
const dbHost = dbConfig.hostname;
const dbPort = dbConfig.port || '5432'; // Default PostgreSQL port

// Create backup using pg_dump (PostgreSQL)
const runBackup = async () => {
  log(`Starting database backup to ${backupFile}...`);
  
  let result = { success: false, file: null, error: null };
  
  try {
    // Create backup using pg_dump with proper escaping
    const cmd = `PGPASSWORD="${dbPass}" pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -F c -f ${backupFile}`;
    
    log(`Executing: ${cmd.replace(/:.*@/, ':***@')}`); // Hide password in logs
    
    execSync(cmd, { 
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, PGPASSWORD: dbPass }
    });
    
    // Set proper permissions
    fs.chmodSync(backupFile, 0o600);
    
    log(`Backup completed successfully: ${backupFile} (${fs.statSync(backupFile).size} bytes)`);
    
    // Create a symlink to the latest backup
    const latestBackup = path.join(BACKUP_DIR, 'okr-latest.sql');
    if (fs.existsSync(latestBackup)) {
      fs.unlinkSync(latestBackup);
    }
    fs.symlinkSync(backupFile, latestBackup);
    
    // Clean up old backups (keep only KEEP_BACKUPS most recent)
    const files = fs.readdirSync(BACKUP_DIR)
      .filter(file => file.startsWith('okr-backup-') && file.endsWith('.sql'))
      .sort()
      .reverse();
    
    if (files.length > KEEP_BACKUPS) {
      const filesToDelete = files.slice(KEEP_BACKUPS);
      filesToDelete.forEach(file => {
        const filePath = path.join(BACKUP_DIR, file);
        log(`Removing old backup: ${filePath}`);
        fs.unlinkSync(filePath);
      });
    }
    
    // Log backup completion to database
    try {
      await prisma.$executeRaw`
        INSERT INTO "BackupLog" ("type", "status", "file_path", "created_at")
        VALUES ('scheduled', 'completed', ${backupFile}, ${now.toISOString()})
      `;
      log('Backup logged to database successfully');
    } catch (dbError) {
      log(`Warning: Failed to log backup to database: ${dbError.message}`);
    }
    
    result = { success: true, file: backupFile, error: null };
    return result;
  } catch (error) {
    const errorMsg = `Backup failed: ${error.message}\n${error.stderr ? error.stderr.toString() : ''}`;
    log(errorMsg);
    
    // Log backup failure to database
    try {
      await prisma.$executeRaw`
        INSERT INTO "BackupLog" ("type", "status", "error", "created_at")
        VALUES ('scheduled', 'failed', ${error.message}, ${new Date().toISOString()})
      `;
    } catch (dbError) {
      log(`Warning: Failed to log backup failure to database: ${dbError.message}`);
    }
    
    result = { success: false, file: null, error: errorMsg };
    return result;
  } finally {
    try {
      await prisma.$disconnect();
    } catch (e) {
      log(`Warning: Error disconnecting from database: ${e.message}`);
    }
    
    // Send email notification if configured
    if (process.env.EMAIL_NOTIFICATION === 'true' && process.env.ADMIN_EMAIL) {
      const status = result.success ? 'SUCCESS' : 'FAILED';
      const subject = `OKR Backup ${status} - ${new Date().toLocaleString()}`;
      const text = result.success 
        ? `Backup completed successfully.\nFile: ${result.file}\nSize: ${fs.statSync(result.file).size} bytes`
        : `Backup failed.\nError: ${result.error}`;
      
      try {
        await sendEmail({
          to: process.env.ADMIN_EMAIL,
          subject,
          text,
          html: `
            <h2>OKR Backup ${status}</h2>
            <p>${text.replace(/\n/g, '<br>')}</p>
            <p>Logs are available at: ${LOG_FILE}</p>
          `,
          attachments: [{
            filename: 'backup-log.txt',
            content: fs.readFileSync(LOG_FILE, 'utf8')
          }]
        });
      } catch (emailError) {
        log(`Warning: Failed to send email notification: ${emailError.message}`);
      }
    }
  }
};

// Run the backup and handle process exit
runBackup()
  .then(({ success, file, error }) => {
    if (success) {
      log(`Backup process completed successfully: ${file}`);
      process.exit(0);
    } else {
      log(`Backup process failed: ${error}`);
      process.exit(1);
    }
  })
  .catch(error => {
    log(`Unhandled error in backup process: ${error.message}\n${error.stack}`);
    process.exit(1);
  });
