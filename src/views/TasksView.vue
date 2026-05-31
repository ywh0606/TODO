<template>
  <div class="tasks-view">
    <header class="app-header">
      <h1>我的清单</h1>
      <div class="stats">
        <span class="stat pending">{{ store.stats.pending }} 待办</span>
        <span class="stat completed">{{ store.stats.completed }} 完成</span>
      </div>
    </header>
    <TaskInput />
    <FilterBar />
    <TaskList />
  </div>
</template>

<script setup>
import { onMounted } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import TaskInput from '../components/TaskInput.vue'
import FilterBar from '../components/FilterBar.vue'
import TaskList from '../components/TaskList.vue'

const store = useTaskStore()

onMounted(() => {
  store.loadTasks()
})
</script>

<style scoped>
.tasks-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.app-header h1 {
  font-size: 24px;
  color: var(--color-text);
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 8px;
}

.stat {
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 12px;
  font-weight: 500;
}

.stat.pending {
  background: var(--color-primary-light);
  color: var(--color-primary);
}

.stat.completed {
  background: #D1FAE5;
  color: var(--color-success);
}
</style>
