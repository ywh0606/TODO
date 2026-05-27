<template>
  <div class="task-list">
    <div v-if="store.filteredTasks.length === 0" class="empty-state">
      <p>暂无任务</p>
    </div>
    <TaskItem
      v-for="task in store.filteredTasks"
      :key="task.id"
      :task="task"
    />
  </div>
</template>

<script setup>
import { useTaskStore } from '../stores/taskStore'
import TaskItem from './TaskItem.vue'

const store = useTaskStore()
</script>

<style scoped>
.task-list {
  flex: 1;
  overflow-y: auto;
  padding: 4px 0;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
  color: #9E9E9E;
}
</style>
