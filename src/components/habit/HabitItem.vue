<template>
  <div class="habit-item">
    <div class="habit-left">
      <button
        class="checkin-btn"
        :class="{ checked: isChecked }"
        :style="{ '--habit-color': habit.color }"
        @click="toggleCheckin"
      >
        <span v-if="isChecked">✓</span>
      </button>
      <div class="habit-info">
        <div class="habit-name">
          <span class="habit-icon">{{ habit.icon }}</span>
          {{ habit.name }}
        </div>
        <div class="habit-stats">
          <span class="streak" v-if="streak > 0">🔥 {{ streak }}天</span>
          <span class="total">共 {{ total }}次</span>
        </div>
        <div class="days-row">
          <div
            v-for="day in last7"
            :key="day.date"
            class="day-block"
            :class="{ checked: day.checked }"
            :style="{ '--habit-color': habit.color }"
            :title="day.date"
          ></div>
        </div>
        <div v-if="weeklyProgress" class="weekly-bar">
          <div class="weekly-fill" :style="{ width: weeklyPercent + '%', background: habit.color }"></div>
          <span class="weekly-label">{{ weeklyProgress.completed }}/{{ weeklyProgress.target }}</span>
        </div>
      </div>
    </div>
    <button @click.stop="store.deleteHabit(habit.id)" class="delete-btn">×</button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useHabitStore } from '../../stores/habitStore'

const props = defineProps({
  habit: { type: Object, required: true }
})

const store = useHabitStore()

const isChecked = computed(() => store.isCheckedInToday(props.habit.id))
const streak = computed(() => store.getStreak(props.habit.id))
const total = computed(() => store.getTotalCheckins(props.habit.id))
const last7 = computed(() => store.getLast7Days(props.habit.id))
const weeklyProgress = computed(() => store.getWeeklyProgress(props.habit.id))
const weeklyPercent = computed(() => {
  if (!weeklyProgress.value) return 0
  return Math.min(100, (weeklyProgress.value.completed / weeklyProgress.value.target) * 100)
})

function toggleCheckin() {
  if (isChecked.value) {
    store.uncheckin(props.habit.id)
  } else {
    store.checkin(props.habit.id)
  }
}
</script>

<style scoped>
.habit-item {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  box-shadow: var(--shadow-sm);
  transition: box-shadow 0.2s;
}

.habit-item:hover {
  box-shadow: var(--shadow-md);
}

.habit-left {
  display: flex;
  gap: 12px;
  flex: 1;
  min-width: 0;
}

.checkin-btn {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 2px solid var(--habit-color);
  background: transparent;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: transparent;
  flex-shrink: 0;
  transition: background 0.2s, color 0.2s;
}

.checkin-btn.checked {
  background: var(--habit-color);
  color: white;
}

.habit-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}

.habit-name {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text);
  display: flex;
  align-items: center;
  gap: 4px;
}

.habit-icon {
  font-size: 16px;
}

.habit-stats {
  display: flex;
  gap: 8px;
  font-size: 12px;
  color: var(--color-text-muted);
}

.streak {
  color: #F59E0B;
}

.days-row {
  display: flex;
  gap: 4px;
  margin-top: 2px;
}

.day-block {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: var(--color-border);
  transition: background 0.2s;
}

.day-block.checked {
  background: var(--habit-color);
}

.weekly-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;
  width: 100%;
  height: 14px;
  background: var(--color-bg);
  border-radius: 7px;
  overflow: hidden;
  position: relative;
}

.weekly-fill {
  height: 100%;
  border-radius: 7px;
  transition: width 0.3s;
  min-width: 0;
}

.weekly-label {
  position: absolute;
  right: 6px;
  font-size: 10px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 18px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
  transition: color 0.2s;
  flex-shrink: 0;
}

.delete-btn:hover {
  color: var(--color-danger);
}
</style>
