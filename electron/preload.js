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
  },
  // Pet persistence
  loadPet: () => ipcRenderer.invoke('load-pet'),
  savePet: (data) => ipcRenderer.invoke('save-pet', data)
})
