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
  border: 1.5px solid #E0E0E0;
  border-radius: 8px;
  background: #FAFAFA;
  font-size: 14px;
  outline: none;
  transition: border-color 0.2s;
}

.task-input input[type="text"]:focus {
  border-color: #FF8A65;
}

.input-options {
  display: flex;
  gap: 8px;
  margin-top: 8px;
}

.priority-select,
.date-input {
  padding: 8px 12px;
  border: 1.5px solid #E0E0E0;
  border-radius: 6px;
  font-size: 13px;
  outline: none;
  background: #FAFAFA;
}

.priority-select:focus,
.date-input:focus {
  border-color: #FF8A65;
}

.add-btn {
  padding: 8px 20px;
  background: #FF8A65;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  font-size: 13px;
}

.add-btn:hover {
  background: #FF7043;
}
</style>
