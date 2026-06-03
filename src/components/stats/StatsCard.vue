<template>
  <div class="stats-card">
    <div class="stats-card-header">
      <span class="stats-card-icon">{{ icon }}</span>
      <span class="stats-card-title">{{ title }}</span>
    </div>
    <div class="stats-card-summary">
      <slot name="summary"></slot>
    </div>
    <div class="stats-card-chart">
      <slot name="chart"></slot>
    </div>
  </div>
</template>

<script setup>
defineProps({
  icon: { type: String, required: true },
  title: { type: String, required: true }
})
</script>

<style scoped>
.stats-card {
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  padding: 16px;
  border: 1px solid var(--color-border);
}

.stats-card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
}

.stats-card-icon {
  font-size: 18px;
}

.stats-card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--color-text);
}

.stats-card-summary {
  font-size: 13px;
  color: var(--color-text-secondary);
  margin-bottom: 12px;
  line-height: 1.5;
}

.stats-card-chart {
  position: relative;
  height: 180px;
}
</style>
