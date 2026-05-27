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
  { value: 'upcoming', label: '即将到来' }
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
  background: #FFF3E0;
  color: #E65100;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.2s;
}

.filter-btn:hover {
  background: #FFE0B2;
}

.filter-btn.active {
  background: #FF8A65;
  color: white;
}
</style>
