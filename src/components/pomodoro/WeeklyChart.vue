<template>
  <div class="weekly-chart">
    <div class="chart-header">
      <span class="chart-title">本周统计</span>
      <span class="chart-total">今日 <strong>{{ store.totalToday }}</strong> 🍅</span>
    </div>
    <div class="chart-bars">
      <div v-for="day in store.weeklyData" :key="day.date" class="bar-col">
        <div class="bar-track">
          <div class="bar" :style="{ height: barHeight(day.count) + 'px' }"></div>
        </div>
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

<style scoped>
.weekly-chart {
  margin-top: 24px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  padding: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.chart-title {
  font-size: 14px;
  font-weight: 600;
  color: var(--color-text);
}

.chart-total {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.chart-total strong {
  color: var(--color-danger);
}

.chart-bars {
  display: flex;
  align-items: flex-end;
  gap: 0;
}

.bar-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.bar-track {
  width: 24px;
  height: 54px;
  display: flex;
  align-items: flex-end;
}

.bar {
  width: 100%;
  min-height: 4px;
  border-radius: 4px 4px 2px 2px;
  background: linear-gradient(to top, #EF4444, #F87171);
  transition: height 0.3s;
}

.bar-label {
  font-size: 11px;
  color: var(--color-text-muted);
}
</style>
