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

<style scoped>
.pomodoro-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.view-header h1 {
  font-size: 24px;
  color: var(--color-text);
  font-weight: 600;
}

.timer-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px 0;
}
</style>
