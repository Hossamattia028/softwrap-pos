const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const Database = require('./database');
const BackupManager = require('./backup');

let mainWindow;
let db;
let backupManager;

// Single instance lock - prevent multiple instances
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  // Another instance is already running, quit this one
  app.quit();
} else {
  // This is the first instance
  
  // Someone tried to run a second instance, focus our window instead
  app.on('second-instance', (event, commandLine, workingDirectory) => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) {
        mainWindow.restore();
      }
      mainWindow.focus();
      mainWindow.show();
    } else {
      createWindow();
    }
  });

  function createWindow() {
    mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js'),
        contextIsolation: true,
        nodeIntegration: false
      },
      icon: path.join(__dirname, '../../assets/icons/icon.png')
    });

    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));

    // Open DevTools in development
    if (process.argv.includes('--dev')) {
      mainWindow.webContents.openDevTools();
    }

    mainWindow.on('closed', () => {
      mainWindow = null;
    });
  }

  app.whenReady().then(() => {
    // Initialize database
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'softwrap-pos.db');
    
    db = new Database(dbPath);
    db.initialize();

    // Initialize backup manager
    backupManager = new BackupManager(db, userDataPath);
    backupManager.startAutoBackup();

    // Setup IPC Handlers (MUST be after db and backupManager initialization)
    require('./ipc-handlers')(ipcMain, db, backupManager, app);

    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });

  app.on('window-all-closed', () => {
    // On Linux and Windows, quit the app when all windows are closed
    if (process.platform !== 'darwin') {
      cleanup();
      app.quit();
    }
  });

  app.on('before-quit', (event) => {
    cleanup();
  });

  app.on('will-quit', () => {
    cleanup();
  });

  // Cleanup function to ensure everything is properly closed
  function cleanup() {
    if (backupManager) {
      backupManager.stopAutoBackup();
      backupManager = null;
    }
    if (db) {
      db.close();
      db = null;
    }
  }
}

