import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { usePetStore } from './petStore'

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
      // 宠物奖励
      try {
        const petStore = usePetStore()
        await petStore.grantReward('pomodoro')
      } catch (e) { console.warn('Pet reward failed:', e) }
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
