const { app, BrowserWindow, globalShortcut, ipcMain } = require('electron');
const path = require('path');
const url = require('url');

let mainWindow;
let lastAltPressTime = 0;
const DOUBLE_PRESS_INTERVAL = 300;

function createWindow() {
  mainWindow = new BrowserWindow({
    titleBarStyle: 'hidden',
    frame: false,
    width: 900,
    height: 600,
    transparent: true
  });

  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }));

  mainWindow.setAlwaysOnTop(true);
  mainWindow.on('closed', () => { mainWindow = null; });
  mainWindow.on('minimize', () => { console.log("UI adjustment on minimize"); });
}

function registerShortcuts() {
  // 改用合法组合键，比如 Alt+G
  const success = globalShortcut.register('Alt+G', () => {
    const now = Date.now();
    if (now - lastAltPressTime < DOUBLE_PRESS_INTERVAL) {
      mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
    }
    lastAltPressTime = now;
  });

  if (!success) {
    console.error('注册 Alt+G 失败，可能已被系统占用');
  }
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
  else mainWindow.show(); // 激活时显示窗口
});