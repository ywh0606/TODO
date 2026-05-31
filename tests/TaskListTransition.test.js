// @vitest-environment happy-dom
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTaskStore } from '../src/stores/taskStore'
import dayjs from 'dayjs'
import fs from 'fs'
import path from 'path'

// 读取 TaskList.vue 的源码以验证 CSS 规则
const taskListSource = fs.readFileSync(
  path.resolve(__dirname, '../src/components/TaskList.vue'),
  'utf-8'
)

beforeEach(() => {
  setActivePinia(createPinia())
  window.electronAPI = {
    saveTasks: vi.fn().mockResolvedValue({ success: true }),
    loadTasks: vi.fn().mockResolvedValue([])
  }
})

async function setupTasks(store) {
  const today = dayjs().toISOString()
  const future = dayjs().add(3, 'day').toISOString()

  await store.addTask('全部任务1', 'medium', null)
  await store.addTask('全部任务2', 'medium', null)
  await store.addTask('今天任务', 'medium', today)
  await store.addTask('即将到来任务', 'medium', future)
}

describe('视图切换过渡 - CSS 规则验证', () => {
  it('.task-leave-active 应包含 position: absolute 以脱离文档流', () => {
    // 匹配 .task-leave-active { ... position: absolute ... }
    const regex = /\.task-leave-active\s*\{[^}]*position\s*:\s*absolute[^}]*\}/
    expect(taskListSource).toMatch(regex)
  })

  it('.task-list 应包含 position: relative 作为绝对定位参照', () => {
    const regex = /\.task-list\s*\{[^}]*position\s*:\s*relative[^}]*\}/
    expect(taskListSource).toMatch(regex)
  })

  it('.task-leave-active 应包含 transition 属性', () => {
    const regex = /\.task-leave-active\s*\{[^}]*transition[^}]*\}/
    expect(taskListSource).toMatch(regex)
  })
})

describe('视图切换过渡 - filteredTasks 过滤逻辑', () => {
  it('从全部切换到今天时，任务数量减少', async () => {
    const store = useTaskStore()
    await setupTasks(store)

    store.filter = 'all'
    expect(store.filteredTasks).toHaveLength(4)

    store.filter = 'today'
    expect(store.filteredTasks).toHaveLength(1)
  })

  it('从今天切换到即将到来时，任务数量正确', async () => {
    const store = useTaskStore()
    await setupTasks(store)

    store.filter = 'today'
    expect(store.filteredTasks).toHaveLength(1)

    store.filter = 'upcoming'
    expect(store.filteredTasks).toHaveLength(1)
  })

  it('从即将到来切换到全部时，任务数量增加', async () => {
    const store = useTaskStore()
    await setupTasks(store)

    store.filter = 'upcoming'
    expect(store.filteredTasks).toHaveLength(1)

    store.filter = 'all'
    expect(store.filteredTasks).toHaveLength(4)
  })

  it('连续切换多次，filteredTasks 始终正确', async () => {
    const store = useTaskStore()
    await setupTasks(store)

    store.filter = 'all'
    expect(store.filteredTasks).toHaveLength(4)

    store.filter = 'today'
    expect(store.filteredTasks).toHaveLength(1)

    store.filter = 'upcoming'
    expect(store.filteredTasks).toHaveLength(1)

    store.filter = 'all'
    expect(store.filteredTasks).toHaveLength(4)

    store.filter = 'today'
    expect(store.filteredTasks).toHaveLength(1)
  })
})
