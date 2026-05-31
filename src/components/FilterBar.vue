<template>
  <div class="filter-bar">
    <button
      v-for="option in options"
      :key="option.value"
      :class="['filter-btn', { active: store.filter === option.value }]"
      @click="store.filter = option.value"
    >
      {{ option.label }}
    </button>
  </div>
</template>

<script setup>
import { useTaskStore } from '../stores/taskStore'

const store = useTaskStore()

const options = [
  { value: 'all', label: '全部' },
  { value: 'today', label: '今天' },
  { value: 'upcoming', label: '即将到来' },
  { value: 'completed', label: '已完成' }
]
</script>

<style scoped>
.filter-bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.filter-btn {
  padding: 6px 14px;
  background: var(--color-surface);
  color: var(--color-text-secondary);
  border: 1px solid var(--color-border);
  border-radius: 20px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: inherit;
}

.filter-btn:hover {
  background: var(--color-primary-light);
  color: var(--color-primary);
  border-color: var(--color-primary);
}

.filter-btn.active {
  background: var(--color-primary);
  color: white;
  border-color: var(--color-primary);
}
</style>
