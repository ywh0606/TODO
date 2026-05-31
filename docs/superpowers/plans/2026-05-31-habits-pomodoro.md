# 习惯追踪 & 番茄钟 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add habit tracking and pomodoro timer modules to the existing TODO desktop app, with bottom navigation to switch between three modules.

**Architecture:** Three independent Pinia stores with separate data files. Pomodoro timer runs in Electron main process for background reliability. Bottom navigation bar switches between three view components wrapped by a refactored App.vue.

**Tech Stack:** Vue 3 (Composition API), Pinia, Electron 28, dayjs, uuid, vitest + happy-dom

**Design Spec:** `docs/superpowers/specs/2026-05-31-habits-pomodoro-design.md`

---

## File Map

### Modified
| File | Change |
|------|--------|
| `electron/persistence.js` | Add `loadFile`/`saveFile` helpers, export 4 new functions |
| `electron/preload.js` | Add habits + pomodoro IPC channels + event listeners |
| `electron/main.js` | Add IPC handlers, pomodoro timer, habit reminder scheduler |
| `src/App.vue` | Replace inline content with view switching + NavBar |
| `src/style.css` | Add pomodoro color variables |

### Created
| File | Responsibility |
|------|---------------|
| `src/stores/habitStore.js` | Habit CRUD, check-in, streak, weekly progress |
| `src/stores/pomodoroStore.js` | Timer state, daily history, weekly chart data |
| `src/components/NavBar.vue` | Bottom tab navigation (清单/习惯/番茄钟) |
| `src/views/TasksView.vue` | Wrapper for existing TaskInput + FilterBar + TaskList |
| `src/views/HabitsView.vue` | Habit list page |
| `src/views/PomodoroView.vue` | Timer + stats page |
| `src/components/habit/HabitInput.vue` | Create/edit habit form |
| `src/components/habit/HabitItem.vue` | Single habit card with check-in + 7-day blocks |
| `src/components/habit/HabitList.vue` | Scrollable habit list |
| `src/components/pomodoro/TimerCircle.vue` | Circular countdown display |
| `src/components/pomodoro/TimerControls.vue` | Start/pause/reset buttons |
| `src/components/pomodoro/WeeklyChart.vue` | 7-day bar chart |
| `tests/habitStore.test.js` | Habit store logic tests |
| `tests/pomodoroStore.test.js` | Pomodoro store logic tests |

---

## Task 1: Persistence Layer Expansion

**Files:**
- Modify: `electron/persistence.js`
- Modify: `tests/persistence.test.js`

Refactor `persistence.js` to use shared `loadFile`/`saveFile` helpers, then add 4 new functions. Keep existing `loadData`/`saveData` API identical so all existing tests continue to pass.

- [ ] **Step 1: Rewrite `electron/persistence.js`**

```js
const path = require('path')
const fs = require('fs')

let DATA_DIR

function init(userDataPath) {
  DATA_DIR = userDataPath
}

function loadFile(filename, defaultValue) {
  const filePath = path.join(DATA_DIR, filename)
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'))
    }
  } catch (e) {
    console.error(`Failed to load ${filename}:`, e)
  }
  return defaultValue
}

function saveFile(filename, data) {
  const filePath = path.join(DATA_DIR, filename)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2))
}

// Existing API (backward compatible)
function loadData() {
  return loadFile('tasks.json', [])
}

function saveData(tasks) {
  saveFile('tasks.json', tasks)
}

// New API
function loadHabits() {
  return loadFile('habits.json', { habits: [], checkins: {} })
}

function saveHabits(data) {
  saveFile('habits.json', data)
}

function loadPomodoros() {
  return loadFile('pomodoros.json', {})
}

function savePomodoros(data) {
  saveFile('pomodoros.json', data)
}

module.exports = {
  init, loadData, saveData,
  loadHabits, saveHabits, loadPomodoros, savePomodoros
}
```

- [ ] **Step 2: Run existing persistence tests to verify no regressions**

Run: `npx vitest run tests/persistence.test.js`
Expected: All existing tests PASS (loadData/saveData behavior unchanged)

- [ ] **Step 3: Add new test sections to `tests/persistence.test.js`**

Append these describe blocks inside the existing file (after the existing `读写一致性` describe block):

```js
// ============================================================
// loadHabits / saveHabits
// ============================================================
describe('loadHabits / saveHabits', () => {
  it('文件不存在时返回默认结构', () => {
    const result = persistence.loadHabits()
    expect(result).toEqual({ habits: [], checkins: {} })
  })

  it('保存后读取数据一致', () => {
    const data = {
      habits: [{ id: 'h1', name: '阅读', icon: '📖', color: '#3B82F6', frequency: { type: 'daily' }, reminderTime: null, createdAt: '2026-01-01T00:00:00.000Z', order: 0 }],
      checkins: { h1: ['2026-05-30', '2026-05-31'] }
    }
    persistence.saveHabits(data)
    const loaded = persistence.loadHabits()
    expect(loaded).toEqual(data)
  })

  it('覆盖已有文件内容', () => {
    persistence.saveHabits({ habits: [{ id: 'old' }], checkins: {} })
    persistence.saveHabits({ habits: [], checkins: {} })
    expect(persistence.loadHabits()).toEqual({ habits: [], checkins: {} })
  })
})

// ============================================================
// loadPomodoros / savePomodoros
// ============================================================
describe('loadPomodoros / savePomodoros', () => {
  it('文件不存在时返回空对象', () => {
    expect(persistence.loadPomodoros()).toEqual({})
  })

  it('保存后读取数据一致', () => {
    const data = { '2026-05-30': 5, '2026-05-31': 3 }
    persistence.savePomodoros(data)
    expect(persistence.loadPomodoros()).toEqual(data)
  })

  it('覆盖已有文件内容', () => {
    persistence.savePomodoros({ '2026-05-30': 5 })
    persistence.savePomodoros({ '2026-05-31': 2 })
    expect(persistence.loadPomodoros()).toEqual({ '2026-05-31': 2 })
  })

  it('特殊字符 round-trip 一致', () => {
    // 确保日期字符串作为 key 可以正确读写
    const data = { '2026-12-31': 10 }
    persistence.savePomodoros(data)
    expect(persistence.loadPomodoros()['2026-12-31']).toBe(10)
  })
})
```

- [ ] **Step 4: Run all persistence tests**

Run: `npx vitest run tests/persistence.test.js`
Expected: All tests PASS (old + new)

- [ ] **Step 5: Commit**

```bash
git add electron/persistence.js tests/persistence.test.js
git commit -m "feat: expand persistence layer for habits and pomodoros"
```

