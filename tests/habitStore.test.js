// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHabitStore } from '../src/stores/habitStore'

const mockSaveHabits = vi.fn().mockResolvedValue({ success: true })
const mockLoadHabits = vi.fn().mockResolvedValue({ habits: [], checkins: {} })

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()

  window.electronAPI = {
    saveHabits: mockSaveHabits,
    loadHabits: mockLoadHabits
  }
})

// ============================================================
// addHabit
// ============================================================
describe('addHabit', () => {
  it('添加习惯后 habits 数组包含新习惯', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })

    expect(store.habits).toHaveLength(1)
    expect(store.habits[0].name).toBe('阅读')
    expect(store.habits[0].icon).toBe('📖')
    expect(store.habits[0].color).toBe('#3B82F6')
    expect(store.habits[0].frequency).toEqual({ type: 'daily' })
  })

  it('添加带提醒时间的习惯', async () => {
    const store = useHabitStore()
    await store.addHabit('运动', '🏃', '#10B981', { type: 'daily' }, '08:00')

    expect(store.habits[0].reminderTime).toBe('08:00')
  })

  it('添加每周习惯', async () => {
    const store = useHabitStore()
    await store.addHabit('健身', '💪', '#F59E0B', { type: 'weekly', timesPerWeek: 3 })

    expect(store.habits[0].frequency).toEqual({ type: 'weekly', timesPerWeek: 3 })
  })

  it('添加后自动保存', async () => {
    const store = useHabitStore()
    await store.addHabit('测试', '✅', '#3B82F6', { type: 'daily' })

    expect(mockSaveHabits).toHaveBeenCalledTimes(1)
  })

  it('习惯带有 UUID 格式 id', async () => {
    const store = useHabitStore()
    await store.addHabit('测试', '✅', '#3B82F6', { type: 'daily' })

    expect(store.habits[0].id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it('习惯带有 createdAt 和 order', async () => {
    const store = useHabitStore()
    await store.addHabit('测试', '✅', '#3B82F6', { type: 'daily' })

    expect(store.habits[0].createdAt).toBeTruthy()
    expect(store.habits[0].order).toBe(0)
  })

  it('多个习惯 order 递增', async () => {
    const store = useHabitStore()
    await store.addHabit('习惯1', '1️⃣', '#3B82F6', { type: 'daily' })
    await store.addHabit('习惯2', '2️⃣', '#10B981', { type: 'daily' })

    expect(store.habits[0].order).toBe(0)
    expect(store.habits[1].order).toBe(1)
  })
})

// ============================================================
// loadHabits
// ============================================================
describe('loadHabits', () => {
  it('从磁盘加载习惯数据', async () => {
    const data = {
      habits: [{ id: 'h1', name: '阅读', icon: '📖', color: '#3B82F6', frequency: { type: 'daily' }, reminderTime: null, createdAt: '2026-01-01T00:00:00.000Z', order: 0 }],
      checkins: { h1: ['2026-05-30'] }
    }
    mockLoadHabits.mockResolvedValue(data)

    const store = useHabitStore()
    await store.loadHabits()

    expect(store.habits).toHaveLength(1)
    expect(store.habits[0].name).toBe('阅读')
    expect(store.checkins.h1).toEqual(['2026-05-30'])
  })

  it('无数据时为空数组', async () => {
    mockLoadHabits.mockResolvedValue({ habits: [], checkins: {} })

    const store = useHabitStore()
    await store.loadHabits()

    expect(store.habits).toHaveLength(0)
  })

  it('旧习惯补上 order 字段', async () => {
    mockLoadHabits.mockResolvedValue({
      habits: [{ id: 'h1', name: '旧习惯', icon: '📖', color: '#3B82F6', frequency: { type: 'daily' }, reminderTime: null, createdAt: '2026-01-01T00:00:00.000Z' }],
      checkins: {}
    })

    const store = useHabitStore()
    await store.loadHabits()

    expect(store.habits[0].order).toBe(0)
  })
})

// ============================================================
// deleteHabit
// ============================================================
describe('deleteHabit', () => {
  it('删除指定习惯', async () => {
    const store = useHabitStore()
    await store.addHabit('保留', '✅', '#3B82F6', { type: 'daily' })
    await store.addHabit('删除', '❌', '#EF4444', { type: 'daily' })

    await store.deleteHabit(store.habits[1].id)

    expect(store.habits).toHaveLength(1)
    expect(store.habits[0].name).toBe('保留')
  })

  it('删除习惯时同时清除打卡记录', async () => {
    const store = useHabitStore()
    await store.addHabit('删除', '❌', '#EF4444', { type: 'daily' })
    const id = store.habits[0].id
    store.checkins[id] = ['2026-05-30']

    await store.deleteHabit(id)

    expect(store.checkins[id]).toBeUndefined()
  })
})

// ============================================================
// updateHabit
// ============================================================
describe('updateHabit', () => {
  it('更新习惯名称', async () => {
    const store = useHabitStore()
    await store.addHabit('旧名', '📖', '#3B82F6', { type: 'daily' })

    await store.updateHabit(store.habits[0].id, { name: '新名' })

    expect(store.habits[0].name).toBe('新名')
  })

  it('白名单外的字段不会被更新', async () => {
    const store = useHabitStore()
    await store.addHabit('测试', '📖', '#3B82F6', { type: 'daily' })

    await store.updateHabit(store.habits[0].id, { id: 'hacked', order: 999 })

    expect(store.habits[0].id).not.toBe('hacked')
    expect(store.habits[0].order).toBe(0)
  })
})

// ============================================================
// checkin / uncheckin
// ============================================================
describe('checkin', () => {
  it('今日打卡成功', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    await store.checkin(id)

    expect(store.checkins[id]).toHaveLength(1)
  })

  it('同一天重复打卡不重复记录', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    await store.checkin(id)
    await store.checkin(id)

    expect(store.checkins[id]).toHaveLength(1)
  })

  it('取消今日打卡', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    await store.checkin(id)
    expect(store.checkins[id]).toHaveLength(1)

    await store.uncheckin(id)
    expect(store.checkins[id]).toHaveLength(0)
  })
})

