const MAX_TIMEOUT_DELAY = 2147483647

const REMINDER_OPTIONS = {
  AT_DUE_TIME: 'at-due-time',
  FIVE_MINUTES: '5m',
  THIRTY_MINUTES: '30m',
  ONE_HOUR: '1h',
  ONE_DAY: '1d'
}

const REMINDER_OFFSETS = {
  [REMINDER_OPTIONS.AT_DUE_TIME]: 0,
  [REMINDER_OPTIONS.FIVE_MINUTES]: 5 * 60 * 1000,
  [REMINDER_OPTIONS.THIRTY_MINUTES]: 30 * 60 * 1000,
  [REMINDER_OPTIONS.ONE_HOUR]: 60 * 60 * 1000,
  [REMINDER_OPTIONS.ONE_DAY]: 24 * 60 * 60 * 1000
}

function parseLocalDateParts(dueDate) {
  if (!dueDate) {
    return null
  }

  const dateOnlyMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dueDate)
  if (dateOnlyMatch) {
    return {
      year: Number(dateOnlyMatch[1]),
      monthIndex: Number(dateOnlyMatch[2]) - 1,
      day: Number(dateOnlyMatch[3])
    }
  }

  const date = new Date(dueDate)
  if (Number.isNaN(date.getTime())) {
    return null
  }

  return {
    year: date.getFullYear(),
    monthIndex: date.getMonth(),
    day: date.getDate()
  }
}

function buildDueDateTime(dueDate, dueTime) {
  if (!dueDate || !dueTime) {
    return null
  }

  const timeMatch = /^(\d{2}):(\d{2})$/.exec(dueTime)
  if (!timeMatch) {
    return null
  }

  const hours = Number(timeMatch[1])
  const minutes = Number(timeMatch[2])
  if (hours > 23 || minutes > 59) {
    return null
  }

  const dateParts = parseLocalDateParts(dueDate)
  if (!dateParts) {
    return null
  }

  return new Date(
    dateParts.year,
    dateParts.monthIndex,
    dateParts.day,
    hours,
    minutes,
    0,
    0
  )
}

function calculateReminderTime(dueDate, dueTime, reminder) {
  const offset = REMINDER_OFFSETS[reminder]
  if (offset === undefined) {
    return null
  }

  const dueDateTime = buildDueDateTime(dueDate, dueTime)
  if (!dueDateTime) {
    return null
  }

  return new Date(dueDateTime.getTime() - offset)
}

function getNextReminderTimeoutDelay(reminderTimestamp, nowTimestamp = Date.now()) {
  const remaining = reminderTimestamp - nowTimestamp
  if (remaining <= 0) {
    return 0
  }

  return Math.min(remaining, MAX_TIMEOUT_DELAY)
}

function isSameReminderTimestamp(reminderTime, plannedTimestamp) {
  return reminderTime instanceof Date && reminderTime.getTime() === plannedTimestamp
}

function canScheduleTaskReminder(task, now = new Date()) {
  if (!task || task.completed || !task.reminder || task.remindedAt) {
    return false
  }

  const reminderTime = calculateReminderTime(task.dueDate, task.dueTime, task.reminder)
  if (!reminderTime) {
    return false
  }

  return reminderTime.getTime() > now.getTime()
}

function isTaskOverdue(task, now = new Date()) {
  if (!task || task.completed || !task.dueDate) {
    return false
  }

  const dueDateTime = buildDueDateTime(task.dueDate, task.dueTime)
  if (dueDateTime) {
    return dueDateTime.getTime() < now.getTime()
  }

  const dueDateParts = parseLocalDateParts(task.dueDate)
  if (!dueDateParts) {
    return false
  }

  const todayStart = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate()
  )

  const dueDateStart = new Date(
    dueDateParts.year,
    dueDateParts.monthIndex,
    dueDateParts.day
  )

  return dueDateStart.getTime() < todayStart.getTime()
}

function formatTaskReminderNotification(task) {
  return {
    title: '任务提醒',
    body: `${task.title} · ${task.dueTime} 截止`
  }
}

function formatOverdueNotification(tasks) {
  return {
    title: `你有 ${tasks.length} 个逾期任务`,
    body: '打开清单查看并处理。'
  }
}

module.exports = {
  MAX_TIMEOUT_DELAY,
  REMINDER_OPTIONS,
  buildDueDateTime,
  calculateReminderTime,
  canScheduleTaskReminder,
  getNextReminderTimeoutDelay,
  isSameReminderTimestamp,
  isTaskOverdue,
  formatTaskReminderNotification,
  formatOverdueNotification
}
