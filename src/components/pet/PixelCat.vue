<template>
  <div class="pixel-cat" @click="handleClick">
    <div class="pixel-grid">
      <div
        v-for="(row, y) in currentPixels"
        :key="y"
        class="pixel-row"
      >
        <div
          v-for="(color, x) in row"
          :key="x"
          class="pixel-cell"
          :style="{ backgroundColor: color === '.' ? 'transparent' : color }"
        />
      </div>
    </div>
    <transition name="bubble">
      <div v-if="showBubble" class="speech-bubble">{{ bubbleText }}</div>
    </transition>
    <div v-if="warningText" class="status-warning">{{ warningText }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { petPixelData } from './petPixelData'

const props = defineProps({
  stage: { type: Number, required: true },
  mood: { type: String, default: 'normal' }, // 'normal' | 'happy' | 'sad'
  warningText: { type: String, default: '' }
})

const showBubble = ref(false)
const bubbleText = ref('')
let bubbleTimer = null

const currentPixels = computed(() => {
  const stageData = petPixelData[props.stage]
  if (!stageData) return []
  return stageData[props.mood] || stageData.normal
})

const bubbleTexts = ['喵~', '呼噜噜', '蹭蹭', '喵呜~', '咕噜咕噜']

function handleClick() {
  bubbleText.value = bubbleTexts[Math.floor(Math.random() * bubbleTexts.length)]
  showBubble.value = true
  if (bubbleTimer) clearTimeout(bubbleTimer)
  bubbleTimer = setTimeout(() => {
    showBubble.value = false
  }, 1500)
}

onUnmounted(() => {
  if (bubbleTimer) clearTimeout(bubbleTimer)
})
</script>

<style scoped>
.pixel-cat {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.pixel-grid {
  display: flex;
  flex-direction: column;
  gap: 0;
  image-rendering: pixelated;
}

.pixel-row {
  display: flex;
  gap: 0;
}

.pixel-cell {
  width: 12px;
  height: 12px;
}

.speech-bubble {
  position: absolute;
  top: -8px;
  right: -20px;
  background: var(--color-surface);
  border: 2px solid var(--color-border);
  border-radius: 12px;
  padding: 4px 10px;
  font-size: 12px;
  color: var(--color-text);
  white-space: nowrap;
  box-shadow: var(--shadow-sm);
  z-index: 1;
}

.speech-bubble::after {
  content: '';
  position: absolute;
  bottom: -6px;
  left: 12px;
  width: 0;
  height: 0;
  border-left: 5px solid transparent;
  border-right: 5px solid transparent;
  border-top: 6px solid var(--color-surface);
}

.status-warning {
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-warning);
  font-weight: 500;
}

.bubble-enter-active,
.bubble-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.bubble-enter-from,
.bubble-leave-to {
  opacity: 0;
  transform: translateY(4px);
}
</style>