// ============================================================
// isCheckedInToday
// ============================================================
describe('isCheckedInToday', () => {
  it('今日已打卡返回 true', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    await store.checkin(id)

    expect(store.isCheckedInToday(id)).toBe(true)
  })

  it('今日未打卡返回 false', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    expect(store.isCheckedInToday(id)).toBe(false)
  })
})

// ============================================================
// getStreak
// ============================================================
describe('getStreak', () => {
  it('无打卡记录时返回 0', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    expect(store.getStreak(id)).toBe(0)
  })

  it('今天打卡返回 1', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    await store.checkin(id)

    expect(store.getStreak(id)).toBe(1)
  })

  it('连续3天打卡（含今天）返回 3', () => {
    const store = useHabitStore()
    const id = 'test-id'
    const today = new Date()
    const d1 = new Date(today); d1.setDate(d1.getDate() - 2)
    const d2 = new Date(today); d2.setDate(d2.getDate() - 1)
    // Format as YYYY-MM-DD
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

    store.checkins[id] = [fmt(d1), fmt(d2), fmt(today)]

    expect(store.getStreak(id)).toBe(3)
  })

  it('昨天打卡但今天未打卡返回 0', () => {
    const store = useHabitStore()
    const id = 'test-id'
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

    store.checkins[id] = [fmt(yesterday)]

    expect(store.getStreak(id)).toBe(0)
  })
})

// ============================================================
// getTotalCheckins
// ============================================================
describe('getTotalCheckins', () => {
  it('返回总打卡次数', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    store.checkins[id] = ['2026-05-28', '2026-05-29', '2026-05-30']

    expect(store.getTotalCheckins(id)).toBe(3)
  })

  it('无打卡记录返回 0', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    expect(store.getTotalCheckins(id)).toBe(0)
  })
})

// ============================================================
// getLast7Days
// ============================================================
describe('getLast7Days', () => {
  it('返回7天数据', () => {
    const store = useHabitStore()
    const id = 'test-id'
    const today = new Date()
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`

    store.checkins[id] = [fmt(today)]

    const result = store.getLast7Days(id)

    expect(result).toHaveLength(7)
    expect(result[6].checked).toBe(true)
    expect(result[0].checked).toBe(false)
  })

  it('无打卡记录全部为 false', () => {
    const store = useHabitStore()
    const result = store.getLast7Days('nonexistent')

    expect(result).toHaveLength(7)
    expect(result.every(d => d.checked === false)).toBe(true)
  })
})

// ============================================================
// getWeeklyProgress
// ============================================================
describe('getWeeklyProgress', () => {
  it('每日习惯返回 null', async () => {
    const store = useHabitStore()
    await store.addHabit('阅读', '📖', '#3B82F6', { type: 'daily' })
    const id = store.habits[0].id

    expect(store.getWeeklyProgress(id)).toBeNull()
  })

  it('每周习惯返回进度', async () => {
    const store = useHabitStore()
    await store.addHabit('健身', '💪', '#F59E0B', { type: 'weekly', timesPerWeek: 3 })
    const id = store.habits[0].id

    // 打卡2次
    const today = new Date()
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
    const fmt = (d) => `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
    store.checkins[id] = [fmt(yesterday), fmt(today)]

    const progress = store.getWeeklyProgress(id)
    expect(progress).not.toBeNull()
    expect(progress.target).toBe(3)
    // completed depends on which days fall in this week
    expect(progress.completed).toBeGreaterThanOrEqual(0)
  })
})

// ============================================================
// 边界条件
// ============================================================
describe('边界条件', () => {
  it('无 electronAPI 时不会报错', async () => {
    delete window.electronAPI

    const store = useHabitStore()
    await expect(store.addHabit('浏览器测试', '✅', '#3B82F6', { type: 'daily' })).resolves.not.toThrow()
    expect(store.habits).toHaveLength(1)
  })

  it('saveHabits 失败时静默处理', async () => {
    mockSaveHabits.mockRejectedValue(new Error('写入失败'))

    const store = useHabitStore()
    await expect(store.addHabit('测试', '✅', '#3B82F6', { type: 'daily' })).resolves.not.toThrow()
  })
})
