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

<style scoped>
.timer-controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 24px;
}

.start-btn {
  padding: 12px 36px;
  background: var(--color-danger);
  color: white;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s, transform 0.1s;
}

.start-btn:hover {
  background: #DC2626;
}

.start-btn:active {
  transform: scale(0.97);
}

.stop-btn {
  padding: 10px 28px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  font-family: inherit;
  transition: background 0.2s;
}

.stop-btn:hover {
  background: var(--color-bg);
}
</style>
