import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { v4 as uuidv4 } from 'uuid'
import dayjs from 'dayjs'

export const useTaskStore = defineStore('tasks', () => {
  const tasks = ref([])
  const filter = ref('all') // 'all' | 'today' | 'upcoming'

  // 加载任务
  async function loadTasks() {
    if (window.electronAPI) {
      tasks.value = await window.electronAPI.loadTasks()
    }
  }

  // 保存任务
  async function saveTasks() {
    if (window.electronAPI) {
      await window.electronAPI.saveTasks(tasks.value)
    }
  }

  // 添加任务
  async function addTask(title, priority = 'medium', dueDate = null) {
    tasks.value.push({
      id: uuidv4(),
      title,
      completed: false,
      priority,
      dueDate: dueDate ? dayjs(dueDate).toISOString() : null,
      createdAt: dayjs().toISOString(),
      updatedAt: dayjs().toISOString()
    })
    await saveTasks()
  }

  // 切换完成状态
  async function toggleTask(id) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      task.completed = !task.completed
      task.updatedAt = dayjs().toISOString()
      await saveTasks()
    }
  }

  // 删除任务
  async function deleteTask(id) {
    tasks.value = tasks.value.filter(t => t.id !== id)
    await saveTasks()
  }

  // 筛选后的任务列表
  const filteredTasks = computed(() => {
    const now = dayjs()
    let filtered = [...tasks.value]

    if (filter.value === 'today') {
      filtered = filtered.filter(t => {
        if (!t.dueDate) return false
        return dayjs(t.dueDate).isSame(now, 'day')
      })
    } else if (filter.value === 'upcoming') {
      filtered = filtered.filter(t => {
        if (!t.dueDate) return false
        const due = dayjs(t.dueDate)
        return due.isAfter(now) && due.isBefore(now.add(7, 'day'))
      })
    }

    // 按优先级排序
    const priorityOrder = { high: 0, medium: 1, low: 2 }
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return priorityOrder[a.priority] - priorityOrder[b.priority]
    })

    return filtered
  })

  // 统计
  const stats = computed(() => {
    const total = tasks.value.length
    const completed = tasks.value.filter(t => t.completed).length
    const pending = total - completed
    return { total, completed, pending }
  })

  return {
    tasks,
    filter,
    filteredTasks,
    stats,
    loadTasks,
    addTask,
    toggleTask,
    deleteTask
  }
})
