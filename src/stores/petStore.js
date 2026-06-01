import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'

// 进化阶段对应的等级阈值
export const STAGE_LEVELS = [1, 5, 12, 20, 30]

// 衰减速率（毫秒/点）
const HUNGER_DECAY_MS = 2 * 60 * 60 * 1000  // 每2小时降1点
const MOOD_DECAY_MS = 3 * 60 * 60 * 1000     // 每3小时降1点

// 互动每日上限
const DAILY_INTERACT_LIMIT = 3

// 奖励常量
const REWARDS = {
  task: { baseExp: 15, hunger: 8, mood: 3 },
  habit: { baseExp: 10, hunger: 5, mood: 5 },
  pomodoro: { baseExp: 12, hunger: 5, mood: 2 }
}

// 优先级经验倍率
const PRIORITY_MULTIPLIER = {
  high: 1.5,
  medium: 1.0,
  low: 0.7
}

// 连续打卡经验倍率
function streakMultiplier(streak) {
  if (streak >= 15) return 2.0
  if (streak >= 8) return 1.5
  if (streak >= 4) return 1.2
  return 1.0
}

// 升级所需经验
function expToNextLevel(level) {
  return 80 + level * 20
}

// 默认宠物数据
function defaultPet() {
  return {
    name: '小团子',
    level: 1,
    exp: 0,
    expToNext: expToNextLevel(1),
    hunger: 80,
    mood: 80,
    stage: 0,
    createdAt: dayjs().toISOString(),
    totalExp: 0,
    totalFeedCount: 0,
    totalPetCount: 0,
    lastUpdated: dayjs().toISOString(),
    todayFeedCount: 0,
    todayPetCount: 0,
    todayExp: 0,
    todayDate: dayjs().format('YYYY-MM-DD')
  }
}

export const usePetStore = defineStore('pet', () => {
  const pet = ref(defaultPet())

  // 加载宠物数据
  async function loadPet() {
    if (window.electronAPI) {
      const data = await window.electronAPI.loadPet()
      if (data) {
        pet.value = { ...defaultPet(), ...data }
      }
    }
    resetDailyCounters()
    applyDecay()
  }

  // 保存宠物数据
  async function savePet() {
    if (window.electronAPI) {
      try {
        pet.value.lastUpdated = dayjs().toISOString()
        await window.electronAPI.savePet(JSON.parse(JSON.stringify(pet.value)))
      } catch (e) {
        console.error('Failed to save pet:', e)
      }
    }
  }

  // 重置每日计数器
  function resetDailyCounters() {
    const today = dayjs().format('YYYY-MM-DD')
    if (pet.value.todayDate !== today) {
      pet.value.todayFeedCount = 0
      pet.value.todayPetCount = 0
      pet.value.todayExp = 0
      pet.value.todayDate = today
    }
  }

  // 应用离线衰减
  function applyDecay() {
    const now = dayjs()
    const last = dayjs(pet.value.lastUpdated)
    const elapsedMs = now.diff(last)

    if (elapsedMs > 0) {
      const hungerLoss = Math.floor(elapsedMs / HUNGER_DECAY_MS)
      const moodLoss = Math.floor(elapsedMs / MOOD_DECAY_MS)

      pet.value.hunger = Math.max(0, pet.value.hunger - hungerLoss)
      pet.value.mood = Math.max(0, pet.value.mood - moodLoss)
    }
  }

  // 检查并升级
  function checkLevelUp() {
    while (pet.value.exp >= pet.value.expToNext) {
      pet.value.exp -= pet.value.expToNext
      pet.value.level++
      pet.value.expToNext = expToNextLevel(pet.value.level)

      // 检查进化
      for (let i = STAGE_LEVELS.length - 1; i >= 0; i--) {
        if (pet.value.level >= STAGE_LEVELS[i]) {
          pet.value.stage = i
          break
        }
      }
    }
  }

  // 计算当前阶段对应的等级阈值
  const expToNext = computed(() => expToNextLevel(pet.value.level))

  // 距下一进化阶段所需的总经验估算
  const expToNextStage = computed(() => {
    const currentStageIndex = pet.value.stage
    if (currentStageIndex >= STAGE_LEVELS.length - 1) return 0 // 已满级阶段
    const nextStageLevel = STAGE_LEVELS[currentStageIndex + 1]
    let totalExpNeeded = 0
    for (let l = pet.value.level; l < nextStageLevel; l++) {
      totalExpNeeded += expToNextLevel(l)
    }
    return totalExpNeeded - pet.value.exp
  })

  // 当前表情状态
  const moodState = computed(() => {
    const minStat = Math.min(pet.value.hunger, pet.value.mood)
    if (minStat < 30) return 'sad'
    return 'normal'
  })

  // 奖励方法 — 由其他 Store 调用
  async function grantReward(type, context = {}) {
    const reward = REWARDS[type]
    if (!reward) return

    // 计算经验
    let exp = reward.baseExp
    if (type === 'task' && context.priority) {
      exp = Math.round(exp * (PRIORITY_MULTIPLIER[context.priority] || 1.0))
    }
    if (type === 'habit' && context.streak) {
      exp = Math.round(exp * streakMultiplier(context.streak))
    }

    // 增加属性
    pet.value.exp += exp
    pet.value.totalExp += exp
    pet.value.todayExp += exp
    pet.value.hunger = Math.min(100, pet.value.hunger + reward.hunger)
    pet.value.mood = Math.min(100, pet.value.mood + reward.mood)

    // 更新 expToNext
    pet.value.expToNext = expToNextLevel(pet.value.level)

    checkLevelUp()
    await savePet()
  }

  // 摸猫
  async function petCat() {
    if (pet.value.todayPetCount >= DAILY_INTERACT_LIMIT) return false
    pet.value.mood = Math.min(100, pet.value.mood + 10)
    pet.value.todayPetCount++
    pet.value.totalPetCount++
    await savePet()
    return true
  }

  // 喂零食
  async function feedSnack() {
    if (pet.value.todayFeedCount >= DAILY_INTERACT_LIMIT) return false
    pet.value.hunger = Math.min(100, pet.value.hunger + 15)
    pet.value.mood = Math.min(100, pet.value.mood + 3)
    pet.value.todayFeedCount++
    pet.value.totalFeedCount++
    await savePet()
    return true
  }

  // 互动次数状态
  const canPet = computed(() => pet.value.todayPetCount < DAILY_INTERACT_LIMIT)
  const canFeed = computed(() => pet.value.todayFeedCount < DAILY_INTERACT_LIMIT)

  // 随机气泡文字
  function getBubbleText() {
    const texts = ['喵~', '呼噜噜', '蹭蹭', '喵呜~', '咕噜咕噜']
    return texts[Math.floor(Math.random() * texts.length)]
  }

  // 低状态提醒文字
  const statusWarning = computed(() => {
    if (pet.value.hunger < 30) return '好饿…'
    if (pet.value.mood < 30) return '不开心…'
    return ''
  })

  return {
    pet,
    expToNext,
    expToNextStage,
    moodState,
    canPet,
    canFeed,
    statusWarning,
    loadPet,
    savePet,
    grantReward,
    petCat,
    feedSnack,
    getBubbleText
  }
})
