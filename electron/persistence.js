const path = require('path')
const fs = require('fs')

let DATA_FILE

function init(userDataPath) {
  DATA_FILE = path.join(userDataPath, 'tasks.json')
}

function loadData() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      return JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'))
    }
  } catch (e) {
    console.error('Failed to load data:', e)
  }
  return []
}

function saveData(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2))
}

module.exports = { init, loadData, saveData }