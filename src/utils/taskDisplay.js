import dayjs from 'dayjs'
import isoWeek from 'dayjs/plugin/isoWeek'

dayjs.extend(isoWeek)

const REMINDER_LABELS = {
  'at-due-time': '准时提醒',
  '5m': '提前 5 分钟',
  '30m': '提前 30 分钟',
  '1h': '提前 1 小时',
  '1d': '提前 1 天'
}

const WEEKDAY_TEXT = ['日', '一', '二', '三', '四', '五', '六']

function parseValidDueTime(dueTime) {
  if (!dueTime) return null

  const match = /^(\d{2}):(\d{2})$/.exec(dueTime)
  if (!match) return null

  const hour = Number(match[1])
  const minute = Number(match[2])
  if (hour > 23 || minute > 59) return null

  return { hour, minute }
}

function parseDueDateTime(task) {
  if (!task?.dueDate) return null

  const date = dayjs(task.dueDate)
  if (!date.isValid()) return null

  const time = parseValidDueTime(task.dueTime)
  if (!time) return date.endOf('day')

  return date.hour(time.hour).minute(time.minute).second(0).millisecond(0)
}

function formatDateText(date, now) {
  const current = dayjs(now)

  if (date.isSame(current, 'day')) return '今天'
  if (date.isSame(current.add(1, 'day'), 'day')) return '明天'

  const currentWeekStart = current.startOf('isoWeek')
  const nextWeekStart = currentWeekStart.add(1, 'week')
  const nextWeekEnd = nextWeekStart.endOf('isoWeek')

  if (date.isAfter(current, 'day') && date.isBefore(nextWeekStart, 'day')) {
    return `本周${WEEKDAY_TEXT[date.day()]}`
  }
  if (
    (date.isSame(nextWeekStart, 'day') || date.isAfter(nextWeekStart, 'day')) &&
    (date.isSame(nextWeekEnd, 'day') || date.isBefore(nextWeekEnd, 'day'))
  ) {
    return `下周${WEEKDAY_TEXT[date.day()]}`
  }

  return date.format('M月D日')
}

export function isDisplayOverdue(task, now = new Date()) {
  if (!task?.dueDate || task.completed) return false

  const due = parseDueDateTime(task)
  if (!due) return false

  return due.isBefore(dayjs(now))
}

export function formatDueDateTime(task, now = new Date()) {
  const due = parseDueDateTime(task)
  if (!due) return ''

  const dateText = formatDateText(due, now)
  const timeText = parseValidDueTime(task.dueTime) ? ` ${due.format('HH:mm')}` : ''
  const overduePrefix = isDisplayOverdue(task, now) ? '已逾期 · ' : ''

  return `${overduePrefix}${dateText}${timeText}`
}

export function formatReminderLabel(reminder) {
  return REMINDER_LABELS[reminder] || ''
}
