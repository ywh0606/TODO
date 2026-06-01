<template>
  <div class="app">
    <UpdateBanner
      :visible="updateState !== 'idle'"
      :state="updateState"
      :version="updateVersion"
      :progress="updateProgress"
      :error-message="updateError"
      @download="handleDownload"
      @install="handleInstall"
      @retry="handleRetry"
    />
    <TasksView v-if="activeTab === 'tasks'" />
    <HabitsView v-else-if="activeTab === 'habits'" />
    <PomodoroView v-else-if="activeTab === 'pomodoro'" />
    <PetView v-else-if="activeTab === 'pet'" />
    <NavBar ref="navBar" @change="activeTab = $event" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import NavBar from './components/NavBar.vue'
import UpdateBanner from './components/UpdateBanner.vue'
import TasksView from './views/TasksView.vue'
import HabitsView from './views/HabitsView.vue'
import PomodoroView from './views/PomodoroView.vue'
import PetView from './views/PetView.vue'

const activeTab = ref('tasks')
const navBar = ref(null)

// Update state
const updateState = ref('idle') // idle | available | downloading | downloaded | error
const updateVersion = ref('')
const updateProgress = ref({ percent: 0, bytesPerSecond: 0 })
const updateError = ref('')

function handleDownload() {
  updateState.value = 'downloading'
  updateProgress.value = { percent: 0, bytesPerSecond: 0 }
  window.electronAPI?.downloadUpdate()
}

function handleInstall() {
  window.electronAPI?.installUpdate()
}

function handleRetry() {
  updateState.value = 'idle'
  updateError.value = ''
  window.electronAPI?.checkForUpdates()
}

function setupUpdateListeners() {
  if (!window.electronAPI) return

  window.electronAPI.onUpdateAvailable((info) => {
    updateState.value = 'available'
    updateVersion.value = info.version
  })

  window.electronAPI.onUpdateDownloadProgress((progress) => {
    updateState.value = 'downloading'
    updateProgress.value = progress
  })

  window.electronAPI.onUpdateDownloaded((info) => {
    updateState.value = 'downloaded'
    updateVersion.value = info.version
  })

  window.electronAPI.onUpdateError((info) => {
    updateState.value = 'error'
    updateError.value = info.message
  })
}

onMounted(() => {
  setupUpdateListeners()
})
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
