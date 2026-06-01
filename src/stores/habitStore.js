import { defineStore } from 'pinia'
import { ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'
import { usePetStore } from './petStore'

export const useHabitStore = defineStore('habits', () => {
  const habits = ref([])
  const checkins = ref({}) // { [habitId]: ['2026-05-30', ...] }

  async function loadHabits() {
    if (window.electronAPI) {
      const data = await window.electronAPI.loadHabits()
      habits.value = data.habits || []
      checkins.value = data.checkins || {}
    }
    // Migration: assign order to old habits
    habits.value.forEach((h, i) => {
      if (h.order === undefined) h.order = i
    })
  }

  async function saveHabits() {
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveHabits({
          habits: JSON.parse(JSON.stringify(habits.value)),
          checkins: JSON.parse(JSON.stringify(checkins.value))
        })
      } catch (e) {
        console.error('Failed to save habits:', e)
      }
    }
  }

  async function addHabit(name, icon, color, frequency, reminderTime = null) {
    const maxOrder = habits.value.length > 0
      ? Math.max(...habits.value.map(h => h.order ?? 0))
      : -1
    habits.value.push({
      id: uuidv4(),
      name,
      icon,
      color,
      frequency,
      reminderTime,
      createdAt: dayjs().toISOString(),
      order: maxOrder + 1
    })
    await saveHabits()
  }

  async function deleteHabit(id) {
    habits.value = habits.value.filter(h => h.id !== id)
    delete checkins.value[id]
    await saveHabits()
  }

  async function updateHabit(id, updates) {
    const habit = habits.value.find(h => h.id === id)
    if (habit) {
      const allowed = ['name', 'icon', 'color', 'frequency', 'reminderTime']
      const safeUpdates = Object.fromEntries(
        Object.entries(updates).filter(([k]) => allowed.includes(k))
      )
      Object.assign(habit, safeUpdates)
      await saveHabits()
    }
  }

  async function checkin(id) {
    const today = dayjs().format('YYYY-MM-DD')
    if (!checkins.value[id]) {
      checkins.value[id] = []
    }
    if (!checkins.value[id].includes(today)) {
      checkins.value[id].push(today)
      await saveHabits()
      // 宠物奖励
      try {
        const petStore = usePetStore()
        const streak = getStreak(id)
        await petStore.grantReward('habit', { habitId: id, streak })
      } catch (e) { console.warn('Pet reward failed:', e) }
    }
  }

  async function uncheckin(id) {
    const today = dayjs().format('YYYY-MM-DD')
    if (checkins.value[id]?.includes(today)) {
      checkins.value[id] = checkins.value[id].filter(d => d !== today)
      await saveHabits()
    }
  }

  function isCheckedInToday(id) {
    const today = dayjs().format('YYYY-MM-DD')
    return (checkins.value[id] || []).includes(today)
  }

  function getStreak(id) {
    const dates = ((checkins.value[id] || []).slice().sort().reverse())
    if (dates.length === 0) return 0

    let streak = 0
    const today = dayjs().startOf('day')
    const todayStr = today.format('YYYY-MM-DD')

    // Streak must include today
    if (dates[0] !== todayStr) return 0

    streak = 1
    let checkDate = today.subtract(1, 'day')

    for (let i = 1; i < dates.length; i++) {
      if (dates[i] === checkDate.format('YYYY-MM-DD')) {
        streak++
        checkDate = checkDate.subtract(1, 'day')
      } else {
        break
      }
    }
    return streak
  }

  function getTotalCheckins(id) {
    return (checkins.value[id] || []).length
  }

  function getLast7Days(id) {
    const dates = checkins.value[id] || []
    const result = []
    for (let i = 6; i >= 0; i--) {
      const date = dayjs().subtract(i, 'day')
      const dateStr = date.format('YYYY-MM-DD')
      result.push({
        date: dateStr,
        checked: dates.includes(dateStr)
      })
    }
    return result
  }

  function getWeeklyProgress(id) {
    const habit = habits.value.find(h => h.id === id)
    if (!habit || habit.frequency.type !== 'weekly') return null

    // Monday as start of week
    const today = dayjs()
    const dayOfWeek = today.day() // 0=Sunday
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = today.add(mondayOffset, 'day').startOf('day')

    const dates = checkins.value[id] || []
    const thisWeekCheckins = dates.filter(d => {
      const date = dayjs(d)
      return (date.isSame(monday) || date.isAfter(monday)) &&
             date.isBefore(monday.add(7, 'day'))
    })

    return {
      completed: thisWeekCheckins.length,
      target: habit.frequency.timesPerWeek
    }
  }

  return {
    habits,
    checkins,
    loadHabits,
    addHabit,
    deleteHabit,
    updateHabit,
    checkin,
    uncheckin,
    isCheckedInToday,
    getStreak,
    getTotalCheckins,
    getLast7Days,
    getWeeklyProgress
  }
})
