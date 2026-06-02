import { describe, expect, it } from 'vitest'
import { formatDueDateTime, formatReminderLabel, isDisplayOverdue } from '../src/utils/taskDisplay'

const now = new Date(2026, 5, 2, 10, 0, 0)

function task(overrides = {}) {
  return {
    completed: false,
    dueDate: null,
    dueTime: null,
    reminder: null,
    ...overrides
  }
}

describe('formatDueDateTime', () => {
  it('今天带时间显示 今天 HH:mm', () => {
    expect(formatDueDateTime(task({ dueDate: '2026-06-02', dueTime: '14:30' }), now)).toBe('今天 14:30')
  })

  it('明天带时间显示 明天 HH:mm', () => {
    expect(formatDueDateTime(task({ dueDate: '2026-06-03', dueTime: '09:00' }), now)).toBe('明天 09:00')
  })

  it('未来日期带时间显示本周/下周或 M月D日 HH:mm', () => {
    expect(formatDueDateTime(task({ dueDate: '2026-06-05', dueTime: '18:00' }), now)).toBe('本周五 18:00')
  })

  it('没有时间时只显示日期文本', () => {
    expect(formatDueDateTime(task({ dueDate: '2026-06-02', dueTime: null }), now)).toBe('今天')
    expect(formatDueDateTime(task({ dueDate: '2026-06-03', dueTime: null }), now)).toBe('明天')
    expect(formatDueDateTime(task({ dueDate: '2026-06-05', dueTime: null }), now)).toBe('本周五')
  })

  it('逾期未完成加 已逾期 前缀', () => {
    expect(formatDueDateTime(task({ dueDate: '2026-06-01', dueTime: '18:00' }), now)).toBe('已逾期 · 6月1日 18:00')
  })

  it('已完成不显示逾期', () => {
    expect(formatDueDateTime(task({ completed: true, dueDate: '2026-06-01', dueTime: '18:00' }), now)).toBe('6月1日 18:00')
  })

  it('本周和下周的日期显示相对星期文本', () => {
    expect(formatDueDateTime(task({ dueDate: '2026-06-05', dueTime: null }), now)).toBe('本周五')
    expect(formatDueDateTime(task({ dueDate: '2026-06-08', dueTime: null }), now)).toBe('下周一')
  })

  it('周日边界按 ISO week 判断周二为下周', () => {
    const sunday = new Date(2026, 5, 7, 10, 0)
    const dueDate = new Date(2026, 5, 9).toISOString()

    expect(formatDueDateTime(task({ dueDate, dueTime: null }), sunday)).toBe('下周二')
    expect(formatDueDateTime(task({ dueDate, dueTime: '08:15' }), sunday)).toBe('下周二 08:15')
  })

  it('没有截止日期时返回空字符串', () => {
    expect(formatDueDateTime(task({ dueDate: null }), now)).toBe('')
  })

})

describe('formatReminderLabel', () => {
  it.each([
    ['at-due-time', '准时提醒'],
    ['5m', '提前 5 分钟'],
    ['30m', '提前 30 分钟'],
    ['1h', '提前 1 小时'],
    ['1d', '提前 1 天'],
    [null, '']
  ])('格式化 %s 为 %s', (reminder, label) => {
    expect(formatReminderLabel(reminder)).toBe(label)
  })
})

describe('isDisplayOverdue', () => {
  it('过期未完成任务返回 true', () => {
    expect(isDisplayOverdue(task({ dueDate: '2026-06-01', dueTime: '23:59' }), now)).toBe(true)
  })

  it('未来任务返回 false', () => {
    expect(isDisplayOverdue(task({ dueDate: '2026-06-05', dueTime: '09:00' }), now)).toBe(false)
  })

  it('已完成的过期任务返回 false', () => {
    expect(isDisplayOverdue(task({ completed: true, dueDate: '2026-06-01', dueTime: '23:59' }), now)).toBe(false)
  })
})
