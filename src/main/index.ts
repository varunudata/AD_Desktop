import { app, BrowserWindow, shell } from 'electron';
import path from 'path';
import fs from 'fs';
import { registerIPCHandlers } from './ipc';
import { disconnectPrisma } from './database/prisma';

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string | undefined;
declare const MAIN_WINDOW_VITE_NAME: string;

let mainWindow: BrowserWindow | null = null;

function getPreloadPath(): string {
  const candidates = [
    path.join(__dirname, 'index.cjs'),
    path.join(__dirname, 'preload.cjs'),
    path.join(__dirname, 'preload.js'),
    path.join(__dirname, 'index.js'),
    path.join(__dirname, '../preload/index.cjs'),
    path.join(__dirname, '../preload/index.js'),
    path.join(process.cwd(), '.vite/build/index.cjs'),
    path.join(process.cwd(), '.vite/build/preload.cjs'),
  ];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      console.log('[Main] Successfully resolved preload script at:', candidate);
      return candidate;
    }
  }

  console.error('[Main] ERROR: Preload script not found in candidates:', candidates);
  return candidates[0];
}


function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1200,
    minHeight: 720,
    title: 'ClassFlow — Smart Classroom & Resource Scheduling System',
    backgroundColor: '#F5F7FB',
    titleBarStyle: 'hiddenInset', // Mac modern integrated titlebar
    trafficLightPosition: { x: 18, y: 16 },
    webPreferences: {
      preload: getPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Safe external navigation: Open all external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL && url.startsWith(MAIN_WINDOW_VITE_DEV_SERVER_URL)) {
      return;
    }
    if (url.startsWith('http:') || url.startsWith('https:')) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  // Load renderer
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
} else {
  app.on('second-instance', () => {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore();
      mainWindow.focus();
    }
  });

  app.whenReady().then(() => {
    registerIPCHandlers();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

// Graceful cleanup on quit
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', async () => {
  await disconnectPrisma();
});