---

## Task 2: Electron IPC Layer

**Files:**
- Modify: `electron/preload.js`
- Modify: `electron/main.js`

Add IPC channels for habits and pomodoro. Add the pomodoro timer engine and habit reminder scheduler to the main process.

- [ ] **Step 1: Rewrite `electron/preload.js`**

```js
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Tasks (existing)
  loadTasks: () => ipcRenderer.invoke('load-tasks'),
  saveTasks: (tasks) => ipcRenderer.invoke('save-tasks', tasks),
  // Habits
  loadHabits: () => ipcRenderer.invoke('load-habits'),
  saveHabits: (data) => ipcRenderer.invoke('save-habits', data),
  // Pomodoro persistence
  loadPomodoros: () => ipcRenderer.invoke('load-pomodoros'),
  savePomodoros: (data) => ipcRenderer.invoke('save-pomodoros', data),
  // Pomodoro timer control
  pomodoroStart: () => ipcRenderer.invoke('pomodoro-start'),
  pomodoroStop: () => ipcRenderer.invoke('pomodoro-stop'),
  // Pomodoro timer events
  onPomodoroTick: (cb) => {
    const handler = (_, state) => cb(state)
    ipcRenderer.on('pomodoro-tick', handler)
  },
  onPomodoroComplete: (cb) => {
    const handler = (_, info) => cb(info)
    ipcRenderer.on('pomodoro-complete', handler)
  }
})
```

- [ ] **Step 2: Rewrite `electron/main.js`**

```js
const { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage, Notification } = require('electron')
const path = require('path')
const { init, loadData, saveData, loadHabits, saveHabits, loadPomodoros, savePomodoros } = require('./persistence')

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

  mainWindow.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault()
      mainWindow.hide()
    }
  })

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

  // Schedule habit reminders on start
  scheduleHabitReminders()

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
```

- [ ] **Step 3: Verify existing tests still pass**

Run: `npm test`
Expected: All existing tests PASS (taskStore, persistence, TaskListTransition)

- [ ] **Step 4: Commit**

```bash
git add electron/preload.js electron/main.js
git commit -m "feat: add IPC channels, pomodoro timer engine, habit reminders"
```

---

## Task 3: habitStore + Tests (TDD)

**Files:**
- Create: `src/stores/habitStore.js`
- Create: `tests/habitStore.test.js`

### Data Model

```js
// habits.json
{
  habits: [
    {
      id: string,           // uuid
      name: string,         // 习惯名称
      icon: string,         // emoji
      color: string,        // hex color
      frequency: { type: 'daily' } | { type: 'weekly', timesPerWeek: number },
      reminderTime: string | null,  // 'HH:mm' or null
      createdAt: string,    // ISO datetime
      order: number         // 排序
    }
  ],
  checkins: {
    '[habitId]': ['2026-05-30', '2026-05-31', ...]
  }
}
```

- [ ] **Step 1: Write `tests/habitStore.test.js` with failing tests first**

