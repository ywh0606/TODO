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
        @drop="onTaskDrop($event, task.id)"
      />
    </TransitionGroup>
    <button
      v-if="store.filter === 'completed' && store.filteredTasks.length > 0"
      class="clear-completed-btn"
      @click="store.clearCompleted()"
    >
      清除已完成
    </button>
  </div>
</template>

<script setup>
import { useTaskStore } from '../stores/taskStore'
import TaskItem from './TaskItem.vue'

const store = useTaskStore()

function onTaskDrop(draggedId, targetTaskId) {
  if (!draggedId || draggedId === targetTaskId) return
  store.reorderTask(draggedId, targetTaskId)
}
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

.clear-completed-btn {
  display: block;
  width: 100%;
  margin-top: 12px;
  padding: 10px;
  background: none;
  border: 1px dashed var(--color-border);
  border-radius: var(--radius-md);
  color: var(--color-text-muted);
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.clear-completed-btn:hover {
  border-color: var(--color-danger);
  color: var(--color-danger);
  background: #FEF2F2;
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
