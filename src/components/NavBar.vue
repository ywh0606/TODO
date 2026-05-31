<template>
  <nav class="navbar">
    <button
      v-for="tab in tabs"
      :key="tab.key"
      :class="['nav-btn', { active: currentTab === tab.key }]"
      @click="currentTab = tab.key"
    >
      <span class="nav-icon">{{ tab.icon }}</span>
      <span class="nav-label">{{ tab.label }}</span>
    </button>
  </nav>
</template>

<script setup>
import { ref, watch } from 'vue'

const currentTab = ref('tasks')
const tabs = [
  { key: 'tasks', icon: '📋', label: '清单' },
  { key: 'habits', icon: '✅', label: '习惯' },
  { key: 'pomodoro', icon: '🍅', label: '番茄钟' }
]

const emit = defineEmits(['change'])

watch(currentTab, (val) => {
  emit('change', val)
})
</script>

<style scoped>
.navbar {
  display: flex;
  border-top: 1px solid var(--color-border);
  background: var(--color-surface);
  padding: 6px 0 env(safe-area-inset-bottom, 6px);
  flex-shrink: 0;
}

.nav-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 8px 0;
  background: none;
  border: none;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color 0.2s;
  font-family: inherit;
}

.nav-btn.active {
  color: var(--color-primary);
}

.nav-icon {
  font-size: 20px;
  line-height: 1;
}

.nav-label {
  font-size: 11px;
  font-weight: 500;
}
</style>
