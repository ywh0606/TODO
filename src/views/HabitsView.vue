<template>
  <div class="habits-view">
    <header class="view-header">
      <h1>我的习惯</h1>
    </header>
    <HabitInput />
    <HabitList />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useHabitStore } from '../stores/habitStore'
import HabitInput from '../components/habit/HabitInput.vue'
import HabitList from '../components/habit/HabitList.vue'

const store = useHabitStore()

onMounted(() => {
  store.loadHabits()
})
</script>

<style scoped>
.habits-view {
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
</style>
