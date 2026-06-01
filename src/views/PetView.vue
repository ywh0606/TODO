<template>
  <div class="pet-view">
    <header class="view-header">
      <h1>我的伙伴</h1>
      <div class="level-badge">Lv.{{ store.pet.level }} {{ stageName }}</div>
    </header>

    <!-- 猫咪区域 -->
    <div class="pet-display">
      <PixelCat
        :stage="store.pet.stage"
        :mood="displayMood"
        :warning-text="store.statusWarning"
        @click="handleCatClick"
      />
    </div>

    <!-- 状态条 -->
    <div class="stats-section">
      <div class="stat-row">
        <span class="stat-label">经验</span>
        <div class="stat-bar exp-bar">
          <div class="stat-bar-fill exp-fill" :style="{ width: expPercent + '%' }"></div>
        </div>
        <span class="stat-value">{{ store.pet.exp }}/{{ store.pet.expToNext }}</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">饱食</span>
        <div class="stat-bar hunger-bar">
          <div class="stat-bar-fill hunger-fill" :style="{ width: store.pet.hunger + '%' }"></div>
        </div>
        <span class="stat-value">{{ store.pet.hunger }}/100</span>
      </div>
      <div class="stat-row">
        <span class="stat-label">心情</span>
        <div class="stat-bar mood-bar">
          <div class="stat-bar-fill mood-fill" :style="{ width: store.pet.mood + '%' }"></div>
        </div>
        <span class="stat-value">{{ store.pet.mood }}/100</span>
      </div>
    </div>

    <!-- 互动按钮 -->
    <PetInteraction
      :can-pet="store.canPet"
      :can-feed="store.canFeed"
      :pet-count="store.pet.todayPetCount"
      :feed-count="store.pet.todayFeedCount"
      @pet="handlePet"
      @feed="handleFeed"
    />

    <!-- 今日小结 -->
    <div class="summary-section">
      <div class="summary-item">
        <span class="summary-label">今日获得</span>
        <span class="summary-value exp-text">+{{ store.pet.todayExp }} EXP</span>
      </div>
      <div class="summary-item" v-if="nextStageLevel">
        <span class="summary-label">距下一阶段</span>
        <span class="summary-value">Lv.{{ nextStageLevel }} 还需 {{ store.expToNextStage }} EXP</span>
      </div>
      <div class="summary-item" v-else>
        <span class="summary-label">已达到最高阶段 ✨</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { usePetStore, STAGE_LEVELS } from '../stores/petStore'
import { stageNames } from '../components/pet/petPixelData'
import PixelCat from '../components/pet/PixelCat.vue'
import PetInteraction from '../components/pet/PetInteraction.vue'

const store = usePetStore()

// 点击猫咪时短暂切到 happy 表情
const temporaryHappy = ref(false)
let happyTimer = null

onUnmounted(() => {
  if (happyTimer) clearTimeout(happyTimer)
})

function flashHappy() {
  temporaryHappy.value = true
  if (happyTimer) clearTimeout(happyTimer)
  happyTimer = setTimeout(() => { temporaryHappy.value = false }, 1500)
}

const displayMood = computed(() => {
  if (temporaryHappy.value) return 'happy'
  return store.moodState
})

const stageName = computed(() => stageNames[store.pet.stage] || '未知')

const expPercent = computed(() => {
  if (!store.pet.expToNext) return 0
  return Math.round((store.pet.exp / store.pet.expToNext) * 100)
})

const nextStageLevel = computed(() => {
  if (store.pet.stage >= STAGE_LEVELS.length - 1) return null
  return STAGE_LEVELS[store.pet.stage + 1]
})

function handleCatClick() {
  flashHappy()
}

async function handlePet() {
  const ok = await store.petCat()
  if (ok) flashHappy()
}

async function handleFeed() {
  const ok = await store.feedSnack()
  if (ok) flashHappy()
}

onMounted(() => {
  store.loadPet()
})
</script>

<style scoped>
.pet-view {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow-y: auto;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border);
}

.view-header h1 {
  font-size: 24px;
  color: var(--color-text);
  font-weight: 600;
}

.level-badge {
  background: var(--color-primary-light);
  color: var(--color-primary);
  padding: 4px 12px;
  border-radius: var(--radius-lg);
  font-size: 13px;
  font-weight: 600;
}

/* 猫咪区域 */
.pet-display {
  display: flex;
  justify-content: center;
  padding: 24px 0;
}

/* 状态条 */
.stats-section {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 16px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  margin-bottom: 16px;
}

.stat-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.stat-label {
  font-size: 13px;
  color: var(--color-text-secondary);
  width: 32px;
  flex-shrink: 0;
}

.stat-bar {
  flex: 1;
  height: 10px;
  background: #F1F5F9;
  border-radius: 5px;
  overflow: hidden;
}

.stat-bar-fill {
  height: 100%;
  border-radius: 5px;
  transition: width 0.3s ease;
}

.exp-fill {
  background: linear-gradient(90deg, #3B82F6, #60A5FA);
}

.hunger-fill {
  background: linear-gradient(90deg, #F59E0B, #FBBF24);
}

.mood-fill {
  background: linear-gradient(90deg, #EC4899, #F472B6);
}

.stat-value {
  font-size: 12px;
  color: var(--color-text-muted);
  width: 70px;
  text-align: right;
  flex-shrink: 0;
}

/* 今日小结 */
.summary-section {
  margin-top: 16px;
  padding: 12px 16px;
  background: var(--color-surface);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.summary-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.summary-label {
  font-size: 13px;
  color: var(--color-text-secondary);
}

.summary-value {
  font-size: 13px;
  color: var(--color-text);
  font-weight: 500;
}

.exp-text {
  color: var(--color-primary);
}
</style>