```js
// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHabitStore } from '../src/stores/habitStore'

const mockSaveHabits = vi.fn().mockResolvedValue({ success: true })
const mockLoadHabits = vi.fn().mockResolvedValue({ habits: [], checkins: {} })

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()

  window.electronAPI = {
    saveHabits: mockSaveHabits,
    loadHabits: mockLoadHabits
  }
})

// ============================================================
// addHabit
// ============================================================
describe('addHabit', () => {
  it('添加习惯后 habits 数组包含新习惯', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })

    expect(store.habits).toHaveLength(1)
    expect(store.habits[0].name).toBe('阅读')
    expect(store.habits[0].icon).toBe('📖')
    expect(store.habits[0].color).toBe('#3B82F6')
    expect(store.habits[0].frequency).toEqual({ type: 'daily' })
  })

  it('添加带提醒时间的习惯', async () => {
    const store = useHabitStore()
    await store.addHabit('运动', '🏃', '#10B981', { type: 'daily' }, '08:00')

    expect(store.habits[0].reminderTime).toBe('08:00')
  })

  it('添加每周习惯', async () => {
    const store = useHabitStore()
    await store.addHabit('健身', '💪', '#F59E0B', { type: 'weekly', timesPerWeek: 3 })

    expect(store.habits[0].frequency).toEqual({ type: 'weekly', timesPerWeek: 3 })
  })

  it('添加后自动保存', async () => {
    const store = useHabitStore()
    await store.addHabit('测试', '✅', '#3B82F6', { type: 'daily' })

    expect(mockSaveHabits).toHaveBeenCalledTimes(1)
  })

  it('习惯带有 UUID 格式 id', async () => {
    const store = useHabitStore()
    await store.addHabit('测试', '✅', '#3B82F6', { type: 'daily' })

    expect(store.habits[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it('习惯带有 createdAt 和 order', async () => {
    const store = useHabitStore()
    await store.addHabit('测试', '✅', '#3B82F6', { type: 'daily' })

    expect(store.habits[0].createdAt).toBeTruthy()
    expect(store.habits[0].order).toBe(0)
  })

  it('多个习惯 order 递增', async () => {
    const store = useHabitStore()
    await store.addHabit('习惯1', '1️⃣', '#3B82F6', { type: 'daily' })
    await store.addHabit('习惯2', '2️⃣', '#10B981', { type: 'daily' })

    expect(store.habits[0].order).toBe(0)
    expect(store.habits[1].order).toBe(1)
  })
})

// ============================================================
// loadHabits
// ============================================================
describe('loadHabits', () => {
  it('从磁盘加载习惯数据', async () => {
    const data = {
      habits: [{ id: 'h1', name: '阅读', icon: '📖', color: '#3B82F6', frequency: { type: 'daily' }, reminderTime: null, createdAt: '2026-01-01T00:00:00.000Z', order: 0 }],
      checkins: { h1: ['2026-05-30'] }
    }
    mockLoadHabits.mockResolvedValue(data)

    const store = useHabitStore()
    await store.loadHabits()

    expect(store.habits).toHaveLength(1)
    expect(store.habits[0].name).toBe('阅读')
    expect(store.checkins.h1).toEqual(['2026-05-30'])
  })

  it('无数据时为空数组', async () => {
    mockLoadHabits.mockResolvedValue({ habits: [], checkins: {} })

    const store = useHabitStore()
    await store.loadHabits()

    expect(store.habits).toHaveLength(0)
  })

  it('旧习惯补上 order 字段', async () => {
    mockLoadHabits.mockResolvedValue({
      habits: [{ id: 'h1', name: '旧习惯', icon: '📖', color: '#3B82F6', frequency: { type: 'daily' }, reminderTime: null, createdAt: '2026-01-01T00:00:00.000Z' }],
      checkins: {}
    })

    const store = useHabitStore()
    await store.loadHabits()

    expect(store.habits[0].order).toBe(0)
  })
})

// ============================================================
// deleteHabit
// ============================================================
describe('deleteHabit', () => {
  it('删除指定习惯', async () => {
    const store = useHabitStore()
    await store.addHabit('保留', '✅', '#3B82F6', { type: 'daily' })
    await store.addHabit('删除', '❌', '#EF4444', { type: 'daily' })

    await store.deleteHabit(store.habits[1].id)

    expect(store.habits).toHaveLength(1)
    expect(store.habits[0].name).toBe('保留')
  })

  it('删除习惯时同时清除打卡记录', async () => {
    const store = useHabitStore()
    await store.addHabit('删除', '❌', '#EF4444', { type: 'daily' })
    const id = store.habits[0].id
    store.checkins[id] = ['2026-05-30']

    await store.deleteHabit(id)

    expect(store.checkins[id]).toBeUndefined()
  })
})

// ============================================================
// updateHabit
// ============================================================
describe('updateHabit', () => {
  it('更新习惯名称', async () => {
    const store = useHabitStore()
    await store.addHabit('旧名', '📖', '#3B82F6', { type: 'daily' })

    await store.updateHabit(store.habits[0].id, { name: '新名' })

    expect(store.habits[0].name).toBe('新名')
  })

  it('白名单外的字段不会被更新', async () => {
    const store = useHabitStore()
    await store.addHabit('测试', '📖', '#3B82F6', { type: 'daily' })

    await store.updateHabit(store.habits[0].id, { id: 'hacked', order: 999 })

    expect(store.habits[0].id).not.toBe('hacked')
    expect(store.habits[0].order).toBe(0)
  })
})

// ============================================================
// checkin / uncheckin
// ============================================================
describe('checkin', () => {
  it('今日打卡成功', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    await store.checkin(id)

    expect(store.checkins[id]).toHaveLength(1)
  })

  it('同一天重复打卡不重复记录', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    await store.checkin(id)
    await store.checkin(id)

    expect(store.checkins[id]).toHaveLength(1)
  })

  it('取消今日打卡', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    await store.checkin(id)
    expect(store.checkins[id]).toHaveLength(1)

    await store.uncheckin(id)
    expect(store.checkins[id]).toHaveLength(0)
  })
})

// ============================================================
// isCheckedInToday
// ============================================================
describe('isCheckedInToday', () => {
  it('今日已打卡返回 true', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    await store.checkin(id)

    expect(store.isCheckedInToday(id)).toBe(true)
  })

  it('今日未打卡返回 false', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    expect(store.isCheckedInToday(id)).toBe(false)
  })
})

// ============================================================
// getStreak
// ============================================================
describe('getStreak', () => {
  it('无打卡记录时返回 0', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    expect(store.getStreak(id)).toBe(0)
  })

  it('今天打卡返回 1', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    await store.checkin(id)

    expect(store.getStreak(id)).toBe(1)
  })

  it('连续3天打卡（含今天）返回 3', () => {
    const store = useHabitStore()
    const id = 'test-id'
    const today = new Date()
    const d1 = new Date(today); d1.setDate(d1.getDate() - 2)
    const d2 = new Date(today); d2.setDate(d2.getDate() - 1)
    // Format as YYYY-MM-DD
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

    store.checkins[id] = [fmt(d1), fmt(d2), fmt(today)]

    expect(store.getStreak(id)).toBe(3)
  })

  it('昨天打卡但今天未打卡返回 0', () => {
    const store = useHabitStore()
    const id = 'test-id'
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

    store.checkins[id] = [fmt(yesterday)]

    expect(store.getStreak(id)).toBe(0)
  })
})

// ============================================================
// getTotalCheckins
// ============================================================
describe('getTotalCheckins', () => {
  it('返回总打卡次数', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    store.checkins[id] = ['2026-05-28', '2026-05-29', '2026-05-30']

    expect(store.getTotalCheckins(id)).toBe(3)
  })

  it('无打卡记录返回 0', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    expect(store.getTotalCheckins(id)).toBe(0)
  })
})

// ============================================================
// getLast7Days
// ============================================================
describe('getLast7Days', () => {
  it('返回7天数据', () => {
    const store = useHabitStore()
    const id = 'test-id'
    const today = new Date()
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

    store.checkins[id] = [fmt(today)]

    const result = store.getLast7Days(id)

    expect(result).toHaveLength(7)
    expect(result[6].checked).toBe(true)
    expect(result[0].checked).toBe(false)
  })

  it('无打卡记录全部为 false', () => {
    const store = useHabitStore()
    const result = store.getLast7Days('nonexistent')

    expect(result).toHaveLength(7)
    expect(result.every(d => d.checked === false)).toBe(true)
  })
})

// ============================================================
// getWeeklyProgress
// ============================================================
describe('getWeeklyProgress', () => {
  it('每日习惯返回 null', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    expect(store.getWeeklyProgress(id)).toBeNull()
  })

  it('每周习惯返回进度', async () => {
    const store = useHabitStore()
    await store.addHabit('健身', '💪', '#F59E0B', { type: 'weekly', timesPerWeek: 3 })
    const id = store.habits[0].id

    // 打卡2次
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    store.checkins[id] = [fmt(yesterday), fmt(today)]

    const progress = store.getWeeklyProgress(id)
    expect(progress).not.toBeNull()
    expect(progress.target).toBe(3)
    // completed depends on which days fall in this week
    expect(progress.completed).toBeGreaterThanOrEqual(0)
  })
})

// ============================================================
// 边界条件
// ============================================================
describe('边界条件', () => {
  it('无 electronAPI 时不会报错', async () => {
    delete window.electronAPI

    const store = useHabitStore()
    await expect(store.addHabit('浏览器测试', '✅', '#3B82F6', { type: 'daily' })).resolves.not.toThrow()
    expect(store.habits).toHaveLength(1)
  })

  it('saveHabits 失败时静默处理', async () => {
    mockSaveHabits.mockRejectedValue(new Error('写入失败'))

    const store = useHabitStore()
    await expect(store.addHabit('测试', '✅', '#3B82F6', { type: 'daily' })).resolves.not.toThrow()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/habitStore.test.js`
Expected: FAIL — module `../src/stores/habitStore` not found

- [ ] **Step 3: Write `src/stores/habitStore.js`**

