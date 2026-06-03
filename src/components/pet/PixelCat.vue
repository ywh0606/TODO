<template>
  <div class="pet-cat" @click="handleClick">
    <svg viewBox="0 0 80 80" class="cat-svg" :class="'stage-' + stage">
      <!-- 蛋 -->
      <template v-if="stage === 0">
        <ellipse cx="40" cy="44" rx="20" ry="26" fill="#E4E8EC" stroke="#C4CCD4" stroke-width="1.5"/>
        <template v-if="mood === 'happy'">
          <circle cx="26" cy="46" r="2" fill="#C8A878" opacity="0.4"/>
          <circle cx="54" cy="46" r="2" fill="#C8A878" opacity="0.4"/>
        </template>
        <template v-if="mood === 'sad'">
          <path d="M34,58 L37,52 L35,48 L38,44" fill="none" stroke="#B8C0C8" stroke-width="1.5" stroke-linecap="round"/>
          <circle cx="54" cy="66" r="2.5" fill="#87CEEB" opacity="0.7"/>
        </template>
      </template>

      <!-- 猫 (stages 1-4) -->
      <template v-else>
        <!-- 耳朵 -->
        <polygon points="17,40 26,10 38,40" fill="#A0B0BE" stroke="#7A8A98" stroke-width="1"/>
        <polygon points="42,40 54,10 63,40" fill="#A0B0BE" stroke="#7A8A98" stroke-width="1"/>
        <polygon points="22,38 28,16 35,38" fill="#C8A888"/>
        <polygon points="45,38 52,16 58,38" fill="#C8A888"/>

        <!-- 头 -->
        <circle cx="40" cy="48" r="26" fill="#A0B0BE" stroke="#7A8A98" stroke-width="1.5"/>

        <!-- 下巴 -->
        <ellipse cx="40" cy="60" rx="14" ry="10" fill="#BCC8D4"/>

        <!-- 眼睛 — 开心 -->
        <template v-if="mood === 'happy'">
          <path d="M22,44 Q29,37 36,44" fill="none" stroke="#4A5A68" stroke-width="2" stroke-linecap="round"/>
          <path d="M44,44 Q51,37 58,44" fill="none" stroke="#4A5A68" stroke-width="2" stroke-linecap="round"/>
        </template>

        <!-- 眼睛 — 伤心 -->
        <template v-else-if="mood === 'sad'">
          <circle cx="30" cy="44" r="6" fill="white"/>
          <circle cx="50" cy="44" r="6" fill="white"/>
          <circle cx="30" cy="46" r="3.5" fill="#E8A820"/>
          <circle cx="50" cy="46" r="3.5" fill="#E8A820"/>
          <circle cx="30" cy="46" r="2" fill="#2A2A2A"/>
          <circle cx="50" cy="46" r="2" fill="#2A2A2A"/>
          <circle cx="32" cy="44" r="1.2" fill="white"/>
          <circle cx="52" cy="44" r="1.2" fill="white"/>
          <circle cx="60" cy="46" r="2.5" fill="#87CEEB" opacity="0.7"/>
        </template>

        <!-- 眼睛 — 普通 -->
        <template v-else>
          <circle cx="30" cy="44" r="6" fill="white"/>
          <circle cx="50" cy="44" r="6" fill="white"/>
          <circle cx="31" cy="44" r="3.5" fill="#E8A820"/>
          <circle cx="51" cy="44" r="3.5" fill="#E8A820"/>
          <circle cx="31" cy="44" r="2" fill="#2A2A2A"/>
          <circle cx="51" cy="44" r="2" fill="#2A2A2A"/>
          <circle cx="33" cy="42" r="1.5" fill="white"/>
          <circle cx="53" cy="42" r="1.5" fill="white"/>
        </template>

        <!-- 鼻子 -->
        <polygon points="37,52 43,52 40,56" fill="#C09070"/>

        <!-- 嘴 -->
        <path v-if="mood === 'sad'" d="M36,59 Q40,56 44,59" fill="none" stroke="#7A6A5A" stroke-width="1.5" stroke-linecap="round"/>
        <path v-else d="M35,58 Q40,63 45,58" fill="none" stroke="#7A6A5A" stroke-width="1.5" stroke-linecap="round"/>

        <!-- 胡须 (stage >= 2) -->
        <template v-if="stage >= 2">
          <line x1="10" y1="54" x2="23" y2="55" stroke="#8A9AAA" stroke-width="1" stroke-linecap="round"/>
          <line x1="10" y1="59" x2="23" y2="58" stroke="#8A9AAA" stroke-width="1" stroke-linecap="round"/>
          <line x1="57" y1="55" x2="70" y2="54" stroke="#8A9AAA" stroke-width="1" stroke-linecap="round"/>
          <line x1="57" y1="58" x2="70" y2="59" stroke="#8A9AAA" stroke-width="1" stroke-linecap="round"/>
        </template>

        <!-- 皇冠 (stage 4) -->
        <template v-if="stage === 4">
          <path d="M24,20 L28,6 L33,14 L40,2 L47,14 L52,6 L56,20 Z" fill="#FFD700"/>
          <circle cx="40" cy="6" r="3" fill="#FF4757"/>
        </template>
      </template>
    </svg>

    <transition name="bubble">
      <div v-if="showBubble" class="speech-bubble">{{ bubbleText }}</div>
    </transition>
    <div v-if="warningText" class="status-warning">{{ warningText }}</div>
  </div>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'

const props = defineProps({
  stage: { type: Number, required: true },
  mood: { type: String, default: 'normal' },
  warningText: { type: String, default: '' }
})

const showBubble = ref(false)
const bubbleText = ref('')
let bubbleTimer = null

const bubbleTexts = ['喵~', '呼噜噜', '蹭蹭', '喵呜~', '咕噜咕噜']

function handleClick() {
  bubbleText.value = bubbleTexts[Math.floor(Math.random() * bubbleTexts.length)]
  showBubble.value = true
  if (bubbleTimer) clearTimeout(bubbleTimer)
  bubbleTimer = setTimeout(() => { showBubble.value = false }, 1500)
}

onUnmounted(() => {
  if (bubbleTimer) clearTimeout(bubbleTimer)
})
</script>

<style scoped>
.pet-cat {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  user-select: none;
}

.cat-svg {
  transition: transform 0.2s ease;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.08));
}

.pet-cat:hover .cat-svg {
  transform: scale(1.08);
}

.pet-cat:active .cat-svg {
  transform: scale(0.95);
}

.cat-svg.stage-0 { width: 90px; height: 90px; }
.cat-svg.stage-1 { width: 110px; height: 110px; }
.cat-svg.stage-2 { width: 120px; height: 120px; }
.cat-svg.stage-3 { width: 130px; height: 130px; }
.cat-svg.stage-4 { width: 140px; height: 140px; }

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
