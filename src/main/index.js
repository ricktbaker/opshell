'use strict';

import { app, BrowserWindow, ipcMain } from 'electron';

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`;

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  });

  mainWindow.loadURL(winURL);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  mainWindow.on('resize', () => {
    mainWindow.send('resize');
  });

  require('./menu');
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('alertbox.show', (e, data) => {
  mainWindow.send('alertbox.show', data);
});

ipcMain.on('orgmenu.updateSelectBox', () => {
  mainWindow.send('orgmenu.updateSelectBox');
});

ipcMain.on('mainview.closeTab', (e, tabId) => {
  mainWindow.send('mainview.closeTab', tabId);
});

ipcMain.on('orgmenu.updateSelectedOrg', () => {
  mainWindow.send('orgmenu.updateSelectedOrg');
});

ipcMain.on('orgsettings.loadData', (e, data) => {
  mainWindow.send('orgsettings.loadData', data);
});

ipcMain.on('mainview.openTab', (e, data) => {
  mainWindow.send('mainview.openTab', data);
});

ipcMain.on('cloudservice.data', (e, data) => {
  mainWindow.send('cloudservice.data', data);
});

ipcMain.on('sshconnection.doSsh', (e, data) => {
  mainWindow.send('sshconnection.doSsh', data);
});

ipcMain.on('cloudservice.updateTabData', (e, data) => {
  mainWindow.send('cloudservice.updateTabData', data);
});

ipcMain.on('orgMenuToggle', (e, data) => {
  mainWindow.send('resize');
});

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
