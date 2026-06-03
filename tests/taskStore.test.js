// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '../src/stores/taskStore'

// Mock window.electronAPI
const mockSaveTasks = vi.fn().mockResolvedValue({ success: true })
const mockLoadTasks = vi.fn().mockResolvedValue([])
const mockLoadCompletionLog = vi.fn().mockResolvedValue({})
const mockSaveCompletionLog = vi.fn().mockResolvedValue({ success: true })

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()

  window.electronAPI = {
    saveTasks: mockSaveTasks,
    loadTasks: mockLoadTasks,
    loadCompletionLog: mockLoadCompletionLog,
    saveCompletionLog: mockSaveCompletionLog,
    savePet: vi.fn().mockResolvedValue({ success: true })
  }
})

// ============================================================
// 基础功能
// ============================================================
describe('addTask', () => {
  it('添加任务后 tasks 数组包含新任务', async () => {
    const store = useTaskStore()
    await store.addTask('买菜', 'medium', null)

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].title).toBe('买菜')
    expect(store.tasks[0].completed).toBe(false)
    expect(store.tasks[0].priority).toBe('medium')
    expect(store.tasks[0].dueDate).toBeNull()
  })

  it('添加任务后自动调用 saveTasks 保存到磁盘', async () => {
    const store = useTaskStore()
    await store.addTask('写代码', 'high', null)

    expect(mockSaveTasks).toHaveBeenCalledTimes(1)
  })

  it('传给 saveTasks 的是纯对象，不是 Vue Proxy', async () => {
    const store = useTaskStore()
    await store.addTask('测试', 'low', null)

    const savedData = mockSaveTasks.mock.calls[0][0]
    expect(Array.isArray(savedData)).toBe(true)
    // JSON.parse(JSON.stringify(...)) 会去掉 Proxy，验证可以正常序列化
    expect(() => JSON.stringify(savedData)).not.toThrow()
    // 验证不是 Proxy：Object.getPrototypeOf 应返回普通数组原型
    expect(Object.getPrototypeOf(savedData)).toBe(Array.prototype)
  })

  it('添加任务时保存 dueTime、reminder，并初始化 remindedAt 为 null', async () => {
    const store = useTaskStore()
    await store.addTask('提醒任务', 'medium', '2026-06-01', '09:30', '5m')

    expect(store.tasks[0].dueTime).toBe('09:30')
    expect(store.tasks[0].reminder).toBe('5m')
    expect(store.tasks[0].remindedAt).toBeNull()
  })

  it('没有具体时间时 reminder 自动保存为 null', async () => {
    const store = useTaskStore()
    await store.addTask('无具体时间提醒', 'medium', '2026-06-01', null, '5m')

    expect(store.tasks[0].dueTime).toBeNull()
    expect(store.tasks[0].reminder).toBeNull()
  })

  it('未知 reminder 添加时保存为 null', async () => {
    const store = useTaskStore()
    await store.addTask('未知提醒', 'medium', '2026-06-01', '09:30', '10m')

    expect(store.tasks[0].dueTime).toBe('09:30')
    expect(store.tasks[0].reminder).toBeNull()
  })

  it('没有 dueDate 时不会保留 dueTime、reminder、remindedAt', async () => {
    const store = useTaskStore()
    await store.addTask('无日期提醒', 'medium', null, '09:30', '5m')

    expect(store.tasks[0].dueDate).toBeNull()
    expect(store.tasks[0].dueTime).toBeNull()
    expect(store.tasks[0].reminder).toBeNull()
    expect(store.tasks[0].remindedAt).toBeNull()
  })
  it('任务带有有效的 UUID 格式 id', async () => {
    const store = useTaskStore()
    await store.addTask('测试ID', 'medium', null)

    const id = store.tasks[0].id
    expect(id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
    )
  })

  it('任务带有 createdAt 和 updatedAt 时间戳', async () => {
    const store = useTaskStore()
    await store.addTask('时间戳测试', 'medium', null)

    const task = store.tasks[0]
    expect(task.createdAt).toBeTruthy()
    expect(task.updatedAt).toBeTruthy()
    expect(new Date(task.createdAt).toISOString()).toBe(task.createdAt)
    expect(new Date(task.updatedAt).toISOString()).toBe(task.updatedAt)
  })
})

