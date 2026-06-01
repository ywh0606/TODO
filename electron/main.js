const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification, dialog } = require('electron')
const path = require('path')
const { autoUpdater } = require('electron-updater')
const { init, loadData, saveData, loadHabits, saveHabits, loadPomodoros, savePomodoros, loadPetData, savePetData } = require('./persistence')

let mainWindow
let tray = null
let isQuitting = false

// ============================================================
// Pomodoro timer state (runs in main process)
// ============================================================
const WORK_SECONDS = 25 * 60
const BREAK_SECONDS = 5 * 60
const LONG_BREAK_SECONDS = 15 * 60

let pomodoroState = {
  status: 'idle',   // 'idle' | 'work' | 'break' | 'long-break'
  remainingSeconds: 0,
  currentRound: 1
}
let pomodoroInterval = null

function sendToRenderer(channel, data) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data)
  }
}

function startPomodoroTimer() {
  if (pomodoroInterval) clearInterval(pomodoroInterval)

  pomodoroState.status = 'work'
  pomodoroState.remainingSeconds = WORK_SECONDS
  pomodoroState.currentRound = 1

  pomodoroInterval = setInterval(() => {
    pomodoroState.remainingSeconds--
    sendToRenderer('pomodoro-tick', { ...pomodoroState })

    if (pomodoroState.remainingSeconds <= 0) {
      if (pomodoroState.status === 'work') {
        // Work session completed
        new Notification({ title: '专注完成！', body: '休息一下吧 🎉' }).show()
        sendToRenderer('pomodoro-complete', { type: 'work-complete', round: pomodoroState.currentRound })

        if (pomodoroState.currentRound % 4 === 0) {
          pomodoroState.status = 'long-break'
          pomodoroState.remainingSeconds = LONG_BREAK_SECONDS
        } else {
          pomodoroState.status = 'break'
          pomodoroState.remainingSeconds = BREAK_SECONDS
        }
        pomodoroState.currentRound++
      } else {
        // Break completed
        new Notification({ title: '休息结束！', body: '开始新的专注 🍅' }).show()
        sendToRenderer('pomodoro-complete', { type: 'break-complete' })

        pomodoroState.status = 'work'
        pomodoroState.remainingSeconds = WORK_SECONDS
      }
    }
  }, 1000)

  sendToRenderer('pomodoro-tick', { ...pomodoroState })
}

function stopPomodoroTimer() {
  if (pomodoroInterval) {
    clearInterval(pomodoroInterval)
    pomodoroInterval = null
  }
  pomodoroState = { status: 'idle', remainingSeconds: 0, currentRound: 1 }
  sendToRenderer('pomodoro-tick', { ...pomodoroState })
}

// ============================================================
// Habit reminders
// ============================================================
const habitReminderTimers = []

function scheduleHabitReminders() {
  habitReminderTimers.forEach(t => clearTimeout(t))
  habitReminderTimers.length = 0

  const data = loadHabits()
  const now = new Date()

  data.habits.forEach(habit => {
    if (!habit.reminderTime) return

    const [hours, minutes] = habit.reminderTime.split(':').map(Number)
    const reminderDate = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes, 0)
    const delay = reminderDate.getTime() - now.getTime()

    if (delay > 0) {
      const timer = setTimeout(() => {
        new Notification({
          title: '习惯提醒',
          body: `${habit.icon} ${habit.name} - 别忘了打卡！`
        }).show()
      }, delay)
      habitReminderTimers.push(timer)
    }
  })
}

// ============================================================
// Window & Tray
// ============================================================
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

  // 关闭窗口时最小化到托盘而非退出
  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })

  // 开发环境加载localhost，生产环境加载打包后的文件
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173')
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }
}

function createTray() {
  const iconPath = path.join(__dirname, '../assets/tray-icon.png')
  const icon = nativeImage.createFromPath(iconPath)
  tray = new Tray(icon)
  tray.setToolTip('我的清单')

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示窗口',
      click: () => {
        mainWindow.show()
        mainWindow.focus()
      }
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        isQuitting = true
        app.quit()
      }
    }
  ])

  tray.setContextMenu(contextMenu)

  // 点击托盘图标恢复窗口
  tray.on('click', () => {
    mainWindow.show()
    mainWindow.focus()
  })
}

// ============================================================
// App lifecycle & IPC handlers
// ============================================================
app.whenReady().then(() => {
  app.setAppUserModelId('com.todo.app')
  init(app.getPath('userData'))

  // Tasks (existing)
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

  // Habits
  ipcMain.handle('load-habits', () => loadHabits())
  ipcMain.handle('save-habits', (event, data) => {
    try {
      saveHabits(data)
      scheduleHabitReminders()
      return { success: true }
    } catch (e) {
      console.error('Failed to save habits:', e)
      return { success: false, error: e.message }
    }
  })

  // Pomodoro persistence
  ipcMain.handle('load-pomodoros', () => loadPomodoros())
  ipcMain.handle('save-pomodoros', (event, data) => {
    try {
      savePomodoros(data)
      return { success: true }
    } catch (e) {
      console.error('Failed to save pomodoros:', e)
      return { success: false, error: e.message }
    }
  })

  // Pomodoro timer control
  ipcMain.handle('pomodoro-start', () => {
    startPomodoroTimer()
    return { success: true }
  })
  ipcMain.handle('pomodoro-stop', () => {
    stopPomodoroTimer()
    return { success: true }
  })

  // Pet persistence
  ipcMain.handle('load-pet', () => loadPetData())
  ipcMain.handle('save-pet', (event, data) => {
    try {
      savePetData(data)
      return { success: true }
    } catch (e) {
      console.error('Failed to save pet:', e)
      return { success: false, error: e.message }
    }
  })

  // Schedule habit reminders on start
  scheduleHabitReminders()

  // ============================================================
  // Auto-update (GitHub Releases)
  // ============================================================
  if (process.env.NODE_ENV !== 'development') {
    autoUpdater.checkForUpdates()

    autoUpdater.on('update-downloaded', (event) => {
      if (!mainWindow || mainWindow.isDestroyed()) return
      dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: '更新提示',
        message: `发现新版本 ${event.version}`,
        detail: '已下载完成，是否立即重启以更新？',
        buttons: ['立即更新', '稍后'],
        defaultId: 0,
        cancelId: 1
      }).then(({ response }) => {
        if (response === 0) {
          autoUpdater.quitAndInstall()
        }
      })
    })

    autoUpdater.on('error', (err) => {
      console.error('Auto-update error:', err)
    })
  }

  createWindow()
  createTray()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  isQuitting = true
  // Clean up pomodoro timer
  if (pomodoroInterval) clearInterval(pomodoroInterval)
  // Clean up habit reminders
  habitReminderTimers.forEach(t => clearTimeout(t))
})

app.on('window-all-closed', () => {
  // 托盘模式下不自动退出，由用户通过托盘菜单手动退出
})
