import { describe, it, expect, vi } from 'vitest'
import {
  REMINDER_OPTIONS,
  buildDueDateTime,
  calculateReminderTime,
  canScheduleTaskReminder,
  getNextReminderTimeoutDelay,
  isSameReminderTimestamp,
  isTaskOverdue,
  formatTaskReminderNotification,
  formatOverdueNotification
} from '../electron/taskReminders.js'

describe('taskReminders', () => {
  const now = new Date(2026, 5, 1, 10, 0)
  const june2 = new Date(2026, 5, 2).toISOString()
  const june1 = new Date(2026, 5, 1).toISOString()
  const may31 = new Date(2026, 4, 31).toISOString()

  function expectLocalDateTime(date, year, month, day, hours, minutes) {
    expect(date).toBeInstanceOf(Date)
    expect(date.getFullYear()).toBe(year)
    expect(date.getMonth()).toBe(month - 1)
    expect(date.getDate()).toBe(day)
    expect(date.getHours()).toBe(hours)
    expect(date.getMinutes()).toBe(minutes)
    expect(date.getSeconds()).toBe(0)
    expect(date.getMilliseconds()).toBe(0)
  }

  describe('REMINDER_OPTIONS', () => {
    it('定义任务提醒支持的相对选项', () => {
      expect(REMINDER_OPTIONS).toEqual({
        AT_DUE_TIME: 'at-due-time',
        FIVE_MINUTES: '5m',
        THIRTY_MINUTES: '30m',
        ONE_HOUR: '1h',
        ONE_DAY: '1d'
      })
    })
  })

  describe('buildDueDateTime', () => {
    it('把 dueDate 的日期和 dueTime 的时分组合成截止时间', () => {
      const result = buildDueDateTime(june2, '14:30')
      expectLocalDateTime(result, 2026, 6, 2, 14, 30)
    })

    it('把 date-only 字符串和 dueTime 解析成本地截止时间', () => {
      const result = buildDueDateTime('2026-06-02', '14:30')
      expectLocalDateTime(result, 2026, 6, 2, 14, 30)
    })

    it('缺少 dueDate 时返回 null', () => {
      expect(buildDueDateTime(null, '14:30')).toBeNull()
    })

    it('缺少 dueTime 时返回 null', () => {
      expect(buildDueDateTime(june2, '')).toBeNull()
    })

    it('dueTime 格式非法时返回 null', () => {
      expect(buildDueDateTime(june2, '99:99')).toBeNull()
      expect(buildDueDateTime(june2, 'abc')).toBeNull()
    })
  })

  describe('calculateReminderTime', () => {
    const dueDate = june2
    const dueTime = '14:30'

    it('到期时提醒等于截止时间', () => {
      expectLocalDateTime(calculateReminderTime(dueDate, dueTime, 'at-due-time'), 2026, 6, 2, 14, 30)
    })

    it('提前 5 分钟提醒', () => {
      expectLocalDateTime(calculateReminderTime(dueDate, dueTime, '5m'), 2026, 6, 2, 14, 25)
    })

    it('提前 30 分钟提醒', () => {
      expectLocalDateTime(calculateReminderTime(dueDate, dueTime, '30m'), 2026, 6, 2, 14, 0)
    })

    it('提前 1 小时提醒', () => {
      expectLocalDateTime(calculateReminderTime(dueDate, dueTime, '1h'), 2026, 6, 2, 13, 30)
    })

    it('提前 1 天提醒', () => {
      expectLocalDateTime(calculateReminderTime(dueDate, dueTime, '1d'), 2026, 6, 1, 14, 30)
    })

    it('非法 reminder 返回 null', () => {
      expect(calculateReminderTime(dueDate, dueTime, 'bad-value')).toBeNull()
    })
  })

  describe('canScheduleTaskReminder', () => {
    it('未来未完成任务可以调度', () => {
      const task = {
        id: '1',
        title: '提交日报',
        completed: false,
        dueDate: june2,
        dueTime: '14:30',
        reminder: '30m',
        remindedAt: null
      }
      expect(canScheduleTaskReminder(task, now)).toBe(true)
    })

    it('已完成任务不可调度', () => {
      const task = {
        completed: true,
        dueDate: june2,
        dueTime: '14:30',
        reminder: '30m',
        remindedAt: null
      }
      expect(canScheduleTaskReminder(task, now)).toBe(false)
    })

    it('缺少 dueTime 的任务不可调度', () => {
      const task = {
        completed: false,
        dueDate: june2,
        dueTime: '',
        reminder: '30m',
        remindedAt: null
      }
      expect(canScheduleTaskReminder(task, now)).toBe(false)
    })

    it('没有 reminder 的任务不可调度', () => {
      const task = {
        completed: false,
        dueDate: june2,
        dueTime: '14:30',
        reminder: null,
        remindedAt: null
      }
      expect(canScheduleTaskReminder(task, now)).toBe(false)
    })

    it('已经提醒过的任务不可调度', () => {
      const task = {
        completed: false,
        dueDate: june2,
        dueTime: '14:30',
        reminder: '30m',
        remindedAt: new Date(2026, 5, 2, 14, 0).toISOString()
      }
      expect(canScheduleTaskReminder(task, now)).toBe(false)
    })

    it('提醒时间已经过去的任务不可调度', () => {
      const task = {
        completed: false,
        dueDate: may31,
        dueTime: '14:30',
        reminder: '30m',
        remindedAt: null
      }
      expect(canScheduleTaskReminder(task, now)).toBe(false)
    })
  })

  describe('timer safety helpers', () => {
    it('caps long setTimeout delays so reminders more than 25 days away are not scheduled immediately', () => {
      const delay = getNextReminderTimeoutDelay(
        new Date(2026, 5, 26, 10, 0).getTime(),
        new Date(2026, 5, 1, 10, 0).getTime()
      )

      expect(delay).toBeGreaterThan(0)
      expect(delay).toBeLessThanOrEqual(2147483647)
    })

    it('detects stale queued timers when the latest reminder timestamp changed', () => {
      const plannedReminderTime = new Date(2026, 5, 2, 14, 0)
      const latestReminderTime = new Date(2026, 5, 2, 14, 30)

      expect(isSameReminderTimestamp(latestReminderTime, plannedReminderTime.getTime())).toBe(false)
    })
  })

  describe('isTaskOverdue', () => {
    it('截止时间已过且未完成时为逾期', () => {
      const task = {
        completed: false,
        dueDate: june1,
        dueTime: '09:00'
      }
      expect(isTaskOverdue(task, now)).toBe(true)
    })

    it('只有截止日期且日期早于今天时为逾期', () => {
      const task = {
        completed: false,
        dueDate: may31,
        dueTime: ''
      }
      expect(isTaskOverdue(task, now)).toBe(true)
    })

    it('今天只有日期且没有时间的任务不算逾期', () => {
      const task = {
        completed: false,
        dueDate: june1,
        dueTime: ''
      }
      expect(isTaskOverdue(task, now)).toBe(false)
    })

    it('date-only 字符串日期等于今天且没有时间时不算逾期', () => {
      const task = {
        completed: false,
        dueDate: '2026-06-02',
        dueTime: ''
      }
      vi.stubEnv('TZ', 'America/New_York')

      expect(isTaskOverdue(task, new Date(2026, 5, 2, 10, 0))).toBe(false)
    })

    it('date-only 字符串日期早于今天且没有时间时为逾期', () => {
      const task = {
        completed: false,
        dueDate: '2026-06-01',
        dueTime: ''
      }
      vi.stubEnv('TZ', 'America/New_York')

      expect(isTaskOverdue(task, new Date(2026, 5, 2, 10, 0))).toBe(true)
    })

    it('已完成任务不算逾期', () => {
      const task = {
        completed: true,
        dueDate: may31,
        dueTime: ''
      }
      expect(isTaskOverdue(task, now)).toBe(false)
    })
  })

  describe('notification formatters', () => {
    it('格式化任务到点提醒通知', () => {
      const task = {
        title: '提交日报',
        dueDate: june2,
        dueTime: '18:00'
      }
      expect(formatTaskReminderNotification(task)).toEqual({
        title: '任务提醒',
        body: '提交日报 · 18:00 截止'
      })
    })

    it('格式化逾期汇总通知', () => {
      expect(formatOverdueNotification([{ id: '1' }, { id: '2' }, { id: '3' }])).toEqual({
        title: '你有 3 个逾期任务',
        body: '打开清单查看并处理。'
      })
    })
  })
})
