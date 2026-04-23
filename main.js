const { app, BrowserWindow, globalShortcut, ipcMain, Tray, Menu } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;
let tray;
let lastAltPressTime = 0;
const DOUBLE_PRESS_INTERVAL = 300;

function createWindow() {
  mainWindow = new BrowserWindow({
    titleBarStyle: 'hidden',
    frame: false,
    width: 900,
    height: 600,
    transparent: true,
    skipTaskbar: true, // 隐藏任务栏图标
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webviewTag: true
    }
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.setAlwaysOnTop(true);
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.on('minimize', () => { console.log("UI adjustment on minimize"); });
  
  // 创建托盘图标
  createTray();
}

function createTray() {
  const iconPath = path.join(__dirname, 'assets', 'icon.png');
  
  // 尝试多个可能的图标名称
  let trayIcon;
  const possibleIcons = ['icon.png', 'icon.ico', 'icon64.png'];
  for (let icon of possibleIcons) {
    let testPath = path.join(__dirname, 'assets', icon);
    try {
      tray = new Tray(testPath);
      trayIcon = testPath;
      break;
    } catch (e) {
      continue;
    }
  }
  
  if (!tray) {
    console.error('Failed to create tray icon');
    return;
  }
  
  const contextMenu = Menu.buildFromTemplate([
    { label: '显示/隐藏', click: () => {
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
          // Send message to renderer to restore border
          mainWindow.webContents.send('restore-border');
        }
      }
    }},
    { type: 'separator' },
    { label: '退出', click: () => {
      app.quit();
    }}
  ]);
  
  tray.setToolTip('ZenView Browser');
  tray.setContextMenu(contextMenu);
  
  // 双击托盘图标显示/隐藏
  tray.on('double-click', () => {
    if (mainWindow) {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        mainWindow.show();
        mainWindow.focus();
        // Send message to renderer to restore border
        mainWindow.webContents.send('restore-border');
      }
    }
  });
  
  // 防止托盘图标在窗口关闭时消失
  app.on('window-all-closed', (e) => {
    e.preventDefault(); // 阻止默认关闭行为
  });
}

function registerShortcuts() {
  // 注册全局快捷键双击 Backquote 键（ESC 下面的 `·` 键）来显示/隐藏窗口
  // 这是为了弥补双击中键在窗口隐藏后无法恢复的问题
  let lastBackquotePressTime = 0;
  const DOUBLE_PRESS_INTERVAL = 300;
  
  const success = globalShortcut.register('`', () => {
    const now = Date.now();
    if (now - lastBackquotePressTime < DOUBLE_PRESS_INTERVAL) {
      // 双击 Backquote 键
      if (mainWindow) {
        if (mainWindow.isVisible()) {
          mainWindow.hide();
        } else {
          mainWindow.show();
          mainWindow.focus();
          // Send message to renderer to restore border
          mainWindow.webContents.send('restore-border');
        }
      }
    }
    lastBackquotePressTime = now;
  });

  if (success) {
    console.log('Global shortcut double Backtick (`) registered for show/hide window');
  } else {
    console.error('注册 Backtick 失败，可能已被系统占用');
  }
  
  console.log('Shortcuts:');
  console.log('1. Double middle click to show/hide window (when window is visible)');
  console.log('2. Double Backtick (`) to show/hide window (works even when window is hidden)');
  console.log('3. Double-click tray icon to show/hide window');
}

app.on('ready', () => {
  createWindow();
  registerShortcuts();
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});



app.on('activate', () => {
  if (mainWindow === null) createWindow();
  else {
    mainWindow.show(); // 激活时显示窗口
    mainWindow.webContents.send('restore-border');
  }
});
