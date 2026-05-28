const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { init, loadData, saveData } = require('./persistence')

let mainWindow

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    backgroundColor: '#FFFFFF'
  })

  // 开发环境加载localhost，生产环境加载打包后的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  init(app.getPath('userData'))

  ipcMain.handle('load-tasks', () => loadData())
  ipcMain.handle('save-tasks', (event, tasks) => {
    try {
      saveData(tasks)
      return { success: true }
    } catch (e) {
      console.error('Failed to save tasks:', e)
      return { success: false, error: e.message }
    }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})