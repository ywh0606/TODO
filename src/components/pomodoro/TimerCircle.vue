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

<style scoped>
.timer-circle {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 180px;
  height: 180px;
  margin: 0 auto;
}

.progress-ring {
  position: absolute;
  top: 0;
  left: 0;
  transform: rotate(-90deg);
}

.ring-bg {
  fill: none;
  stroke: var(--color-border);
  stroke-width: 8;
}

.ring-progress {
  fill: none;
  stroke: var(--color-danger);
  stroke-width: 8;
  stroke-linecap: round;
  transition: stroke-dashoffset 1s linear;
}

.timer-circle.break .ring-progress,
.timer-circle.long-break .ring-progress {
  stroke: var(--color-success);
}

.timer-text {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  z-index: 1;
}

.time {
  font-size: 32px;
  font-weight: 700;
  color: var(--color-text);
  font-variant-numeric: tabular-nums;
}

.phase-label {
  font-size: 12px;
  color: var(--color-text-secondary);
}

.round-dots {
  display: flex;
  gap: 6px;
  margin-top: 4px;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--color-border);
  transition: background 0.3s;
}

.dot.filled {
  background: var(--color-danger);
}
</style>
