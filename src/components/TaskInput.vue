<template>
  <div class="task-input">
    <input
      v-model="title"
      type="text"
      placeholder="添加新任务..."
      @keyup.enter="handleAdd"
    />
    <div class="input-options">
      <select v-model="priority" class="priority-select">
        <option value="high">高优先级</option>
        <option value="medium">中优先级</option>
        <option value="low">低优先级</option>
      </select>
      <input
        v-model="dueDate"
        type="date"
        class="date-input"
      />
      <input
        v-model="dueTime"
        type="time"
        class="time-input"
      />
      <select
        v-model="reminder"
        class="reminder-select"
        :disabled="!canSetReminder"
      >
        <option :value="null">不提醒</option>
        <option value="at-due-time">到期时</option>
        <option value="5m">提前5分钟</option>
        <option value="30m">提前30分钟</option>
        <option value="1h">提前1小时</option>
        <option value="1d">提前1天</option>
      </select>
      <button @click="handleAdd" class="add-btn">添加</button>
    </div>
  </div>
</template>

<script setup>
import { computed, ref, watch } from 'vue'
import { useTaskStore } from '../stores/taskStore'

const store = useTaskStore()
const title = ref('')
const priority = ref('medium')
const dueDate = ref('')
const dueTime = ref('')
const reminder = ref(null)

const canSetReminder = computed(() => Boolean(dueDate.value && dueTime.value))

watch(canSetReminder, (canSet) => {
  if (!canSet) {
    reminder.value = null
  }
})

async function handleAdd() {
  if (!title.value.trim()) return
  await store.addTask(
    title.value.trim(),
    priority.value,
    dueDate.value || null,
    dueDate.value && dueTime.value ? dueTime.value : null,
    dueDate.value && dueTime.value ? reminder.value : null
  )
  title.value = ''
  dueDate.value = ''
  dueTime.value = ''
  reminder.value = null
  priority.value = 'medium'
}
</script>

<style scoped>
.task-input {
  margin-bottom: 16px;
}

.task-input input[type="text"] {
  width: 100%;
  padding: 12px 16px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
  font-family: inherit;
}

.task-input input[type="text"]:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px var(--color-primary-light);
}

.input-options {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}

.priority-select,
.date-input,
.time-input,
.reminder-select {
  padding: 8px 12px;
  border: 1.5px solid var(--color-border);
  border-radius: var(--radius-sm);
  font-size: 13px;
  outline: none;
  background: var(--color-surface);
  font-family: inherit;
  transition: border-color 0.2s;
}

.priority-select:focus,
.date-input:focus,
.time-input:focus,
.reminder-select:focus {
  border-color: var(--color-primary);
}

.reminder-select:disabled {
  color: var(--color-text-muted);
  background: var(--color-background);
  cursor: not-allowed;
  opacity: 0.65;
}

.add-btn {
  padding: 8px 20px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  font-size: 13px;
  transition: all 0.2s ease;
}

.add-btn:hover {
  background: var(--color-primary-hover);
  transform: translateY(-1px);
  box-shadow: var(--shadow-md);
}

.add-btn:active {
  transform: translateY(0);
}
</style>
