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
    // 数据迁移：给旧任务补上 order 字段
    tasks.value.forEach((task, index) => {
      if (task.order === undefined) {
        task.order = index
      }
    })
  }

  // 保存任务
  async function saveTasks() {
    if (window.electronAPI) {
      try {
        await window.electronAPI.saveTasks(JSON.parse(JSON.stringify(tasks.value)))
      } catch (e) {
        console.error('Failed to save tasks:', e)
      }
    }
  }

  // 添加任务
  async function addTask(title, priority = 'medium', dueDate = null) {
    const maxOrder = tasks.value.length > 0
      ? Math.max(...tasks.value.map(t => t.order ?? 0))
      : -1
    tasks.value.push({
      id: uuidv4(),
      title,
      completed: false,
      priority,
      dueDate: dueDate ? dayjs(dueDate).toISOString() : null,
      order: maxOrder + 1,
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

  // 更新任务
  async function updateTask(id, updates) {
    const task = tasks.value.find(t => t.id === id)
    if (task) {
      const allowed = ['title', 'priority', 'dueDate']
      const safeUpdates = Object.fromEntries(
        Object.entries(updates).filter(([k]) => allowed.includes(k))
      )
      Object.assign(task, safeUpdates, { updatedAt: dayjs().toISOString() })
      await saveTasks()
    }
  }

  // 重排任务（接受目标任务 ID，在全量 tasks 中定位索引）
  async function reorderTask(taskId, targetId) {
    const currentIndex = tasks.value.findIndex(t => t.id === taskId)
    const targetIndex = tasks.value.findIndex(t => t.id === targetId)
    if (currentIndex === -1 || targetIndex === -1 || currentIndex === targetIndex) return

    const movingForward = currentIndex < targetIndex
    const [moved] = tasks.value.splice(currentIndex, 1)
    // 重新查找 targetIndex（splice 后数组已变）
    const newIndex = tasks.value.findIndex(t => t.id === targetId)
    // 向前移动时插到目标后面，向后移动时插到目标前面
    tasks.value.splice(movingForward ? newIndex + 1 : newIndex, 0, moved)

    // 重新分配 order
    tasks.value.forEach((task, index) => {
      task.order = index
    })
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

    // 按手动排序，已完成任务排底部
    filtered.sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1
      return (a.order ?? 0) - (b.order ?? 0)
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
    deleteTask,
    updateTask,
    reorderTask
  }
})
