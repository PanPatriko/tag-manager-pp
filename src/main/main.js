const { app, BrowserWindow} = require('electron');
const path = require('path');

require('./ipcHandlers');

function createWindow () {
  const win = new BrowserWindow({
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      enableRemoteModule: false,
      nodeIntegration: false,
    } 
  })
  win.maximize();
  win.loadFile('src/renderer/index.html')

  win.webContents.on('before-input-event', (event, input) => {
    if (!input.shift && input.control && input.key.toLowerCase() === 'r') {
      event.preventDefault();
    }
  });
}

app.whenReady().then(() => {
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})