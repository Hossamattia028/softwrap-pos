const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const extract = require('extract-zip');
const crypto = require('crypto');

class BackupManager {
  constructor(database, userDataPath) {
    this.db = database;
    this.userDataPath = userDataPath;
    this.backupDir = path.join(userDataPath, 'backups');
    this.autoBackupInterval = null;
    
    // Create backup directory if it doesn't exist
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  startAutoBackup() {
    // Get backup interval from settings (in minutes)
    const settings = this.db.getDb().prepare('SELECT value FROM settings WHERE key = ?').get('backup_interval');
    const intervalMinutes = settings ? parseInt(settings.value) : 60;
    
    // Auto backup every N minutes
    this.autoBackupInterval = setInterval(() => {
      this.createBackup('auto');
    }, intervalMinutes * 60 * 1000);

    console.log(`Auto backup started: every ${intervalMinutes} minutes`);
  }

  stopAutoBackup() {
    if (this.autoBackupInterval) {
      clearInterval(this.autoBackupInterval);
      this.autoBackupInterval = null;
    }
  }

  async createBackup(type = 'manual') {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupName = `backup_${type}_${timestamp}`;
      const backupPath = path.join(this.backupDir, `${backupName}.zip`);
      
      // Create write stream
      const output = fs.createWriteStream(backupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', () => {
        // Calculate checksum
        const fileBuffer = fs.readFileSync(backupPath);
        const checksum = crypto.createHash('sha256').update(fileBuffer).digest('hex');
        
        // Save backup metadata
        const metadataPath = path.join(this.backupDir, `${backupName}.json`);
        const metadata = {
          name: backupName,
          type,
          timestamp: new Date().toISOString(),
          size: archive.pointer(),
          checksum
        };
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 2));

        // Clean old backups (keep last 14)
        this.cleanOldBackups();

        resolve({ success: true, path: backupPath, metadata });
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);

      // Add database file
      const dbPath = path.join(this.userDataPath, 'softwrap-pos.db');
      if (fs.existsSync(dbPath)) {
        archive.file(dbPath, { name: 'database.db' });
      }

      // Add settings and config
      const settingsData = this.db.getDb().prepare('SELECT * FROM settings').all();
      archive.append(JSON.stringify(settingsData, null, 2), { name: 'settings.json' });

      // Add metadata
      archive.append(JSON.stringify({
        version: '1.0.0',
        created_at: new Date().toISOString(),
        type
      }, null, 2), { name: 'backup-info.json' });

      archive.finalize();
    });
  }

  async restoreBackup(backupPath) {
    return new Promise(async (resolve, reject) => {
      try {
        // Verify backup file exists
        if (!fs.existsSync(backupPath)) {
          throw new Error('Backup file not found');
        }

        // Create current state backup before restore
        await this.createBackup('pre-restore');

        // Extract to temp directory
        const tempDir = path.join(this.userDataPath, 'temp-restore');
        if (fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
        }
        fs.mkdirSync(tempDir, { recursive: true });

        await extract(backupPath, { dir: tempDir });

        // Close current database connection
        this.db.close();

        // Replace database file
        const extractedDbPath = path.join(tempDir, 'database.db');
        const currentDbPath = path.join(this.userDataPath, 'softwrap-pos.db');
        
        if (fs.existsSync(extractedDbPath)) {
          fs.copyFileSync(extractedDbPath, currentDbPath);
        }

        // Clean up temp directory
        fs.rmSync(tempDir, { recursive: true, force: true });

        // Reinitialize database
        const Database = require('./database');
        const newDb = new Database(currentDbPath);
        this.db = newDb;

        resolve({ success: true, message: 'Backup restored successfully' });
      } catch (error) {
        reject(error);
      }
    });
  }

  cleanOldBackups() {
    const files = fs.readdirSync(this.backupDir)
      .filter(f => f.endsWith('.zip'))
      .map(f => ({
        name: f,
        path: path.join(this.backupDir, f),
        time: fs.statSync(path.join(this.backupDir, f)).mtime.getTime()
      }))
      .sort((a, b) => b.time - a.time);

    // Keep only last 14 backups
    if (files.length > 14) {
      files.slice(14).forEach(file => {
        fs.unlinkSync(file.path);
        // Also delete metadata file
        const metadataPath = file.path.replace('.zip', '.json');
        if (fs.existsSync(metadataPath)) {
          fs.unlinkSync(metadataPath);
        }
      });
    }
  }

  listBackups() {
    const files = fs.readdirSync(this.backupDir)
      .filter(f => f.endsWith('.json') && !f.includes('backup-info'))
      .map(f => {
        const content = fs.readFileSync(path.join(this.backupDir, f), 'utf8');
        return JSON.parse(content);
      })
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return files;
  }

  exportBackup(backupName, destinationPath) {
    const sourcePath = path.join(this.backupDir, `${backupName}.zip`);
    if (fs.existsSync(sourcePath)) {
      fs.copyFileSync(sourcePath, destinationPath);
      return { success: true, path: destinationPath };
    }
    throw new Error('Backup not found');
  }
}

module.exports = BackupManager;