describe('addTask - dueDate 处理', () => {
  it('dueDate 为 null 时保持 null', async () => {
    const store = useTaskStore()
    await store.addTask('无日期', 'medium', null)

    expect(store.tasks[0].dueDate).toBeNull()
  })

  it('dueDate 为空字符串时视为 null', async () => {
    const store = useTaskStore()
    await store.addTask('空日期', 'medium', '')

    expect(store.tasks[0].dueDate).toBeNull()
  })

  it('dueDate 为有效日期字符串时转换为 ISO 格式', async () => {
    const store = useTaskStore()
    await store.addTask('有日期', 'medium', '2026-06-01')

    expect(store.tasks[0].dueDate).toBeTruthy()
    expect(store.tasks[0].dueDate).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  })
})

describe('addTask - priority 参数', () => {
  it('默认优先级为 medium', async () => {
    const store = useTaskStore()
    await store.addTask('默认优先级')

    expect(store.tasks[0].priority).toBe('medium')
  })

  it('可以指定 high 优先级', async () => {
    const store = useTaskStore()
    await store.addTask('高优先', 'high')

    expect(store.tasks[0].priority).toBe('high')
  })

  it('可以指定 low 优先级', async () => {
    const store = useTaskStore()
    await store.addTask('低优先', 'low')

    expect(store.tasks[0].priority).toBe('low')
  })
})

describe('loadTasks', () => {
  it('从磁盘加载任务到 tasks 数组', async () => {
    const savedTasks = [
      { id: '1', title: '已保存任务', completed: false, priority: 'medium', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }
    ]
    mockLoadTasks.mockResolvedValue(savedTasks)

    const store = useTaskStore()
    await store.loadTasks()

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].title).toBe('已保存任务')
  })

  it('磁盘无数据时 tasks 为空数组', async () => {
    mockLoadTasks.mockResolvedValue([])

    const store = useTaskStore()
    await store.loadTasks()

    expect(store.tasks).toHaveLength(0)
  })

  it('加载多个任务', async () => {
    const savedTasks = [
      { id: '1', title: '任务1', completed: false, priority: 'high', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      { id: '2', title: '任务2', completed: true, priority: 'low', dueDate: '2026-06-01T00:00:00.000Z', createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-03T00:00:00.000Z' },
      { id: '3', title: '任务3', completed: false, priority: 'medium', dueDate: null, createdAt: '2026-01-04T00:00:00.000Z', updatedAt: '2026-01-04T00:00:00.000Z' }
    ]
    mockLoadTasks.mockResolvedValue(savedTasks)

    const store = useTaskStore()
    await store.loadTasks()

    expect(store.tasks).toHaveLength(3)
  })
  it('加载旧数据时清理没有 dueDate 或 dueTime 的提醒元数据', async () => {
    mockLoadTasks.mockResolvedValue([
      { id: '1', title: '无日期', completed: false, priority: 'medium', dueDate: null, dueTime: '09:00', reminder: '5m', remindedAt: '2026-06-01T08:55:00.000Z' },
      { id: '2', title: '无时间', completed: false, priority: 'medium', dueDate: '2026-06-01T00:00:00.000Z', dueTime: null, reminder: '30m', remindedAt: '2026-06-01T08:30:00.000Z' }
    ])

    const store = useTaskStore()
    await store.loadTasks()

    expect(store.tasks[0].dueTime).toBeNull()
    expect(store.tasks[0].reminder).toBeNull()
    expect(store.tasks[0].remindedAt).toBeNull()
    expect(store.tasks[1].dueTime).toBeNull()
    expect(store.tasks[1].reminder).toBeNull()
    expect(store.tasks[1].remindedAt).toBeNull()
  })

  it('加载旧数据时清理非法 reminder', async () => {
    mockLoadTasks.mockResolvedValue([
      { id: '1', title: '非法提醒', completed: false, priority: 'medium', dueDate: '2026-06-01T00:00:00.000Z', dueTime: '09:00', reminder: '10m', remindedAt: '2026-06-01T08:50:00.000Z' }
    ])

    const store = useTaskStore()
    await store.loadTasks()

    expect(store.tasks[0].dueTime).toBe('09:00')
    expect(store.tasks[0].reminder).toBeNull()
    expect(store.tasks[0].remindedAt).toBeNull()
  })
})

