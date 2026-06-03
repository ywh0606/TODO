<template>
  <div class="stats-view">
    <div class="stats-header">
      <h2 class="stats-title">统计</h2>
      <div class="time-range-switch">
        <button
          :class="['range-btn', { active: statsStore.timeRange === '7d' }]"
          @click="statsStore.setTimeRange('7d')"
        >7 天</button>
        <button
          :class="['range-btn', { active: statsStore.timeRange === '30d' }]"
          @click="statsStore.setTimeRange('30d')"
        >30 天</button>
      </div>
    </div>

    <div class="stats-cards">
      <!-- 任务完成 -->
      <StatsCard icon="📋" title="任务完成">
        <template #summary>
          今天完成 {{ statsStore.taskStats.todayCompleted }} 个 / 待办 {{ statsStore.taskStats.todayPending }} 个
        </template>
        <template #chart>
          <TaskCompletionChart
            :labels="statsStore.dateLabels"
            :data="statsStore.taskStats.dailyData"
            :dates="statsStore.dateRange"
          />
        </template>
      </StatsCard>

      <!-- 习惯打卡 -->
      <StatsCard icon="✅" title="习惯打卡">
        <template #summary>
          <template v-if="statsStore.habitStats.todayTotal > 0">
            今天 {{ statsStore.habitStats.todayChecked }}/{{ statsStore.habitStats.todayTotal }} 已打卡（{{ statsStore.habitStats.todayRate }}%）
          </template>
          <template v-else>
            暂无习惯，去添加一个吧
          </template>
        </template>
        <template #chart>
          <HabitCheckinChart
            :labels="statsStore.dateLabels"
            :data="statsStore.habitStats.dailyData"
            :dates="statsStore.dateRange"
          />
        </template>
      </StatsCard>

      <!-- 番茄钟 -->
      <StatsCard icon="🍅" title="番茄钟">
        <template #summary>
          今天已完成 {{ statsStore.pomodoroStats.todayCount }} 个
          <span v-if="statsStore.pomodoroStats.rangeTotal > 0" class="range-total">
            · 本期累计 {{ statsStore.pomodoroStats.rangeTotal }} 个
          </span>
        </template>
        <template #chart>
          <PomodoroTrendChart
            :labels="statsStore.dateLabels"
            :data="statsStore.pomodoroStats.dailyData"
            :dates="statsStore.dateRange"
          />
        </template>
      </StatsCard>
    </div>
  </div>
</template>

<script setup>
import { useStatsStore } from '../stores/statsStore'
import StatsCard from '../components/stats/StatsCard.vue'
import TaskCompletionChart from '../components/stats/TaskCompletionChart.vue'
import HabitCheckinChart from '../components/stats/HabitCheckinChart.vue'
import PomodoroTrendChart from '../components/stats/PomodoroTrendChart.vue'

const statsStore = useStatsStore()
</script>

<style scoped>
.stats-view {
  flex: 1;
  overflow-y: auto;
  padding: 20px 16px 12px;
}

.stats-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.stats-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--color-text);
}

.time-range-switch {
  display: flex;
  gap: 4px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  padding: 2px;
}

.range-btn {
  padding: 4px 14px;
  border: none;
  border-radius: 18px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.2s ease;
  background: transparent;
  color: var(--color-text-secondary);
}

.range-btn:hover {
  color: var(--color-primary);
}

.range-btn.active {
  background: var(--color-primary);
  color: white;
}

.stats-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.range-total {
  color: var(--color-text-muted);
}
</style>
