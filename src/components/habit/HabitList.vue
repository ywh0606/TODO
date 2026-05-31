<template>
  <div class="habit-list">
    <div v-if="store.habits.length === 0" class="empty-state">
      <p>还没有习惯，添加一个开始吧 ✨</p>
    </div>
    <HabitItem
      v-for="habit in store.habits"
      :key="habit.id"
      :habit="habit"
    />
  </div>
</template>

<script setup>
import { useHabitStore } from '../../stores/habitStore'
import HabitItem from './HabitItem.vue'

const store = useHabitStore()
</script>

<style scoped>
.habit-list {
  flex: 1;
  overflow-y: auto;
}

.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
  color: var(--color-text-muted);
  font-size: 14px;
}
</style>
