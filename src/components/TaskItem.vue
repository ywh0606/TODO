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
  background: #FAFAFA;
  border-radius: 8px;
  margin-bottom: 8px;
  border: 1px solid #EEEEEE;
  transition: all 0.2s;
}

.task-item:hover {
  border-color: #E0E0E0;
}

.task-item.completed {
  opacity: 0.6;
}

.checkbox {
  width: 18px;
  height: 18px;
  accent-color: #FF8A65;
  margin-right: 12px;
  cursor: pointer;
}

.task-content {
  flex: 1;
}

.task-title {
  font-size: 15px;
  color: #3E2723;
}

.completed .task-title {
  text-decoration: line-through;
  color: #9E9E9E;
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
}

.priority-tag.high {
  background: #FFEBEE;
  color: #C62828;
}

.priority-tag.medium {
  background: #FFF8E1;
  color: #F57F17;
}

.priority-tag.low {
  background: #F5F5F5;
  color: #9E9E9E;
}

.due-date {
  color: #9E9E9E;
  font-size: 12px;
}

.delete-btn {
  background: none;
  border: none;
  color: #BDBDBD;
  font-size: 20px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
  opacity: 0;
  transition: all 0.2s;
}

.task-item:hover .delete-btn {
  opacity: 1;
}

.delete-btn:hover {
  color: #E53935;
  background: #FFEBEE;
}
</style>