describe('toggleTask', () => {
  it('切换未完成任务为已完成', async () => {
    const store = useTaskStore()
    await store.addTask('待完成', 'medium', null)
    const id = store.tasks[0].id

    await store.toggleTask(id)

    expect(store.tasks[0].completed).toBe(true)
  })

  it('切换已完成任务为未完成', async () => {
    const store = useTaskStore()
    await store.addTask('待完成', 'medium', null)
    const id = store.tasks[0].id

    await store.toggleTask(id) // → completed
    await store.toggleTask(id) // → not completed

    expect(store.tasks[0].completed).toBe(false)
  })

  it('切换后调用 saveTasks 保存', async () => {
    const store = useTaskStore()
    await store.addTask('保存测试', 'medium', null)
    vi.clearAllMocks()

    await store.toggleTask(store.tasks[0].id)

    expect(mockSaveTasks).toHaveBeenCalledTimes(1)
  })

  it('切换后 updatedAt 被更新', async () => {
    const store = useTaskStore()
    await store.addTask('时间更新', 'medium', null)
    const originalUpdatedAt = store.tasks[0].updatedAt

    // 等待到下一毫秒，避免 Date/Dayjs 在同一毫秒内生成相同 ISO 字符串
    const waitForNextMillisecond = () => new Promise((resolve) => {
      const start = Date.now()
      const poll = () => {
        if (Date.now() !== start) {
          resolve()
        } else {
          setTimeout(poll, 0)
        }
      }
      poll()
    })
    await waitForNextMillisecond()
    await store.toggleTask(store.tasks[0].id)

    expect(store.tasks[0].updatedAt).not.toBe(originalUpdatedAt)
  })

  it('切换不存在的 id 不会报错', async () => {
    const store = useTaskStore()
    await store.addTask('正常任务', 'medium', null)

    await expect(store.toggleTask('non-existent-id')).resolves.not.toThrow()
    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].completed).toBe(false)
  })
})

describe('deleteTask', () => {
  it('删除指定任务', async () => {
    const store = useTaskStore()
    await store.addTask('要删除', 'medium', null)
    await store.addTask('要保留', 'high', null)
    const deleteId = store.tasks[0].id

    await store.deleteTask(deleteId)

    expect(store.tasks).toHaveLength(1)
    expect(store.tasks[0].title).toBe('要保留')
  })

  it('删除后调用 saveTasks 保存', async () => {
    const store = useTaskStore()
    await store.addTask('删除保存', 'medium', null)
    vi.clearAllMocks()

    await store.deleteTask(store.tasks[0].id)

    expect(mockSaveTasks).toHaveBeenCalledTimes(1)
  })

  it('删除不存在的 id 不会报错', async () => {
    const store = useTaskStore()
    await store.addTask('正常任务', 'medium', null)

    await expect(store.deleteTask('non-existent-id')).resolves.not.toThrow()
    expect(store.tasks).toHaveLength(1)
  })

  it('删除所有任务后 tasks 为空数组', async () => {
    const store = useTaskStore()
    await store.addTask('任务1', 'medium', null)
    await store.addTask('任务2', 'high', null)

    await store.deleteTask(store.tasks[0].id)
    await store.deleteTask(store.tasks[0].id)

    expect(store.tasks).toHaveLength(0)
  })
})

