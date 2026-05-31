// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { usePomodoroStore } from '../src/stores/pomodoroStore'

const mockSavePomodoros = vi.fn().mockResolvedValue({ success: true })
const mockLoadPomodoros = vi.fn().mockResolvedValue({})
const mockPomodoroStart = vi.fn().mockResolvedValue({ success: true })
const mockPomodoroStop = vi.fn().mockResolvedValue({ success: true })
const mockOnPomodoroTick = vi.fn()
const mockOnPomodoroComplete = vi.fn()

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()

  window.electronAPI = {
    savePomodoros: mockSavePomodoros,
    loadPomodoros: mockLoadPomodoros,
    pomodoroStart: mockPomodoroStart,
    pomodoroStop: mockPomodoroStop,
    onPomodoroTick: mockOnPomodoroTick,
    onPomodoroComplete: mockOnPomodoroComplete
  }
})

// ============================================================
// loadPomodoros
// ============================================================
describe('loadPomodoros', () => {
  it('从磁盘加载历史数据', async () => {
    mockLoadPomodoros.mockResolvedValue({ '2026-05-30': 5, '2026-05-31': 3 })

    const store = usePomodoroStore()
    await store.loadPomodoros()

    expect(store.dailyHistory['2026-05-30']).toBe(5)
    expect(store.dailyHistory['2026-05-31']).toBe(3)
  })

  it('无数据时为空对象', async () => {
    mockLoadPomodoros.mockResolvedValue({})

    const store = usePomodoroStore()
    await store.loadPomodoros()

    expect(Object.keys(store.dailyHistory)).toHaveLength(0)
  })
})

// ============================================================
// totalToday
// ============================================================
describe('totalToday', () => {
  it('今日无记录时返回 0', async () => {
    mockLoadPomodoros.mockResolvedValue({})

    const store = usePomodoroStore()
    await store.loadPomodoros()

    expect(store.totalToday).toBe(0)
  })

  it('返回今日番茄数', async () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    mockLoadPomodoros.mockResolvedValue({ [todayStr]: 4 })

    const store = usePomodoroStore()
    await store.loadPomodoros()

    expect(store.totalToday).toBe(4)
  })
})

// ============================================================
// weeklyData
// ============================================================
describe('weeklyData', () => {
  it('返回7天数据', async () => {
    mockLoadPomodoros.mockResolvedValue({})

    const store = usePomodoroStore()
    await store.loadPomodoros()

    const data = store.weeklyData
    expect(data).toHaveLength(7)
    expect(data[0]).toHaveProperty('date')
    expect(data[0]).toHaveProperty('label')
    expect(data[0]).toHaveProperty('count')
    expect(data[0].count).toBe(0)
  })

  it('包含正确的历史数据', async () => {
    const today = new Date()
    const todayStr = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth()+1).padStart(2,'0')}-${String(yesterday.getDate()).padStart(2,'0')}`

    mockLoadPomodoros.mockResolvedValue({ [todayStr]: 3, [yesterdayStr]: 5 })

    const store = usePomodoroStore()
    await store.loadPomodoros()

    const data = store.weeklyData
    expect(data[6].count).toBe(3)  // today
    expect(data[5].count).toBe(5)  // yesterday
  })
})

// ============================================================
// formattedTime
// ============================================================
describe('formattedTime', () => {
  it('格式化剩余时间为 MM:SS', () => {
    const store = usePomodoroStore()
    store.remainingSeconds = 1500 // 25:00

    expect(store.formattedTime).toBe('25:00')
  })

  it('不足10分钟时前面补0', () => {
    const store = usePomodoroStore()
    store.remainingSeconds = 299 // 04:59

    expect(store.formattedTime).toBe('04:59')
  })

  it('0秒时显示 00:00', () => {
    const store = usePomodoroStore()
    store.remainingSeconds = 0

    expect(store.formattedTime).toBe('00:00')
  })
})

// ============================================================
// startTimer / stopTimer
// ============================================================
describe('startTimer / stopTimer', () => {
  it('startTimer 调用 electronAPI.pomodoroStart', () => {
    const store = usePomodoroStore()
    store.startTimer()

    expect(mockPomodoroStart).toHaveBeenCalledTimes(1)
  })

  it('stopTimer 调用 electronAPI.pomodoroStop', () => {
    const store = usePomodoroStore()
    store.stopTimer()

    expect(mockPomodoroStop).toHaveBeenCalledTimes(1)
  })
})

// ============================================================
// handlePomodoroComplete
// ============================================================
describe('handlePomodoroComplete', () => {
  it('work-complete 时增加今日番茄数并保存', async () => {
    mockLoadPomodoros.mockResolvedValue({})

    const store = usePomodoroStore()
    await store.loadPomodoros()

    await store.handlePomodoroComplete({ type: 'work-complete', round: 1 })

    expect(store.totalToday).toBe(1)
    expect(mockSavePomodoros).toHaveBeenCalledTimes(1)
  })

  it('break-complete 时不增加计数', async () => {
    mockLoadPomodoros.mockResolvedValue({})

    const store = usePomodoroStore()
    await store.loadPomodoros()

    await store.handlePomodoroComplete({ type: 'break-complete' })

    expect(store.totalToday).toBe(0)
    expect(mockSavePomodoros).not.toHaveBeenCalled()
  })
})

// ============================================================
// 边界条件
// ============================================================
describe('边界条件', () => {
  it('无 electronAPI 时不会报错', async () => {
    delete window.electronAPI

    const store = usePomodoroStore()
    await expect(store.loadPomodoros()).resolves.not.toThrow()
    expect(() => store.startTimer()).not.toThrow()
    expect(() => store.stopTimer()).not.toThrow()
  })
})
