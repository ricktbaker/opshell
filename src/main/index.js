'use strict'

import { app, BrowserWindow, ipcMain } from 'electron'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 563,
    useContentSize: true,
    width: 1000
  })

  mainWindow.loadURL(winURL)

  mainWindow.on('closed', () => {
    mainWindow = null
  })

  mainWindow.on('resize', () => {
    mainWindow.send('resize')
  })

  require('./menu')
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

ipcMain.on('showAlert', (e, data) => {
  mainWindow.send('showAlert', data)
})

ipcMain.on('updateOrgSelect', () => {
  mainWindow.send('updateOrgSelect')
})

ipcMain.on('orgSettings', (e, org) => {
  mainWindow.send('orgSettings', org)
})

ipcMain.on('updateMenuOrg', () => {
  mainWindow.send('updateMenuOrg')
})

ipcMain.on('openTab', (e, data) => {
  mainWindow.send('openTab', data)
})

ipcMain.on('regionData', (e, data) => {
  mainWindow.send('regionData', data)
})

ipcMain.on('doSsh', (e, data) => {
  mainWindow.send('doSsh', data)
})

ipcMain.on('regionSettings', (e, data) => {
  mainWindow.send('regionSettings', data)
})

ipcMain.on('updateTabData', (e, data) => {
  mainWindow.send('updateTabData', data)
})

ipcMain.on('orgMenuToggle', (e, data) => {
  mainWindow.send('resize')
})

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