// ============================================================
// 边界条件
// ============================================================
describe('边界条件', () => {
  it('无 electronAPI 时（浏览器环境）不会报错', async () => {
    delete window.electronAPI

    const store = useTaskStore()
    await expect(store.addTask('浏览器测试', 'medium', null)).resolves.not.toThrow()
    expect(store.tasks).toHaveLength(1)
  })

  it('无 electronAPI 时 loadTasks 不会报错', async () => {
    delete window.electronAPI

    const store = useTaskStore()
    await expect(store.loadTasks()).resolves.not.toThrow()
    expect(store.tasks).toHaveLength(0)
  })

  it('saveTasks 失败时不会抛出异常（静默处理）', async () => {
    mockSaveTasks.mockRejectedValueOnce(new Error('写入失败'))

    const store = useTaskStore()
    await expect(store.addTask('保存失败测试', 'medium', null)).resolves.not.toThrow()
  })

  it('连续添加多个任务后全部持久化', async () => {
    const store = useTaskStore()
    for (let i = 0; i < 10; i++) {
      await store.addTask(`任务${i}`, 'medium', null)
    }

    expect(store.tasks).toHaveLength(10)
    // 最后一次 saveTasks 调用应该包含全部 10 个任务
    const lastSaveCall = mockSaveTasks.mock.calls[mockSaveTasks.mock.calls.length - 1][0]
    expect(lastSaveCall).toHaveLength(10)
  })

  it('任务标题包含特殊字符', async () => {
    const store = useTaskStore()
    const specialTitle = '任务 "引号" <标签> &符号 \\反斜杠\n换行\t制表符'

    await store.addTask(specialTitle, 'medium', null)
    expect(store.tasks[0].title).toBe(specialTitle)

    // 验证可以正常序列化
    const savedData = mockSaveTasks.mock.calls[0][0]
    expect(() => JSON.stringify(savedData)).not.toThrow()
    expect(JSON.parse(JSON.stringify(savedData))[0].title).toBe(specialTitle)
  })

  it('任务标题包含中文和 emoji', async () => {
    const store = useTaskStore()
    const emojiTitle = '完成报告 📝 买水果 🍎'

    await store.addTask(emojiTitle, 'medium', null)
    expect(store.tasks[0].title).toBe(emojiTitle)
  })

  it('任务标题为空字符串（不 trim）', async () => {
    const store = useTaskStore()
    await store.addTask('', 'medium', null)

    expect(store.tasks[0].title).toBe('')
  })

  it('任务标题超长（1000 字符）', async () => {
    const store = useTaskStore()
    const longTitle = 'A'.repeat(1000)

    await store.addTask(longTitle, 'medium', null)
    expect(store.tasks[0].title).toHaveLength(1000)
  })
})

// ============================================================
// 统计与筛选
// ============================================================
describe('stats', () => {
  it('空列表时统计全部为 0', () => {
    const store = useTaskStore()
    expect(store.stats).toEqual({ total: 0, completed: 0, pending: 0 })
  })

  it('正确统计总数、已完成、待办', async () => {
    const store = useTaskStore()
    await store.addTask('任务1', 'medium', null)
    await store.addTask('任务2', 'medium', null)
    await store.addTask('任务3', 'medium', null)

    await store.toggleTask(store.tasks[0].id)

    expect(store.stats.total).toBe(3)
    expect(store.stats.completed).toBe(1)
    expect(store.stats.pending).toBe(2)
  })
})

