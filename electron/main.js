const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const fs = require('fs')

let DATA_FILE

function getDataFile() {
  if (!DATA_FILE) {
    DATA_FILE = path.join(app.getPath('userData'), 'tasks.json')
  }
  return DATA_FILE
}

function loadData() {
  try {
    const file = getDataFile()
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf-8'))
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  return []
}

function saveData(tasks) {
  const file = getDataFile()
  fs.writeFileSync(file, JSON.stringify(tasks, null, 2))
}

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
  ipcMain.handle('load-tasks', () => loadData())
  ipcMain.handle('save-tasks', (event, tasks) => {
    saveData(tasks)
    return true
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
