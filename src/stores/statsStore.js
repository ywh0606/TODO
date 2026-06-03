import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import dayjs from 'dayjs'
import { useTaskStore } from './taskStore'
import { useHabitStore } from './habitStore'
import { usePomodoroStore } from './pomodoroStore'

export const useStatsStore = defineStore('stats', () => {
  const timeRange = ref('7d') // '7d' | '30d'

  // 获取时间范围内的日期列表
  const dateRange = computed(() => {
    const days = timeRange.value === '7d' ? 7 : 30
    const result = []
    for (let i = days - 1; i >= 0; i--) {
      result.push(dayjs().subtract(i, 'day').format('YYYY-MM-DD'))
    }
    return result
  })

  // 日期标签（用于图表 x 轴）
  const dateLabels = computed(() => {
    return dateRange.value.map(d => {
      const date = dayjs(d)
      return date.format('M/D')
    })
  })

  // ① 任务完成数据
  const taskStats = computed(() => {
    const taskStore = useTaskStore()
    const tasks = taskStore.tasks
    const log = taskStore.completionLog

    // 每日完成数（当前任务 + 历史日志）
    const dailyCompleted = dateRange.value.map(date => {
      const fromActiveTasks = tasks.filter(t => {
        if (!t.completedAt) return false
        return dayjs(t.completedAt).format('YYYY-MM-DD') === date
      }).length
      const fromLog = log[date] || 0
      return fromActiveTasks + fromLog
    })

    // 今日摘要
    const today = dayjs().format('YYYY-MM-DD')
    const todayFromActiveTasks = tasks.filter(t => {
      if (!t.completedAt) return false
      return dayjs(t.completedAt).format('YYYY-MM-DD') === today
    }).length
    const todayFromLog = log[today] || 0
    const todayCompleted = todayFromActiveTasks + todayFromLog
    const todayPending = tasks.filter(t => !t.completed).length

    return {
      dailyData: dailyCompleted,
      todayCompleted,
      todayPending
    }
  })

  // ② 习惯打卡数据
  const habitStats = computed(() => {
    const habitStore = useHabitStore()
    const habits = habitStore.habits
    const checkins = habitStore.checkins

    const totalHabits = habits.length

    // 每日打卡率（百分比）
    const dailyRate = dateRange.value.map(date => {
      if (totalHabits === 0) return 0
      const checkedCount = habits.filter(h => {
        return (checkins[h.id] || []).includes(date)
      }).length
      return Math.round((checkedCount / totalHabits) * 100)
    })

    // 今日摘要
    const today = dayjs().format('YYYY-MM-DD')
    const todayChecked = habits.filter(h => {
      return (checkins[h.id] || []).includes(today)
    }).length
    const todayRate = totalHabits > 0 ? Math.round((todayChecked / totalHabits) * 100) : 0

    return {
      dailyData: dailyRate,
      todayChecked,
      todayTotal: totalHabits,
      todayRate
    }
  })

  // ③ 番茄钟数据
  const pomodoroStats = computed(() => {
    const pomodoroStore = usePomodoroStore()
    const dailyHistory = pomodoroStore.dailyHistory

    // 每日番茄数
    const dailyCount = dateRange.value.map(date => {
      return dailyHistory[date] || 0
    })

    // 今日摘要
    const today = dayjs().format('YYYY-MM-DD')
    const todayCount = dailyHistory[today] || 0
    const rangeTotal = dailyCount.reduce((sum, n) => sum + n, 0)

    return {
      dailyData: dailyCount,
      todayCount,
      rangeTotal
    }
  })

  function setTimeRange(range) {
    timeRange.value = range
  }

  return {
    timeRange,
    dateRange,
    dateLabels,
    taskStats,
    habitStats,
    pomodoroStats,
    setTimeRange
  }
})