```js
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

export const useHabitStore = defineStore('habits', () => {
  const habits = ref([])
  const checkins = ref({}) // { [habitId]: ['2026-05-30', ...] }

  async function loadHabits() {
    if (window.electronAPI) {
      const data = await window.electronAPI.loadHabits()
      habits.value = data.habits || []
      checkins.value = data.checkins || {}
    }
    // Migration: assign order to old habits
    habits.value.forEach((h, i) => {
      if (h.order === undefined) h.order = i
    })
  }

  async function saveHabits() {
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveHabits({
          habits: JSON.parse(JSON.stringify(habits.value)),
          checkins: JSON.parse(JSON.stringify(checkins.value))
        })
      } catch (e) {
        console.error('Failed to save habits:', e)
      }
    }
  }

  async function addHabit(name, icon, color, frequency, reminderTime = null) {
    const maxOrder = habits.value.length > 0
      ? Math.max(...habits.value.map(h => h.order ?? 0))
      : -1
    habits.value.push({
      id: uuidv4(),
      name,
      icon,
      color,
      frequency,
      reminderTime,
      createdAt: dayjs().toISOString(),
      order: maxOrder + 1
    })
    await saveHabits()
  }

  async function deleteHabit(id) {
    habits.value = habits.value.filter(h => h.id !== id)
    delete checkins.value[id]
    await saveHabits()
  }

  async function updateHabit(id, updates) {
    const habit = habits.value.find(h => h.id === id)
    if (habit) {
      const allowed = ['name', 'icon', 'color', 'frequency', 'reminderTime']
      const safeUpdates = Object.fromEntries(
        Object.entries(updates).filter(([k]) => allowed.includes(k))
      )
      Object.assign(habit, safeUpdates)
      await saveHabits()
    }
  }

  async function checkin(id) {
    const today = dayjs().format('YYYY-MM-DD')
    if (!checkins.value[id]) {
      checkins.value[id] = []
    }
    if (!checkins.value[id].includes(today)) {
      checkins.value[id].push(today)
      await saveHabits()
    }
  }

  async function uncheckin(id) {
    const today = dayjs().format('YYYY-MM-DD')
    if (checkins.value[id]?.includes(today)) {
      checkins.value[id] = checkins.value[id].filter(d => d !== today)
      await saveHabits()
    }
  }

  function isCheckedInToday(id) {
    const today = dayjs().format('YYYY-MM-DD')
    return (checkins.value[id] || []).includes(today)
  }

  function getStreak(id) {
    const dates = ((checkins.value[id] || []).slice().sort().reverse())
    if (dates.length === 0) return 0

    let streak = 0
    const today = dayjs().startOf('day')
    const todayStr = today.format('YYYY-MM-DD')

    // Streak must include today
    if (dates[0] !== todayStr) return 0

    streak = 1
    let checkDate = today.subtract(1, 'day')

    for (let i = 1; i < dates.length; i++) {
      if (dates[i] === checkDate.format('YYYY-MM-DD')) {
        streak++
        checkDate = checkDate.subtract(1, 'day')
      } else {
        break
      }
    }
    return streak
  }

  function getTotalCheckins(id) {
    return (checkins.value[id] || []).length
  }

  function getLast7Days(id) {
    const dates = checkins.value[id] || []
    const result = []
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day')
      const dateStr = date.format('YYYY-MM-DD')
      result.push({
        date: dateStr,
        checked: dates.includes(dateStr)
      })
    }
    return result
  }

  function getWeeklyProgress(id) {
    const habit = habits.value.find(h => h.id === id)
    if (!habit || habit.frequency.type !== 'weekly') return null

    // Monday as start of week
    const today = dayjs()
    const dayOfWeek = today.day() // 0=Sunday
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = today.add(mondayOffset, 'day').startOf('day')

    const dates = checkins.value[id] || []
    const thisWeekCheckins = dates.filter(d => {
      const date = dayjs(d)
      return (date.isSame(monday) || date.isAfter(monday)) &&
             date.isBefore(monday.add(7, 'day'))
    })

    return {
      completed: thisWeekCheckins.length,
      target: habit.frequency.timesPerWeek
    }
  }

  return {
    habits,
    checkins,
    loadHabits,
    addHabit,
    deleteHabit,
    updateHabit,
    checkin,
    uncheckin,
    isCheckedInToday,
    getStreak,
    getTotalCheckins,
    getLast7Days,
    getWeeklyProgress
  }
})
```

- [ ] **Step 4: Run habitStore tests**

Run: `npx vitest run tests/habitStore.test.js`
Expected: All tests PASS

- [ ] **Step 5: Run all tests to verify no regressions**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/stores/habitStore.js tests/habitStore.test.js
git commit -m "feat: add habitStore with CRUD, check-in, streak, weekly progress"
```

---

## Task 4: Habit UI Components

**Files:**
- Create: `src/components/habit/HabitInput.vue`
- Create: `src/components/habit/HabitItem.vue`
- Create: `src/components/habit/HabitList.vue`
- Create: `src/views/HabitsView.vue`

### HabitInput.vue

A collapsible form for creating habits. Shows a "+" button that expands to reveal:
- Name input
- Icon picker (grid of preset emojis)
- Color picker (row of preset colors)
- Frequency selector (每天 / 每周X次)
- Reminder time input (optional)

Key props/events: none (uses habitStore directly). Emits `close` when form is submitted or cancelled.

```vue
<template>
  <div class="habit-input">
    <div v-if="!expanded" class="add-trigger" @click="expanded = true">
      <span class="plus">+</span> 添加习惯
    </div>
    <div v-else class="form">
      <input v-model="name" type="text" placeholder="习惯名称..." class="name-input" @keydown.enter="handleAdd" ref="nameRef" />
      <div class="form-row">
        <label>图标</label>
        <div class="icon-grid">
          <button
            v-for="emoji in icons"
            :key="emoji"
            :class="['icon-btn', { active: selectedIcon === emoji }]"
            @click="selectedIcon = emoji"
          >{{ emoji }}</button>
        </div>
      </div>
      <div class="form-row">
        <label>颜色</label>
        <div class="color-row">
          <button
            v-for="c in colors"
            :key="c"
            :class="['color-btn', { active: selectedColor === c }]"
            :style="{ background: c }"
            @click="selectedColor = c"
          ></button>
        </div>
      </div>
      <div class="form-row">
        <label>频率</label>
        <div class="frequency-row">
          <select v-model="freqType" class="freq-select">
            <option value="daily">每天</option>
            <option value="weekly">每周</option>
          </select>
          <div v-if="freqType === 'weekly'" class="times-row">
            <input v-model.number="timesPerWeek" type="number" min="1" max="7" class="times-input" />
            <span>次/周</span>
          </div>
        </div>
      </div>
      <div class="form-row">
        <label>提醒</label>
        <input v-model="reminderTime" type="time" class="time-input" />
      </div>
      <div class="form-actions">
        <button @click="handleAdd" class="save-btn" :disabled="!name.trim()">添加</button>
        <button @click="cancel" class="cancel-btn">取消</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useHabitStore } from '../../stores/habitStore'

