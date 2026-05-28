<template>
  <div class="task-item" :class="{ completed: task.completed }">
    <input
      type="checkbox"
      :checked="task.completed"
      @change="store.toggleTask(task.id)"
      class="checkbox"
    />
    <div class="task-content">
      <div class="task-title">{{ task.title }}</div>
      <div class="task-meta">
        <span class="priority-tag" :class="task.priority">
          {{ priorityLabel }}
        </span>
        <span v-if="task.dueDate" class="due-date">
          截止: {{ formattedDate }}
        </span>
      </div>
    </div>
    <button @click="store.deleteTask(task.id)" class="delete-btn">
      &times;
    </button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useTaskStore } from '../stores/taskStore'
import dayjs from 'dayjs'

const props = defineProps({
  task: {
    type: Object,
    required: true
  }
})

const store = useTaskStore()

const priorityLabel = computed(() => {
  const labels = { high: '高', medium: '中', low: '低' }
  return labels[props.task.priority]
})

const formattedDate = computed(() => {
  if (!props.task.dueDate) return ''
  const date = dayjs(props.task.dueDate)
  const today = dayjs()

  if (date.isSame(today, 'day')) return '今天'
  if (date.isSame(today.add(1, 'day'), 'day')) return '明天'
  if (date.isSame(today, 'week')) return '本周' + ['日', '一', '二', '三', '四', '五', '六'][date.day()]

  return date.format('M月D日')
})
</script>

<style scoped>
.task-item {
  display: flex;
  align-items: center;
  padding: 14px;
  background: var(--color-surface);
  border-radius: var(--radius-md);
  margin-bottom: 8px;
  border: 1px solid var(--color-border);
  transition: all 0.2s ease;
  box-shadow: var(--shadow-sm);
}

.task-item:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--color-primary-light);
}

.task-item.completed {
  opacity: 0.6;
}

.task-item.completed .task-title {
  text-decoration: line-through;
  color: var(--color-text-muted);
}

.checkbox {
  width: 18px;
  height: 18px;
  accent-color: var(--color-primary);
  margin-right: 12px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.checkbox:checked {
  animation: checkmark 0.3s ease;
}

@keyframes checkmark {
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 15px;
  color: var(--color-text);
  transition: color 0.2s;
}

.task-meta {
  display: flex;
  gap: 8px;
  margin-top: 4px;
}

.priority-tag {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
}

.priority-tag.high {
  background: #FEE2E2;
  color: var(--color-danger);
}

.priority-tag.medium {
  background: #FEF3C7;
  color: var(--color-warning);
}

.priority-tag.low {
  background: var(--color-bg);
  color: var(--color-text-muted);
}

.due-date {
  color: var(--color-text-muted);
  font-size: 12px;
}

.delete-btn {
  background: none;
  border: none;
  color: var(--color-text-muted);
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: var(--radius-sm);
  opacity: 0;
  transition: all 0.2s ease;
}

.task-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: var(--color-danger);
  background: #FEE2E2;
}
</style>