describe('filteredTasks', () => {
  it('filter 为 all 时返回所有任务', async () => {
    const store = useTaskStore()
    await store.addTask('任务1', 'medium', null)
    await store.addTask('任务2', 'high', null)

    store.filter = 'all'

    expect(store.filteredTasks).toHaveLength(2)
  })

  it('按手动 order 排序', async () => {
    const store = useTaskStore()
    await store.addTask('第一个', 'low', null)
    await store.addTask('第二个', 'high', null)
    await store.addTask('第三个', 'medium', null)

    store.filter = 'all'

    expect(store.filteredTasks[0].title).toBe('第一个')
    expect(store.filteredTasks[1].title).toBe('第二个')
    expect(store.filteredTasks[2].title).toBe('第三个')
  })

  it('已完成任务排在未完成之后', async () => {
    const store = useTaskStore()
    await store.addTask('待办高', 'high', null)
    await store.addTask('已完成低', 'low', null)

    await store.toggleTask(store.tasks[1].id)
    store.filter = 'all'

    expect(store.filteredTasks[0].completed).toBe(false)
    expect(store.filteredTasks[1].completed).toBe(true)
  })

  it('filter 为 completed 时只返回已完成任务', async () => {
    const store = useTaskStore()
    await store.addTask('待办1', 'high', null)
    await store.addTask('已完成1', 'low', null)
    await store.addTask('待办2', 'medium', null)
    await store.addTask('已完成2', 'high', null)

    await store.toggleTask(store.tasks[1].id)
    await store.toggleTask(store.tasks[3].id)
    store.filter = 'completed'

    expect(store.filteredTasks).toHaveLength(2)
    expect(store.filteredTasks.every(t => t.completed)).toBe(true)
  })

  it('filter 为 completed 且无已完成任务时返回空数组', async () => {
    const store = useTaskStore()
    await store.addTask('待办', 'medium', null)

    store.filter = 'completed'

    expect(store.filteredTasks).toHaveLength(0)
  })
})

describe('saveTasks 数据一致性', () => {
  it('addTask → toggleTask → deleteTask 全流程数据正确', async () => {
    const store = useTaskStore()

    // 添加
    await store.addTask('全流程测试', 'high', '2026-07-01')
    const taskId = store.tasks[0].id

    // 验证保存的数据包含所有字段
    let savedData = mockSaveTasks.mock.calls[0][0]
    expect(savedData[0]).toMatchObject({
      id: taskId,
      title: '全流程测试',
      completed: false,
      priority: 'high',
    })
    expect(savedData[0].dueDate).toBeTruthy()

    // 切换完成
    await store.toggleTask(taskId)
    savedData = mockSaveTasks.mock.calls[1][0]
    expect(savedData[0].completed).toBe(true)

    // 删除
    await store.deleteTask(taskId)
    savedData = mockSaveTasks.mock.calls[2][0]
    expect(savedData).toHaveLength(0)
  })
})

// ============================================================
// order 字段
// ============================================================
describe('order 字段', () => {
  it('新任务带有 order 字段', async () => {
    const store = useTaskStore()
    await store.addTask('任务1', 'medium', null)

    expect(store.tasks[0].order).toBe(0)
  })

  it('多个任务的 order 递增', async () => {
    const store = useTaskStore()
    await store.addTask('任务1', 'medium', null)
    await store.addTask('任务2', 'medium', null)
    await store.addTask('任务3', 'medium', null)

    expect(store.tasks[0].order).toBe(0)
    expect(store.tasks[1].order).toBe(1)
    expect(store.tasks[2].order).toBe(2)
  })
})

