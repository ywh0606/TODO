<template>
  <div class="app">
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
import { useTaskStore } from './stores/taskStore'
import TaskInput from './components/TaskInput.vue'
import FilterBar from './components/FilterBar.vue'
import TaskList from './components/TaskList.vue'

const store = useTaskStore()

onMounted(() => {
  store.loadTasks()
})
</script>

<style scoped>
.app {
  max-width: 500px;
  margin: 0 auto;
  padding: 20px 24px;
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.app-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #EEEEEE;
}

.app-header h1 {
  font-size: 24px;
  color: #5D4037;
  font-weight: 600;
}

.stats {
  display: flex;
  gap: 8px;
}

.stat {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.stat.pending {
  background: #FFF3E0;
  color: #E65100;
}

.stat.completed {
  background: #E8F5E9;
  color: #2E7D32;
}
</style>