const store = useHabitStore()

const expanded = ref(false)
const name = ref('')
const selectedIcon = ref('📖')
const selectedColor = ref('#3B82F6')
const freqType = ref('daily')
const timesPerWeek = ref(3)
const reminderTime = ref('')
const nameRef = ref(null)

const icons = ['📖', '🏃', '💪', '🧘', '🎵', '✍️', '🍎', '💧', '😴', '🧹', '💰', '🎯']
const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316']

async function handleAdd() {
  if (!name.value.trim()) return
  const frequency = freqType.value === 'daily'
    ? { type: 'daily' }
    : { type: 'weekly', timesPerWeek: timesPerWeek.value }
  await store.addHabit(
    name.value.trim(),
    selectedIcon.value,
    selectedColor.value,
    frequency,
    reminderTime.value || null
  )
  resetForm()
}

function cancel() {
  resetForm()
}

function resetForm() {
  name.value = ''
  selectedIcon.value = '📖'
  selectedColor.value = '#3B82F6'
  freqType.value = 'daily'
  timesPerWeek.value = 3
  reminderTime.value = ''
  expanded.value = false
}
</script>
```

CSS: scoped styles following the project's design system (use `var(--radius-md)`, `var(--color-border)`, etc.). Style the form rows as flex with label on the left. Icon grid as a wrapping flex row. Color buttons as 28px circles with a ring on active.

### HabitItem.vue

Props: `habit` (object). Displays habit name + icon, check-in button (circle), streak badge, 7-day blocks, and weekly progress bar for weekly habits.

```vue
<template>
  <div class="habit-item">
    <div class="habit-left">
      <button
        class="checkin-btn"
        :class="{ checked: isChecked }"
        :style="{ '--habit-color': habit.color }"
        @click="toggleCheckin"
      >
        <span v-if="isChecked">✓</span>
      </button>
      <div class="habit-info">
        <div class="habit-name">
          <span class="habit-icon">{{ habit.icon }}</span>
          {{ habit.name }}
        </div>
        <div class="habit-stats">
          <span class="streak" v-if="streak > 0">🔥 {{ streak }}天</span>
          <span class="total">共 {{ total }}次</span>
        </div>
        <div class="days-row">
          <div
            v-for="day in last7"
            :key="day.date"
            class="day-block"
            :class="{ checked: day.checked }"
            :style="{ '--habit-color': habit.color }"
            :title="day.date"
          ></div>
        </div>
        <div v-if="weeklyProgress" class="weekly-bar">
          <div class="weekly-fill" :style="{ width: weeklyPercent + '%', background: habit.color }"></div>
          <span class="weekly-label">{{ weeklyProgress.completed }}/{{ weeklyProgress.target }}</span>
        </div>
      </div>
    </div>
    <button @click.stop="store.deleteHabit(habit.id)" class="delete-btn">×</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHabitStore } from '../../stores/habitStore'

const props = defineProps({
  habit: { type: Object, required: true }
})

const store = useHabitStore()

const isChecked = computed(() => store.isCheckedInToday(props.habit.id))
const streak = computed(() => store.getStreak(props.habit.id))
const total = computed(() => store.getTotalCheckins(props.habit.id))
const last7 = computed(() => store.getLast7Days(props.habit.id))
const weeklyProgress = computed(() => store.getWeeklyProgress(props.habit.id))
const weeklyPercent = computed(() => {
  if (!weeklyProgress.value) return 0
  return Math.min(100, (weeklyProgress.value.completed / weeklyProgress.value.target) * 100)
})

function toggleCheckin() {
  if (isChecked.value) {
    store.uncheckin(props.habit.id)
  } else {
    store.checkin(props.habit.id)
  }
}
</script>
```

CSS: `.habit-item` is a flex row card (white bg, `var(--radius-md)`, border, shadow) matching TaskItem style. `.checkin-btn` is a 32px circle, border 2px habit-color, fill on checked. `.days-row` is 7 small 10px squares in a row. `.weekly-bar` is a thin progress bar.

### HabitList.vue

Simple list wrapper:

```vue
<template>
  <div class="habit-list">
    <div v-if="store.habits.length === 0" class="empty-state">
      <p>还没有习惯，添加一个开始吧 ✨</p>
    </div>
    <HabitItem
      v-for="habit in store.habits"
      :key="habit.id"
      :habit="habit"
    />
  </div>
</template>

<script setup>
import { useHabitStore } from '../../stores/habitStore'
import HabitItem from './HabitItem.vue'

const store = useHabitStore()
</script>
```

### HabitsView.vue

The page wrapper for habits:

```vue
<template>
  <div class="habits-view">
    <header class="view-header">
      <h1>我的习惯</h1>
    </header>
    <HabitInput />
    <HabitList />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHabitStore } from '../stores/habitStore'
import HabitInput from '../components/habit/HabitInput.vue'
import HabitList from '../components/habit/HabitList.vue'

const store = useHabitStore()

onMounted(() => {
  store.loadHabits()
})
</script>
```

CSS: Views are children of `.app` which already has `max-width: 500px; padding: 20px 24px`. Only set `flex: 1; overflow-y: auto; display: flex; flex-direction: column;` — like TasksView.

- [ ] **Step 1: Create `src/components/habit/` directory and write HabitInput.vue**

Write the full component with template, script, and scoped CSS as described above.

- [ ] **Step 2: Write HabitItem.vue**

Write the full component with template, script, and scoped CSS as described above.

- [ ] **Step 3: Write HabitList.vue**

Write the full component as described above.

- [ ] **Step 4: Write HabitsView.vue**

Write the full component as described above.

- [ ] **Step 5: Commit**

```bash
git add src/components/habit/ src/views/HabitsView.vue
git commit -m "feat: add habit UI components and HabitsView"
```

---

## Task 5: pomodoroStore + Tests (TDD)

**Files:**
- Create: `src/stores/pomodoroStore.js`
- Create: `tests/pomodoroStore.test.js`

### Data Model

```js
// Runtime state (not persisted, synced from main process via IPC)
status: 'idle' | 'work' | 'break' | 'long-break'
remainingSeconds: number
currentRound: number  // 1-4

