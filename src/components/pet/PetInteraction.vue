<template>
  <div class="pet-interaction">
    <button
      :class="['interact-btn pet-btn', { disabled: !canPet }]"
      @click="$emit('pet')"
      :disabled="!canPet"
    >
      <span class="btn-icon">🤚</span>
      <span class="btn-text">摸摸</span>
      <span class="btn-count">({{ petCount }}/{{ limit }})</span>
    </button>
    <button
      :class="['interact-btn feed-btn', { disabled: !canFeed }]"
      @click="$emit('feed')"
      :disabled="!canFeed"
    >
      <span class="btn-icon">🍖</span>
      <span class="btn-text">零食</span>
      <span class="btn-count">({{ feedCount }}/{{ limit }})</span>
    </button>
  </div>
</template>

<script setup>
defineProps({
  canPet: { type: Boolean, default: true },
  canFeed: { type: Boolean, default: true },
  petCount: { type: Number, default: 0 },
  feedCount: { type: Number, default: 0 },
  limit: { type: Number, default: 3 }
})

defineEmits(['pet', 'feed'])
</script>

<style scoped>
.pet-interaction {
  display: flex;
  gap: 12px;
}

.interact-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md);
  background: var(--color-surface);
  cursor: pointer;
  font-family: inherit;
  font-size: 14px;
  color: var(--color-text);
  transition: all 0.2s;
}

.interact-btn:hover:not(.disabled) {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
}

.interact-btn.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.btn-icon {
  font-size: 16px;
}

.btn-text {
  font-weight: 500;
}

.btn-count {
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
