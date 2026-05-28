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
      <button @click="handleAdd" class="add-btn">添加</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useTaskStore } from '../stores/taskStore'

const store = useTaskStore()
const title = ref('')
const priority = ref('medium')
const dueDate = ref('')

async function handleAdd() {
  if (!title.value.trim()) return
  await store.addTask(title.value.trim(), priority.value, dueDate.value || null)
  title.value = ''
  dueDate.value = ''
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
  gap: 8px;
  margin-top: 8px;
}

.priority-select,
.date-input {
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
.date-input:focus {
  border-color: var(--color-primary);
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