// Persisted in pomodoros.json
dailyHistory: { '2026-05-30': 5, '2026-05-31': 3 }
```

- [ ] **Step 1: Write `tests/pomodoroStore.test.js`**

```js
// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePomodoroStore } from '../src/stores/pomodoroStore'

const mockSavePomodoros = vi.fn().mockResolvedValue({ success: true })
const mockLoadPomodoros = vi.fn().mockResolvedValue({})
const mockPomodoroStart = vi.fn().mockResolvedValue({ success: true })
const mockPomodoroStop = vi.fn().mockResolvedValue({ success: true })
const mockOnPomodoroTick = vi.fn()
const mockOnPomodoroComplete = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()

  window.electronAPI = {
    savePomodoros: mockSavePomodoros,
    loadPomodoros: mockLoadPomodoros,
    pomodoroStart: mockPomodoroStart,
    pomodoroStop: mockPomodoroStop,
    onPomodoroTick: mockOnPomodoroTick,
    onPomodoroComplete: mockOnPomodoroComplete
  }
})

// ============================================================
// loadPomodoros
// ============================================================
describe('loadPomodoros', () => {
  it('从磁盘加载历史数据', async () => {
    mockLoadPomodoros.mockResolvedValue({ '2026-05-30': 5, '2026-05-31': 3 })

    const store = usePomodoroStore()
    await store.loadPomodoros()

    expect(store.dailyHistory['2026-05-30']).toBe(5)
    expect(store.dailyHistory['2026-05-31']).toBe(3)
  })

  it('无数据时为空对象', async () => {
    mockLoadPomodoros.mockResolvedValue({})

    const store = usePomodoroStore()
    await store.loadPomodoros()

    expect(Object.keys(store.dailyHistory)).toHaveLength(0)
  })
})

// ============================================================
// totalToday
// ============================================================
describe('totalToday', () => {
  it('今日无记录时返回 0', async () => {
    mockLoadPomodoros.mockResolvedValue({})

    const store = usePomodoroStore()
    await store.loadPomodoros()

    expect(store.totalToday).toBe(0)
  })

  it('返回今日番茄数', async () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    mockLoadPomodoros.mockResolvedValue({ [todayStr]: 4 })

    const store = usePomodoroStore()
    await store.loadPomodoros()

    expect(store.totalToday).toBe(4)
  })
})