// ============================================================
// updateTask
// ============================================================
describe('updateTask', () => {
  it('更新任务标题', async () => {
    const store = useTaskStore()
    await store.addTask('原标题', 'medium', null)
    const id = store.tasks[0].id

    await store.updateTask(id, { title: '新标题' })

    expect(store.tasks[0].title).toBe('新标题')
  })

  it('更新任务优先级', async () => {
    const store = useTaskStore()
    await store.addTask('任务', 'low', null)
    const id = store.tasks[0].id

    await store.updateTask(id, { priority: 'high' })

    expect(store.tasks[0].priority).toBe('high')
  })

  it('更新任务截止日期', async () => {
    const store = useTaskStore()
    await store.addTask('任务', 'medium', null)
    const id = store.tasks[0].id

    await store.updateTask(id, { dueDate: '2026-12-31T00:00:00.000Z' })

    expect(store.tasks[0].dueDate).toBe('2026-12-31T00:00:00.000Z')
  })

  it('更新后 updatedAt 被更新', async () => {
    const store = useTaskStore()
    await store.addTask('任务', 'medium', null)
    const id = store.tasks[0].id
    const originalUpdatedAt = store.tasks[0].updatedAt

    await new Promise(r => setTimeout(r, 10))
    await store.updateTask(id, { title: '新标题' })

    expect(store.tasks[0].updatedAt).not.toBe(originalUpdatedAt)
  })

  it('更新后调用 saveTasks 保存', async () => {
    const store = useTaskStore()
    await store.addTask('任务', 'medium', null)
    vi.clearAllMocks()

    await store.updateTask(store.tasks[0].id, { title: '新标题' })

    expect(mockSaveTasks).toHaveBeenCalledTimes(1)
  })

  it('更新不存在的 id 不会报错', async () => {
    const store = useTaskStore()
    await store.addTask('任务', 'medium', null)

    await expect(store.updateTask('non-existent', { title: '新' })).resolves.not.toThrow()
    expect(store.tasks[0].title).toBe('任务')
  })

  it('允许更新 dueTime、reminder、remindedAt', async () => {
    const store = useTaskStore()
    await store.addTask('提醒任务', 'medium', '2026-06-01', '09:00', null)
    const id = store.tasks[0].id

    await store.updateTask(id, {
      dueTime: '18:45',
      reminder: '30m',
      remindedAt: '2026-06-01T10:00:00.000Z'
    })

    expect(store.tasks[0].dueTime).toBe('18:45')
    expect(store.tasks[0].reminder).toBe('30m')
    expect(store.tasks[0].remindedAt).toBe('2026-06-01T10:00:00.000Z')
  })

  it('修改 dueDate 时清空 remindedAt', async () => {
    const store = useTaskStore()
    await store.addTask('提醒任务', 'medium', '2026-06-01', '09:00', '10m')
    const id = store.tasks[0].id
    await store.updateTask(id, { remindedAt: '2026-06-01T08:50:00.000Z' })

    await store.updateTask(id, { dueDate: '2026-06-02T00:00:00.000Z' })

    expect(store.tasks[0].remindedAt).toBeNull()
  })

  it('修改 dueTime 时清空 remindedAt', async () => {
    const store = useTaskStore()
    await store.addTask('提醒任务', 'medium', '2026-06-01', '09:00', '10m')
    const id = store.tasks[0].id
    await store.updateTask(id, { remindedAt: '2026-06-01T08:50:00.000Z' })

    await store.updateTask(id, { dueTime: '10:00' })

    expect(store.tasks[0].remindedAt).toBeNull()
  })

  it('修改 reminder 时清空 remindedAt', async () => {
    const store = useTaskStore()
    await store.addTask('提醒任务', 'medium', '2026-06-01', '09:00', '10m')
    const id = store.tasks[0].id
    await store.updateTask(id, { remindedAt: '2026-06-01T08:50:00.000Z' })

    await store.updateTask(id, { reminder: '30m' })

    expect(store.tasks[0].remindedAt).toBeNull()
  })

  it('清空 dueTime 时同时清空 reminder', async () => {
    const store = useTaskStore()
    await store.addTask('提醒任务', 'medium', '2026-06-01', '09:00', '10m')
    const id = store.tasks[0].id

    await store.updateTask(id, { dueTime: null })

    expect(store.tasks[0].dueTime).toBeNull()
    expect(store.tasks[0].reminder).toBeNull()
  })

  it('没有 dueTime 时不能设置非空 reminder', async () => {
    const store = useTaskStore()
    await store.addTask('无时间任务', 'medium', '2026-06-01', null, null)
    const id = store.tasks[0].id

    await store.updateTask(id, { reminder: '1h' })

    expect(store.tasks[0].dueTime).toBeNull()
    expect(store.tasks[0].reminder).toBeNull()
  })

  it('修改提醒字段时尊重显式传入的 remindedAt', async () => {
    const store = useTaskStore()
    await store.addTask('提醒任务', 'medium', '2026-06-01', '09:00', '10m')
    const id = store.tasks[0].id
    const explicitRemindedAt = '2026-06-01T09:30:00.000Z'

    await store.updateTask(id, { dueTime: '10:00', remindedAt: explicitRemindedAt })

    expect(store.tasks[0].remindedAt).toBe(explicitRemindedAt)
  })

  it('白名单外的字段不会被更新', async () => {
    const store = useTaskStore()
    await store.addTask('任务', 'medium', null)
    const id = store.tasks[0].id
    const originalCompleted = store.tasks[0].completed
    const originalOrder = store.tasks[0].order
    const originalCreatedAt = store.tasks[0].createdAt

    await store.updateTask(id, {
      title: '新标题',
      completed: true,
      order: 999,
      createdAt: '2000-01-01T00:00:00.000Z'
    })

    expect(store.tasks[0].title).toBe('新标题')
    expect(store.tasks[0].completed).toBe(originalCompleted)
    expect(store.tasks[0].order).toBe(originalOrder)
    expect(store.tasks[0].createdAt).toBe(originalCreatedAt)
  })
})

