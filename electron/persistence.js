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

// Pet
function loadPetData() {
  return loadFile('pet.json', null)
}

function savePetData(data) {
  saveFile('pet.json', data)
}

module.exports = {
  init, loadData, saveData,
  loadHabits, saveHabits, loadPomodoros, savePomodoros,
  loadPetData, savePetData
}
