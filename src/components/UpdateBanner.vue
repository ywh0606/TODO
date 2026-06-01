<template>
  <Transition name="banner-slide">
    <div v-if="visible && !dismissed" class="update-banner" :class="state">
      <!-- 发现新版本 -->
      <template v-if="state === 'available'">
        <div class="banner-text">
          🎉 发现新版本 <strong>v{{ version }}</strong>
        </div>
        <button class="banner-btn primary" @click="$emit('download')">下载更新</button>
        <button class="banner-btn close" @click="dismissed = true">✕</button>
      </template>

      <!-- 下载中 -->
      <template v-else-if="state === 'downloading'">
        <div class="banner-text">
          📥 正在下载... {{ progress.percent }}%
          <span v-if="progress.bytesPerSecond" class="speed">（{{ speedText }}）</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: progress.percent + '%' }"></div>
        </div>
      </template>

      <!-- 下载完成 -->
      <template v-else-if="state === 'downloaded'">
        <div class="banner-text">
          ✅ v{{ version }} 已下载完成
        </div>
        <button class="banner-btn primary" @click="$emit('install')">立即安装</button>
        <button class="banner-btn close" @click="dismissed = true">✕</button>
      </template>

      <!-- 错误 -->
      <template v-else-if="state === 'error'">
        <div class="banner-text">
          ⚠️ 更新失败：{{ errorMessage }}
        </div>
        <button class="banner-btn primary" @click="$emit('retry')">重试</button>
        <button class="banner-btn close" @click="dismissed = true">✕</button>
      </template>
    </div>
  </Transition>
</template>

<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  visible: Boolean,
  state: { type: String, default: 'idle' }, // idle | available | downloading | downloaded | error
  version: { type: String, default: '' },
  progress: { type: Object, default: () => ({ percent: 0, bytesPerSecond: 0 }) },
  errorMessage: { type: String, default: '' }
})

defineEmits(['download', 'install', 'retry'])

const dismissed = ref(false)

const speedText = computed(() => {
  const bps = props.progress.bytesPerSecond || 0
  if (bps > 1048576) return (bps / 1048576).toFixed(1) + ' MB/s'
  if (bps > 1024) return (bps / 1024).toFixed(0) + ' KB/s'
  return bps + ' B/s'
})
</script>

<style scoped>
.update-banner {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border-radius: 10px;
  margin-bottom: 8px;
  font-size: 13px;
  flex-shrink: 0;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.update-banner.downloading {
  flex-direction: column;
  align-items: stretch;
  gap: 6px;
}

.banner-text {
  flex: 1;
  min-width: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.banner-text strong {
  color: var(--color-primary);
}

.speed {
  color: var(--color-text-muted);
  font-size: 12px;
}

.banner-btn {
  border: none;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  border-radius: 6px;
  padding: 4px 12px;
  transition: opacity 0.2s;
  flex-shrink: 0;
}

.banner-btn:hover {
  opacity: 0.85;
}

.banner-btn.primary {
  background: var(--color-primary);
  color: #fff;
}

.banner-btn.close {
  background: none;
  color: var(--color-text-muted);
  padding: 4px 6px;
  font-size: 14px;
}

.progress-bar {
  height: 6px;
  background: var(--color-border);
  border-radius: 3px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--color-primary);
  border-radius: 3px;
  transition: width 0.3s ease;
}

/* Transition */
.banner-slide-enter-active,
.banner-slide-leave-active {
  transition: all 0.3s ease;
}

.banner-slide-enter-from,
.banner-slide-leave-to {
  opacity: 0;
  transform: translateY(-10px);
  max-height: 0;
  margin-bottom: 0;
  padding-top: 0;
  padding-bottom: 0;
}
</style>