// ============================================================
// reorderTask
// ============================================================
describe('reorderTask', () => {
  it('移动任务到目标任务位置', async () => {
    const store = useTaskStore()
    await store.addTask('第一个', 'medium', null)
    await store.addTask('第二个', 'medium', null)
    await store.addTask('第三个', 'medium', null)

    const firstId = store.tasks[0].id
    const thirdId = store.tasks[2].id
    await store.reorderTask(firstId, thirdId) // 移到第三个位置

    expect(store.tasks[0].title).toBe('第二个')
    expect(store.tasks[1].title).toBe('第三个')
    expect(store.tasks[2].title).toBe('第一个')
  })

  it('重排后 order 字段被重新分配', async () => {
    const store = useTaskStore()
    await store.addTask('第一个', 'medium', null)
    await store.addTask('第二个', 'medium', null)
    await store.addTask('第三个', 'medium', null)

    const firstId = store.tasks[0].id
    const thirdId = store.tasks[2].id
    await store.reorderTask(firstId, thirdId)

    expect(store.tasks[0].order).toBe(0)
    expect(store.tasks[1].order).toBe(1)
    expect(store.tasks[2].order).toBe(2)
  })

  it('重排后调用 saveTasks 保存', async () => {
    const store = useTaskStore()
    await store.addTask('第一个', 'medium', null)
    await store.addTask('第二个', 'medium', null)
    vi.clearAllMocks()

    await store.reorderTask(store.tasks[0].id, store.tasks[1].id)

    expect(mockSaveTasks).toHaveBeenCalledTimes(1)
  })

  it('移动到相同位置不触发保存', async () => {
    const store = useTaskStore()
    await store.addTask('任务', 'medium', null)
    vi.clearAllMocks()

    await store.reorderTask(store.tasks[0].id, store.tasks[0].id)

    expect(mockSaveTasks).not.toHaveBeenCalled()
  })

  it('移动不存在的 id 不会报错', async () => {
    const store = useTaskStore()
    await store.addTask('任务', 'medium', null)

    await expect(store.reorderTask('non-existent', store.tasks[0].id)).resolves.not.toThrow()
  })

  it('目标任务不存在不会报错', async () => {
    const store = useTaskStore()
    await store.addTask('任务', 'medium', null)

    await expect(store.reorderTask(store.tasks[0].id, 'non-existent')).resolves.not.toThrow()
  })
})

