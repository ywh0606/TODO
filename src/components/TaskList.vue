<template>
  <div class="task-list">
    <div v-if="store.filteredTasks.length === 0" class="empty-state">
      <p>暂无任务</p>
    </div>
    <TransitionGroup name="task">
      <TaskItem
        v-for="task in store.filteredTasks"
        :key="task.id"
        :task="task"
      />
    </TransitionGroup>
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
  color: var(--color-text-muted);
}

.task-enter-active,
.task-leave-active {
  transition: all 0.3s ease;
}

.task-enter-from {
  opacity: 0;
  transform: translateY(-10px);
}

.task-leave-to {
  opacity: 0;
  transform: translateX(10px);
}
</style>
