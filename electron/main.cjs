const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');

const isMac = process.platform === 'darwin';
const isWin = process.platform === 'win32';

let mainWindow = null;

// Ensure single app instance
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
}

function createApplicationMenu() {
  const template = [
    ...(isMac
      ? [
          {
            label: 'Thermal Studio',
            submenu: [
              { role: 'about' },
              { type: 'separator' },
              { role: 'services' },
              { type: 'separator' },
              { role: 'hide' },
              { role: 'hideOthers' },
              { role: 'unhide' },
              { type: 'separator' },
              { role: 'quit' }
            ]
          }
        ]
      : []),
    {
      label: 'File',
      submenu: [
        {
          label: 'New Receipt',
          accelerator: isMac ? 'Cmd+N' : 'Ctrl+N',
          click: () => {
            mainWindow?.webContents.executeJavaScript('window.dispatchEvent(new KeyboardEvent("keydown", { key: "n", metaKey: true, ctrlKey: true }))');
          }
        },
        {
          label: 'Print to Thermal Head',
          accelerator: isMac ? 'Cmd+P' : 'Ctrl+P',
          click: () => {
            mainWindow?.webContents.executeJavaScript('window.dispatchEvent(new KeyboardEvent("keydown", { key: "p", metaKey: true, ctrlKey: true }))');
          }
        },
        { type: 'separator' },
        isMac ? { role: 'close' } : { role: 'quit' }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        ...(isMac
          ? [{ type: 'separator' }, { role: 'front' }, { type: 'window' }]
          : [{ role: 'close' }])
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}

function createWindow() {
  const windowConfig = {
    width: 1240,
    height: 860,
    minWidth: 840,
    minHeight: 640,
    title: 'Thermal Print Studio OS',
    backgroundColor: '#0c0a09', // Deep Minimal OS Stone-950
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      enableWebSQL: false
    }
  };

  // macOS specific native window chrome
  if (isMac) {
    windowConfig.titleBarStyle = 'hiddenInset';
    windowConfig.trafficLightPosition = { x: 18, y: 18 };
  } else if (isWin) {
    // Windows 11 Fluent dark titlebar controls
    windowConfig.titleBarStyle = 'hidden';
    windowConfig.titleBarOverlay = {
      color: '#0c0a09',
      symbolColor: '#e7e5e4',
      height: 38
    };
  }

  mainWindow = new BrowserWindow(windowConfig);

  // Automatically grant Web Bluetooth permissions in Electron
  mainWindow.webContents.on('select-bluetooth-device', (event, deviceList, callback) => {
    event.preventDefault();
    if (deviceList && deviceList.length > 0) {
      // Pick first thermal printer found or let user choose
      const printer =
        deviceList.find(
          (d) =>
            d.deviceName &&
            (d.deviceName.toLowerCase().includes('x5') ||
              d.deviceName.toLowerCase().includes('cat') ||
              d.deviceName.toLowerCase().includes('print'))
        ) || deviceList[0];
      callback(printer.deviceId);
    } else {
      callback('');
    }
  });

  // Automatically grant Serial & Bluetooth device permissions
  mainWindow.webContents.session.setPermissionCheckHandler((webContents, permission) => {
    if (permission === 'bluetooth' || permission === 'serial') {
      return true;
    }
    return true;
  });

  mainWindow.webContents.session.setDevicePermissionHandler((details) => {
    if (details.deviceType === 'bluetooth' || details.deviceType === 'serial') {
      return true;
    }
    return true;
  });

  // Open external links in default system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  const isDev = process.env.NODE_ENV === 'development';
  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  createApplicationMenu();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (!isMac) app.quit();
});