// ============================================================
// loadTasks 数据迁移
// ============================================================
describe('loadTasks 数据迁移', () => {
  it('旧任务加载时自动补上 order 字段', async () => {
    const savedTasks = [
      { id: '1', title: '旧任务1', completed: false, priority: 'medium', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
      { id: '2', title: '旧任务2', completed: false, priority: 'high', dueDate: null, createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' }
    ]
    mockLoadTasks.mockResolvedValue(savedTasks)

    const store = useTaskStore()
    await store.loadTasks()

    expect(store.tasks[0].order).toBe(0)
    expect(store.tasks[1].order).toBe(1)
  })

  it('已有 order 字段的任务不被覆盖', async () => {
    const savedTasks = [
      { id: '1', title: '有order', completed: false, priority: 'medium', dueDate: null, order: 5, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }
    ]
    mockLoadTasks.mockResolvedValue(savedTasks)

    const store = useTaskStore()
    await store.loadTasks()

    expect(store.tasks[0].order).toBe(5)
  })
})

// ============================================================
// clearCompleted
// ============================================================
describe('clearCompleted', () => {
  it('删除所有已完成任务，保留未完成任务', async () => {
    const store = useTaskStore()
    await store.addTask('待办1', 'high', null)
    await store.addTask('已完成1', 'low', null)
    await store.addTask('待办2', 'medium', null)
    await store.addTask('已完成2', 'high', null)

    await store.toggleTask(store.tasks[1].id)
    await store.toggleTask(store.tasks[3].id)

    await store.clearCompleted()

    expect(store.tasks).toHaveLength(2)
    expect(store.tasks.every(t => !t.completed)).toBe(true)
  })

  it('清除后调用 saveTasks 保存', async () => {
    const store = useTaskStore()
    await store.addTask('待办', 'medium', null)
    await store.addTask('已完成', 'medium', null)
    await store.toggleTask(store.tasks[1].id)
    vi.clearAllMocks()

    await store.clearCompleted()

    expect(mockSaveTasks).toHaveBeenCalledTimes(1)
  })

  it('无已完成任务时调用安全', async () => {
    const store = useTaskStore()
    await store.addTask('待办', 'medium', null)
    vi.clearAllMocks()

    await store.clearCompleted()

    expect(store.tasks).toHaveLength(1)
    expect(mockSaveTasks).toHaveBeenCalledTimes(1)
  })

  it('所有任务已完成时清空列表', async () => {
    const store = useTaskStore()
    await store.addTask('任务1', 'medium', null)
    await store.addTask('任务2', 'medium', null)
    await store.toggleTask(store.tasks[0].id)
    await store.toggleTask(store.tasks[1].id)

    await store.clearCompleted()

    expect(store.tasks).toHaveLength(0)
  })

  it('清除后已完成计数保留到 completionLog', async () => {
    const store = useTaskStore()
    await store.addTask('任务1', 'medium', null)
    await store.addTask('任务2', 'medium', null)
    await store.toggleTask(store.tasks[0].id)
    await store.toggleTask(store.tasks[1].id)

    await store.clearCompleted()

    // completionLog 应包含今天的日期作为 key
    const today = new Date().toISOString().slice(0, 10)
    expect(store.completionLog[today]).toBe(2)
  })

  it('清除后调用 saveCompletionLog 保存日志', async () => {
    const store = useTaskStore()
    await store.addTask('待办', 'medium', null)
    await store.addTask('已完成', 'medium', null)
    await store.toggleTask(store.tasks[1].id)
    vi.clearAllMocks()

    await store.clearCompleted()

    expect(mockSaveCompletionLog).toHaveBeenCalledTimes(1)
  })

  it('多次清除同一日期的计数累加', async () => {
    const store = useTaskStore()
    // 第一次清除
    await store.addTask('任务1', 'medium', null)
    await store.toggleTask(store.tasks[0].id)
    await store.clearCompleted()

    // 第二次清除
    await store.addTask('任务2', 'medium', null)
    await store.addTask('任务3', 'medium', null)
    await store.toggleTask(store.tasks[0].id)
    await store.toggleTask(store.tasks[1].id)
    await store.clearCompleted()

    const today = new Date().toISOString().slice(0, 10)
    expect(store.completionLog[today]).toBe(3)
  })

  it('loadTasks 时同时加载 completionLog', async () => {
    const logData = { '2026-05-30': 5, '2026-06-01': 3 }
    mockLoadCompletionLog.mockResolvedValue(logData)

    const store = useTaskStore()
    await store.loadTasks()

    expect(store.completionLog).toEqual(logData)
  })

  it('已完成任务无 completedAt 时使用 updatedAt 兜底', async () => {
    const store = useTaskStore()
    await store.addTask('旧任务', 'medium', null)
    // 模拟旧数据：手动设置 completed 但没有 completedAt
    store.tasks[0].completed = true
    store.tasks[0].completedAt = null
    // updatedAt 由 addTask 设置，格式为 ISO
    const updatedAtDate = store.tasks[0].updatedAt.slice(0, 10)

    await store.clearCompleted()

    expect(store.completionLog[updatedAtDate]).toBe(1)
  })
})