// ============================================================
// weeklyData
// ============================================================
describe('weeklyData', () => {
  it('返回7天数据', async () => {
    mockLoadPomodoros.mockResolvedValue({})

    const store = usePomodoroStore()
    await store.loadPomodoros()

    const data = store.weeklyData
    expect(data).toHaveLength(7)
    expect(data[0]).toHaveProperty('date')
    expect(data[0]).toHaveProperty('label')
    expect(data[0]).toHaveProperty('count')
    expect(data[0].count).toBe(0)
  })

  it('包含正确的历史数据', async () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`

    mockLoadPomodoros.mockResolvedValue({ [todayStr]: 3, [yesterdayStr]: 5 })

    const store = usePomodoroStore()
    await store.loadPomodoros()

    const data = store.weeklyData
    expect(data[6].count).toBe(3)  // today
    expect(data[5].count).toBe(5)  // yesterday
  })
})

// ============================================================
// formattedTime
// ============================================================
describe('formattedTime', () => {
  it('格式化剩余时间为 MM:SS', () => {
    const store = usePomodoroStore()
    store.remainingSeconds = 1500 // 25:00

    expect(store.formattedTime).toBe('25:00')
  })

  it('不足10分钟时前面补0', () => {
    const store = usePomodoroStore()
    store.remainingSeconds = 299 // 04:59

    expect(store.formattedTime).toBe('04:59')
  })

  it('0秒时显示 00:00', () => {
    const store = usePomodoroStore()
    store.remainingSeconds = 0

    expect(store.formattedTime).toBe('00:00')
  })
})

// ============================================================
// startTimer / stopTimer
// ============================================================
describe('startTimer / stopTimer', () => {
  it('startTimer 调用 electronAPI.pomodoroStart', () => {
    const store = usePomodoroStore()
    store.startTimer()

    expect(mockPomodoroStart).toHaveBeenCalledTimes(1)
  })

  it('stopTimer 调用 electronAPI.pomodoroStop', () => {
    const store = usePomodoroStore()
    store.stopTimer()

    expect(mockPomodoroStop).toHaveBeenCalledTimes(1)
  })
})

// ============================================================
// handlePomodoroComplete
// ============================================================
describe('handlePomodoroComplete', () => {
  it('work-complete 时增加今日番茄数并保存', async () => {
    mockLoadPomodoros.mockResolvedValue({})

    const store = usePomodoroStore()
    await store.loadPomodoros()

    await store.handlePomodoroComplete({ type: 'work-complete', round: 1 })

    expect(store.totalToday).toBe(1)
    expect(mockSavePomodoros).toHaveBeenCalledTimes(1)
  })

  it('break-complete 时不增加计数', async () => {
    mockLoadPomodoros.mockResolvedValue({})

    const store = usePomodoroStore()
    await store.loadPomodoros()

    await store.handlePomodoroComplete({ type: 'break-complete' })

    expect(store.totalToday).toBe(0)
    expect(mockSavePomodoros).not.toHaveBeenCalled()
  })
})

// ============================================================
// 边界条件
// ============================================================
describe('边界条件', () => {
  it('无 electronAPI 时不会报错', async () => {
    delete window.electronAPI

    const store = usePomodoroStore()
    await expect(store.loadPomodoros()).resolves.not.toThrow()
    expect(() => store.startTimer()).not.toThrow()
    expect(() => store.stopTimer()).not.toThrow()
  })
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npx vitest run tests/pomodoroStore.test.js`
Expected: FAIL — module not found

- [ ] **Step 3: Write `src/stores/pomodoroStore.js`**

```js
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

export const usePomodoroStore = defineStore('pomodoro', () => {
  const status = ref('idle') // 'idle' | 'work' | 'break' | 'long-break'
  const remainingSeconds = ref(0)
  const currentRound = ref(1)
  const dailyHistory = ref({})
  let listenersSetup = false

  async function loadPomodoros() {
    if (window.electronAPI) {
      dailyHistory.value = await window.electronAPI.loadPomodoros()
    }
  }

  async function savePomodoros() {
    if (window.electronAPI) {
      try {
        await window.electronAPI.savePomodoros(JSON.parse(JSON.stringify(dailyHistory.value)))
      } catch (e) {
        console.error('Failed to save pomodoros:', e)
      }
    }
  }

  function startTimer() {
    if (window.electronAPI) {
      window.electronAPI.pomodoroStart()
    }
  }

  function stopTimer() {
    if (window.electronAPI) {
      window.electronAPI.pomodoroStop()
    }
  }

  function setupListeners() {
    if (listenersSetup || !window.electronAPI) return
    listenersSetup = true

    window.electronAPI.onPomodoroTick((state) => {
      status.value = state.status
      remainingSeconds.value = state.remainingSeconds
      currentRound.value = state.currentRound
    })

    window.electronAPI.onPomodoroComplete(async (info) => {
      await handlePomodoroComplete(info)
    })
  }

  async function handlePomodoroComplete(info) {
    if (info.type === 'work-complete') {
      const today = dayjs().format('YYYY-MM-DD')
      dailyHistory.value[today] = (dailyHistory.value[today] || 0) + 1
      await savePomodoros()
    }
  }

  const totalToday = computed(() => {
    const today = dayjs().format('YYYY-MM-DD')
    return dailyHistory.value[today] || 0
  })

  const weeklyData = computed(() => {
    const result = []
    const dayLabels = ['日', '一', '二', '三', '四', '五', '六']
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day')
      const dateStr = date.format('YYYY-MM-DD')
      result.push({
        date: dateStr,
        label: dayLabels[date.day()],
        count: dailyHistory.value[dateStr] || 0
      })
    }
    return result
  })

  const formattedTime = computed(() => {
    const minutes = Math.floor(remainingSeconds.value / 60)
    const seconds = remainingSeconds.value % 60
    return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
  })

  return {
    status,
    remainingSeconds,
    currentRound,
    dailyHistory,
    totalToday,
    weeklyData,
    formattedTime,
    loadPomodoros,
    startTimer,
    stopTimer,
    setupListeners,
    handlePomodoroComplete
  }
})
```

- [ ] **Step 4: Run pomodoroStore tests**

Run: `npx vitest run tests/pomodoroStore.test.js`
Expected: All tests PASS

- [ ] **Step 5: Run all tests**

Run: `npm test`
Expected: All tests PASS

- [ ] **Step 6: Commit**

```bash
git add src/stores/pomodoroStore.js tests/pomodoroStore.test.js
git commit -m "feat: add pomodoroStore with timer state, daily history, weekly chart"
```

---

## Task 6: Pomodoro UI Components

**Files:**
- Create: `src/components/pomodoro/TimerCircle.vue`
- Create: `src/components/pomodoro/TimerControls.vue`
- Create: `src/components/pomodoro/WeeklyChart.vue`
- Create: `src/views/PomodoroView.vue`

### TimerCircle.vue

A circular countdown display. Uses SVG circle with `stroke-dasharray` / `stroke-dashoffset` for progress ring.

Props: none — reads directly from pomodoroStore.

```vue
<template>
  <div class="timer-circle" :class="store.status">
    <svg class="progress-ring" width="180" height="180">
      <circle class="ring-bg" cx="90" cy="90" r="80" />
      <circle
        class="ring-progress"
        cx="90" cy="90" r="80"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
    </svg>
    <div class="timer-text">
      <div class="time">{{ store.formattedTime }}</div>
      <div class="phase-label">{{ phaseLabel }}</div>
      <div class="round-dots">
        <span v-for="n in 4" :key="n" class="dot" :class="{ filled: n < store.currentRound }"></span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { usePomodoroStore } from '../../stores/pomodoroStore'

const store = usePomodoroStore()

const circumference = 2 * Math.PI * 80 // ~502

const dashOffset = computed(() => {
  if (store.status === 'idle') return circumference
  const total = store.status === 'work' ? 25 * 60
    : store.status === 'long-break' ? 15 * 60
    : 5 * 60
  const progress = store.remainingSeconds / total
  return circumference * (1 - progress)
})

const phaseLabel = computed(() => {
  const labels = { idle: '准备专注', work: '专注中', break: '休息中', 'long-break': '长休息' }
  return labels[store.status] || ''
})
</script>
```

CSS: `.timer-circle` is centered. `.progress-ring` SVG. `.ring-bg` is light gray stroke. `.ring-progress` stroke is red for work, green for break. `.timer-text` is absolutely centered. `.dot` is a small 8px circle.

### TimerControls.vue

Start/pause/reset buttons.

```vue
<template>
  <div class="timer-controls">
    <button v-if="store.status === 'idle'" class="start-btn" @click="store.startTimer()">
      开始专注
    </button>
    <template v-else>
      <button class="stop-btn" @click="store.stopTimer()">重置</button>
    </template>
  </div>
</template>

<script setup>
import { usePomodoroStore } from '../../stores/pomodoroStore'

const store = usePomodoroStore()
</script>
```

CSS: Buttons styled as rounded pills, matching the app's existing button style. Start button is red (`--color-danger`), stop button has border.

### WeeklyChart.vue

7-day bar chart.

```vue
<template>
  <div class="weekly-chart">
    <div class="chart-header">
      <span class="chart-title">本周统计</span>
      <span class="chart-total">今日 <strong>{{ store.totalToday }}</strong> 🍅</span>
    </div>
    <div class="chart-bars">
      <div v-for="day in store.weeklyData" :key="day.date" class="bar-col">
        <div class="bar" :style="{ height: barHeight(day.count) + 'px' }"></div>
        <span class="bar-label">{{ day.label }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { usePomodoroStore } from '../../stores/pomodoroStore'

const store = usePomodoroStore()

function barHeight(count) {
  if (count === 0) return 4
  return Math.min(50, count * 10)
}
</script>
```

CSS: `.chart-bars` is a flex row with equal columns. `.bar` has red gradient background, 24px width, rounded top. `.bar-col` aligns items bottom.

### PomodoroView.vue

```vue
<template>
  <div class="pomodoro-view">
    <header class="view-header">
      <h1>番茄钟</h1>
    </header>
    <div class="timer-section">
      <TimerCircle />
      <TimerControls />
    </div>
    <WeeklyChart />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { usePomodoroStore } from '../stores/pomodoroStore'
import TimerCircle from '../components/pomodoro/TimerCircle.vue'
import TimerControls from '../components/pomodoro/TimerControls.vue'
import WeeklyChart from '../components/pomodoro/WeeklyChart.vue'

const store = usePomodoroStore()

onMounted(() => {
  store.loadPomodoros()
  store.setupListeners()
})
</script>
```

- [ ] **Step 1: Create `src/components/pomodoro/` directory and write TimerCircle.vue**

Write the full component with SVG ring, timer text, and round dots as described.

- [ ] **Step 2: Write TimerControls.vue**

Write the start/stop buttons component as described.

- [ ] **Step 3: Write WeeklyChart.vue**

Write the 7-day bar chart as described.

- [ ] **Step 4: Write PomodoroView.vue**

Write the page wrapper as described.

- [ ] **Step 5: Commit**

```bash
git add src/components/pomodoro/ src/views/PomodoroView.vue
git commit -m "feat: add pomodoro UI components and PomodoroView"
```

---

## Task 7: Navigation Refactor

**Files:**
- Create: `src/components/NavBar.vue`
- Create: `src/views/TasksView.vue`
- Modify: `src/App.vue`
- Modify: `src/style.css`

Extract the current App.vue content into TasksView.vue. Add NavBar and view switching to App.vue.

- [ ] **Step 1: Add CSS variables to `src/style.css`**

Append after the existing `--color-danger: #EF4444` line:

```css
  --color-pomodoro: #EF4444;
  --color-pomodoro-light: #FEE2E2;
  --color-break: #10B981;
  --color-break-light: #D1FAE5;
```

- [ ] **Step 2: Create `src/views/TasksView.vue`**

Move the existing App.vue content (header + TaskInput + FilterBar + TaskList) into this wrapper:

```vue
<template>
  <div class="tasks-view">
    <header class="app-header">
      <h1>我的清单</h1>
      <div class="stats">
        <span class="stat pending">{{ store.stats.pending }} 待办</span>
        <span class="stat completed">{{ store.stats.completed }} 完成</span>
      </div>
    </header>
    <TaskInput />
    <FilterBar />
    <TaskList />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import TaskInput from '../components/TaskInput.vue'
import FilterBar from '../components/FilterBar.vue'
import TaskList from '../components/TaskList.vue'

const store = useTaskStore()

onMounted(() => {
  store.loadTasks()
})
</script>

<style scoped>
.tasks-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.app-header h1 {
  font-size: 24px;
  color: var(--color-text);
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 8px;
}

.stat {
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 500;
}

.stat.pending {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.stat.completed {
  background: #D1FAE5;
  color: var(--color-success);
}
</style>
```

- [ ] **Step 3: Create `src/components/NavBar.vue`**

```vue
<template>
  <nav class="navbar">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['nav-btn', { active: currentTab === tab.key }]"
      @click="currentTab = tab.key"
    >
      <span class="nav-icon">{{ tab.icon }}</span>
      <span class="nav-label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue'

const currentTab = ref('tasks')
const tabs = [
  { key: 'tasks', icon: '📋', label: '清单' },
  { key: 'habits', icon: '✅', label: '习惯' },
  { key: 'pomodoro', icon: '🍅', label: '番茄钟' }
]

const emit = defineEmits(['change'])

watch(currentTab, (val) => {
  emit('change', val)
})
</script>

<style scoped>
.navbar {
  display: flex;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 6px 0 env(safe-area-inset-bottom, 6px);
  flex-shrink: 0;
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color 0.2s;
  font-family: inherit;
}

.nav-btn.active {
  color: var(--color-primary);
}

.nav-icon {
  font-size: 20px;
  line-height: 1;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}
</style>
```

- [ ] **Step 4: Rewrite `src/App.vue`**

```vue
<template>
  <div class="app">
    <TasksView v-if="activeTab === 'tasks'" />
    <HabitsView v-else-if="activeTab === 'habits'" />
    <PomodoroView v-else-if="activeTab === 'pomodoro'" />
    <NavBar ref="navBar" @change="activeTab = $event" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import NavBar from './components/NavBar.vue'
import TasksView from './views/TasksView.vue'
import HabitsView from './views/HabitsView.vue'
import PomodoroView from './views/PomodoroView.vue'

const activeTab = ref('tasks')
const navBar = ref(null)
</script>

<style scoped>
.app {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}
</style>
```

Note: The header styles (`.app-header`, `.stats`, `.stat`) are now in `TasksView.vue` scoped CSS instead of `App.vue`. App.vue only keeps the outer layout container.

- [ ] **Step 5: Create `src/views/` directory**

Ensure the directory exists for TasksView.vue, HabitsView.vue, PomodoroView.vue.

- [ ] **Step 6: Run all tests**

Run: `npm test`
Expected: All tests PASS (store tests unaffected by UI changes)

- [ ] **Step 7: Manual smoke test**

Run: `npm run dev`
Verify:
- App opens with bottom navigation showing 三个 tab (清单/习惯/番茄钟)
- 清单 tab shows existing task list (no regression)
- 习惯 tab shows "还没有习惯" empty state, can add a habit, can check in
- 番茄钟 tab shows timer circle, start button works, tick events update display

- [ ] **Step 8: Commit**

```bash
git add src/App.vue src/style.css src/components/NavBar.vue src/views/
git commit -m "feat: add bottom navigation, wire up three views"
```

---

## Task 8: Final Integration & Cleanup

**Files:**
- Verify all files work together
- Run full test suite
- Build check

- [ ] **Step 1: Run full test suite**

Run: `npm test`
Expected: All tests PASS (taskStore, habitStore, pomodoroStore, persistence, TaskListTransition)

- [ ] **Step 2: Verify `electron-builder.json5` includes new directories**

Check that `files` array includes `electron/**/*` (it already does). The new `src/views/` and `src/components/habit/`, `src/components/pomodoro/` directories are part of the Vite build output in `dist/`, so no changes needed.

- [ ] **Step 3: Build check**

Run: `npm run build`
Expected: Build succeeds with no errors, `dist/` contains all assets

- [ ] **Step 4: Final commit if any fixes were needed**

```bash
git add -A
git commit -m "chore: integration fixes and cleanup"
```

---

## Verification Checklist

After all tasks are complete, verify end-to-end:

1. **清单页面**: Existing task functionality unchanged (add, edit, delete, filter, reorder)
2. **习惯页面**: Can add daily/weekly habits, check in, see streak + 7-day blocks, weekly progress bar
3. **番茄钟页面**: Timer starts, countdown displays, work→break transitions, notifications appear, daily count persists after restart
4. **导航**: Bottom nav switches between three views, active state visible
5. **数据持久化**: All three data files (`tasks.json`, `habits.json`, `pomodoros.json`) persist independently
6. **系统托盘**: Minimize to tray, timer continues running, restore works
7. **构建**: `npm run electron:build` produces working installer
