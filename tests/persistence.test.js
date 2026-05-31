import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import fs from 'fs'
import path from 'path'

const TEST_DIR = path.join(process.cwd(), '.test-data')

describe('persistence', () => {
  let persistence

  beforeEach(async () => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true })
    }
    fs.mkdirSync(TEST_DIR, { recursive: true })

    const mod = await import('../electron/persistence.js')
    persistence = mod.default || mod
    persistence.init(TEST_DIR)
  })

  afterEach(() => {
    if (fs.existsSync(TEST_DIR)) {
      fs.rmSync(TEST_DIR, { recursive: true })
    }
  })

  // ============================================================
  // loadData
  // ============================================================
  describe('loadData', () => {
    it('文件不存在时返回空数组', () => {
      expect(persistence.loadData()).toEqual([])
    })

    it('文件内容无效 JSON 时返回空数组', () => {
      fs.writeFileSync(path.join(TEST_DIR, 'tasks.json'), '{invalid json')
      expect(persistence.loadData()).toEqual([])
    })

    it('文件为空时返回空数组', () => {
      fs.writeFileSync(path.join(TEST_DIR, 'tasks.json'), '')
      expect(persistence.loadData()).toEqual([])
    })

    it('文件内容是空数组时返回空数组', () => {
      fs.writeFileSync(path.join(TEST_DIR, 'tasks.json'), '[]')
      expect(persistence.loadData()).toEqual([])
    })

    it('正确读取单个任务', () => {
      const tasks = [
        { id: '1', title: '测试任务', completed: false, priority: 'medium', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }
      ]
      fs.writeFileSync(path.join(TEST_DIR, 'tasks.json'), JSON.stringify(tasks))

      const loaded = persistence.loadData()
      expect(loaded).toHaveLength(1)
      expect(loaded[0].title).toBe('测试任务')
    })

    it('正确读取多个任务', () => {
      const tasks = [
        { id: '1', title: '任务1', completed: false, priority: 'high', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' },
        { id: '2', title: '任务2', completed: true, priority: 'low', dueDate: '2026-06-01T00:00:00.000Z', createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-03T00:00:00.000Z' }
      ]
      fs.writeFileSync(path.join(TEST_DIR, 'tasks.json'), JSON.stringify(tasks))

      const loaded = persistence.loadData()
      expect(loaded).toHaveLength(2)
    })

    it('读取的数据保留所有字段', () => {
      const task = {
        id: 'abc-123',
        title: '完整字段',
        completed: true,
        priority: 'high',
        dueDate: '2026-07-15T00:00:00.000Z',
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-06-01T12:00:00.000Z'
      }
      fs.writeFileSync(path.join(TEST_DIR, 'tasks.json'), JSON.stringify([task]))

      const loaded = persistence.loadData()
      expect(loaded[0]).toEqual(task)
    })
  })

  // ============================================================
  // saveData
  // ============================================================
  describe('saveData', () => {
    it('保存后文件存在', () => {
      persistence.saveData([])
      expect(fs.existsSync(path.join(TEST_DIR, 'tasks.json'))).toBe(true)
    })

    it('保存空数组后文件内容为 []', () => {
      persistence.saveData([])
      const content = JSON.parse(fs.readFileSync(path.join(TEST_DIR, 'tasks.json'), 'utf-8'))
      expect(content).toEqual([])
    })

    it('保存单个任务后文件内容正确', () => {
      const tasks = [
        { id: '1', title: '保存测试', completed: false, priority: 'medium', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }
      ]
      persistence.saveData(tasks)

      const content = JSON.parse(fs.readFileSync(path.join(TEST_DIR, 'tasks.json'), 'utf-8'))
      expect(content).toHaveLength(1)
      expect(content[0].title).toBe('保存测试')
    })

    it('文件格式化为 2 空格缩进', () => {
      const tasks = [{ id: '1', title: '格式测试', completed: false, priority: 'medium', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }]
      persistence.saveData(tasks)

      const raw = fs.readFileSync(path.join(TEST_DIR, 'tasks.json'), 'utf-8')
      expect(raw).toContain('  ')
      expect(raw.split('\n').length).toBeGreaterThan(1)
    })

    it('覆盖已有文件内容', () => {
      persistence.saveData([{ id: '1', title: '旧数据', completed: false, priority: 'medium', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }])
      persistence.saveData([{ id: '2', title: '新数据', completed: true, priority: 'high', dueDate: null, createdAt: '2026-02-01T00:00:00.000Z', updatedAt: '2026-02-01T00:00:00.000Z' }])

      const content = JSON.parse(fs.readFileSync(path.join(TEST_DIR, 'tasks.json'), 'utf-8'))
      expect(content).toHaveLength(1)
      expect(content[0].title).toBe('新数据')
    })
  })

  // ============================================================
  // 读写一致性（round-trip）
  // ============================================================
  describe('读写一致性', () => {
    it('saveData → loadData 数据一致', () => {
      const tasks = [
        { id: '1', title: '一致性测试', completed: false, priority: 'high', dueDate: '2026-08-01T00:00:00.000Z', createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }
      ]
      persistence.saveData(tasks)
      const loaded = persistence.loadData()
      expect(loaded).toEqual(tasks)
    })

    it('多次 saveData → loadData 最终一致', () => {
      const batch1 = [
        { id: '1', title: '批次1', completed: false, priority: 'medium', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }
      ]
      const batch2 = [
        { id: '1', title: '批次1', completed: true, priority: 'medium', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' },
        { id: '2', title: '批次2', completed: false, priority: 'high', dueDate: null, createdAt: '2026-01-02T00:00:00.000Z', updatedAt: '2026-01-02T00:00:00.000Z' }
      ]

      persistence.saveData(batch1)
      persistence.saveData(batch2)
      const loaded = persistence.loadData()
      expect(loaded).toEqual(batch2)
    })

    it('特殊字符标题 round-trip 一致', () => {
      const tasks = [
        { id: '1', title: '特殊 "引号" <标签> &符号\n换行\t制表符', completed: false, priority: 'medium', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }
      ]
      persistence.saveData(tasks)
      const loaded = persistence.loadData()
      expect(loaded[0].title).toBe(tasks[0].title)
    })

    it('中文和 emoji 标题 round-trip 一致', () => {
      const tasks = [
        { id: '1', title: '完成报告 📝 买水果 🍎', completed: false, priority: 'medium', dueDate: null, createdAt: '2026-01-01T00:00:00.000Z', updatedAt: '2026-01-01T00:00:00.000Z' }
      ]
      persistence.saveData(tasks)
      const loaded = persistence.loadData()
      expect(loaded[0].title).toBe(tasks[0].title)
    })

    it('大量任务 round-trip 一致', () => {
      const tasks = Array.from({ length: 100 }, (_, i) => ({
        id: `id-${i}`,
        title: `任务 ${i}`,
        completed: i % 3 === 0,
        priority: ['high', 'medium', 'low'][i % 3],
        dueDate: i % 5 === 0 ? `2026-0${(i % 9) + 1}-01T00:00:00.000Z` : null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z'
      }))
      persistence.saveData(tasks)
      const loaded = persistence.loadData()
      expect(loaded).toHaveLength(100)
      expect(loaded).toEqual(tasks)
    })
  })

  // ============================================================
  // loadHabits / saveHabits
  // ============================================================
  describe('loadHabits / saveHabits', () => {
    it('文件不存在时返回默认结构', () => {
      const result = persistence.loadHabits()
      expect(result).toEqual({ habits: [], checkins: {} })
    })

    it('保存后读取数据一致', () => {
      const data = {
        habits: [{ id: 'h1', name: '阅读', icon: '📖', color: '#3B82F6', frequency: { type: 'daily' }, reminderTime: null, createdAt: '2026-01-01T00:00:00.000Z', order: 0 }],
        checkins: { h1: ['2026-05-30', '2026-05-31'] }
      }
      persistence.saveHabits(data)
      const loaded = persistence.loadHabits()
      expect(loaded).toEqual(data)
    })

    it('覆盖已有文件内容', () => {
      persistence.saveHabits({ habits: [{ id: 'old' }], checkins: {} })
      persistence.saveHabits({ habits: [], checkins: {} })
      expect(persistence.loadHabits()).toEqual({ habits: [], checkins: {} })
    })
  })

  // ============================================================
  // loadPomodoros / savePomodoros
  // ============================================================
  describe('loadPomodoros / savePomodoros', () => {
    it('文件不存在时返回空对象', () => {
      expect(persistence.loadPomodoros()).toEqual({})
    })

    it('保存后读取数据一致', () => {
      const data = { '2026-05-30': 5, '2026-05-31': 3 }
      persistence.savePomodoros(data)
      expect(persistence.loadPomodoros()).toEqual(data)
    })

    it('覆盖已有文件内容', () => {
      persistence.savePomodoros({ '2026-05-30': 5 })
      persistence.savePomodoros({ '2026-05-31': 2 })
      expect(persistence.loadPomodoros()).toEqual({ '2026-05-31': 2 })
    })

    it('特殊字符 round-trip 一致', () => {
      // 确保日期字符串作为 key 可以正确读写
      const data = { '2026-12-31': 10 }
      persistence.savePomodoros(data)
      expect(persistence.loadPomodoros()['2026-12-31']).toBe(10)
    })
  })
})