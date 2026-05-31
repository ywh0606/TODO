# 习惯追踪 & 番茄钟 功能设计

日期: 2026-05-31

## 概述

为现有桌面清单应用新增两个独立模块：**习惯追踪** 和 **番茄钟**。三个模块通过底部导航栏切换，各自拥有独立的 Store、数据文件和 IPC 通道。

## 需求决策

| 模块 | 决策 |
|------|------|
| 模块关系 | 习惯 & 番茄钟完全独立，互不关联 |
| 导航方式 | 底部导航栏（清单 / 习惯 / 番茄钟），窗口宽度不变 |
| 习惯周期 | 灵活：每天 / 每周X次 |
| 习惯字段 | 名称 + 周期 + 图标/颜色 + 提醒时间 |
| 习惯统计 | 连续打卡天数 + 总打卡次数 + 最近7天小方块 |
| 番茄钟模式 | 经典：25分钟工作 + 5分钟休息，每4个番茄15分钟长休息 |
| 番茄钟布局 | 居中大圆计时器 + 底部统计区域 |
| 番茄钟数据 | 今日番茄数 + 最近7天柱状图 |
| 番茄钟提醒 | 仅系统通知（Notification API），无声音 |
| 后台运行 | 最小化到托盘后计时器继续运行，到时弹出系统通知 |

## 架构设计

### 数据层

沿用现有 `electron/persistence.js` 模式，新增两个独立数据文件：

- `%APPDATA%/todo-app/tasks.json` — 已有，不动
- `%APPDATA%/todo-app/habits.json` — 习惯数据 + 打卡记录
- `%APPDATA%/todo-app/pomodoros.json` — 番茄钟每日历史

`persistence.js` 扩展为支持多文件读写：

```js
// 现有
init(userDataPath)           // DATA_FILE = path.join(userDataPath, 'tasks.json')

// 扩展为
init(userDataPath)
// 新增导出
loadHabits()                 // 读取 habits.json
saveHabits(habits)           // 写入 habits.json
loadPomodoros()              // 读取 pomodoros.json
savePomodoros(pomodoros)     // 写入 pomodoros.json
```

### IPC 通道

新增 4 个 handle，复用现有 `ipcMain.handle` 模式：

| 通道 | 方向 | 说明 |
|------|------|------|
| `load-habits` | renderer → main | 加载习惯数据 |
| `save-habits` | renderer → main | 保存习惯数据 |
| `load-pomodoros` | renderer → main | 加载番茄钟历史 |
| `save-pomodoros` | renderer → main | 保存番茄钟历史 |
| `pomodoro-start` | renderer → main | 主进程启动计时器 |
| `pomodoro-stop` | renderer → main | 主进程停止计时器 |
| `pomodoro-state` | main → renderer | 计时器状态同步（剩余时间、阶段） |

### Store 层

三个独立 Pinia Store（Composition API 风格）：

- `src/stores/taskStore.js` — 已有，不改动
- `src/stores/habitStore.js` — 新增
- `src/stores/pomodoroStore.js` — 新增

#### habitStore 数据模型

```js
{
  id: string,           // uuid
  name: string,         // 习惯名称
  icon: string,         // emoji 图标
  color: string,        // 颜色标识（hex）
  frequency: {
    type: 'daily' | 'weekly',
    timesPerWeek: number // 仅 weekly 类型，表示每周目标次数
  },
  reminderTime: string | null, // 'HH:mm' 格式，null 表示不提醒
  createdAt: string,    // ISO datetime
  order: number         // 排序
}

// 打卡记录单独存储在同一文件中
// checkins 对象以 habitId + 日期 为 key
checkins: {
  [habitId]: ['2026-05-30', '2026-05-31', ...]
}
```

#### pomodoroStore 数据模型

```js
// 运行时状态（不持久化，由主进程管理）
{
  status: 'idle' | 'work' | 'break' | 'long-break',
  remainingSeconds: number,
  currentRound: number,  // 当前是第几个番茄（1-4）
  totalToday: number      // 今日已完成
}

// 持久化：每日番茄数记录
// pomodoros.json
{
  '2026-05-30': 5,
  '2026-05-31': 3
}
```

### 番茄钟计时器架构

计时器运行在 **Electron 主进程**，通过 `setInterval` 每秒递减。原因：渲染进程在窗口隐藏时可能被系统限制或暂停。

流程：
1. 用户点击"开始" → 渲染进程发送 `pomodoro-start` IPC
2. 主进程启动计时器，每秒递减 `remainingSeconds`
3. 主进程每秒通过 `webContents.send('pomodoro-tick', state)` 同步状态到渲染进程
4. 计时结束 → 主进程触发 `new Notification()` 系统通知，发送 `pomodoro-complete` 到渲染进程
5. 自动切换到休息阶段（短休息/长休息），休息结束同样发通知
6. 渲染进程收到完成事件后调用 `savePomodoros` 持久化今日计数

### preload.js 扩展

```js
contextBridge.exposeInMainWorld('electronAPI', {
  // 现有
  loadTasks: () => ipcRenderer.invoke('load-tasks'),
  saveTasks: (tasks) => ipcRenderer.invoke('save-tasks', tasks),
  // 习惯
  loadHabits: () => ipcRenderer.invoke('load-habits'),
  saveHabits: (data) => ipcRenderer.invoke('save-habits', data),
  // 番茄钟
  loadPomodoros: () => ipcRenderer.invoke('load-pomodoros'),
  savePomodoros: (data) => ipcRenderer.invoke('save-pomodoros', data),
  pomodoroStart: () => ipcRenderer.invoke('pomodoro-start'),
  pomodoroStop: () => ipcRenderer.invoke('pomodoro-stop'),
  onPomodoroTick: (cb) => ipcRenderer.on('pomodoro-tick', (_, state) => cb(state)),
  onPomodoroComplete: (cb) => ipcRenderer.on('pomodoro-complete', (_, info) => cb(info))
})
```

### 组件层

```
src/
├── App.vue                    # 修改：加入 NavBar，切换视图
├── components/
│   ├── NavBar.vue             # 新增：底部导航栏
│   ├── TaskInput.vue          # 不动
│   ├── TaskItem.vue           # 不动
│   ├── TaskList.vue           # 不动
│   ├── FilterBar.vue          # 不动
│   ├── habit/
│   │   ├── HabitInput.vue     # 新增：创建/编辑习惯表单
│   │   ├── HabitItem.vue      # 新增：单个习惯卡片（含打卡按钮、7天方块）
│   │   └── HabitList.vue      # 新增：习惯列表
│   └── pomodoro/
│       ├── TimerCircle.vue    # 新增：圆形倒计时组件
│       ├── TimerControls.vue  # 新增：开始/暂停/重置按钮
│       └── WeeklyChart.vue    # 新增：7天柱状图
├── views/
│   ├── TasksView.vue          # 新增：包裹现有清单组件
│   ├── HabitsView.vue         # 新增：习惯页面
│   └── PomodoroView.vue       # 新增：番茄钟页面
└── stores/
    ├── taskStore.js           # 不动
    ├── habitStore.js          # 新增
    └── pomodoroStore.js       # 新增
```

### App.vue 改造

现有 `App.vue` 的 header + TaskInput + FilterBar + TaskList 包裹到 `TasksView.vue` 中。`App.vue` 变为：

```vue
<template>
  <div class="app">
    <component :is="currentView" />
    <NavBar />
  </div>
</template>
```

通过 NavBar 切换 `currentView` 在 TasksView / HabitsView / PomodoroView 之间。

### 页面样式一致性

- 所有页面共用 `src/style.css` 中的 CSS 变量和全局样式
- 番茄钟使用红色系（`--color-danger: #EF4444`），休息用绿色系（`--color-success: #10B981`）
- 习惯卡片复用 TaskItem 的卡片风格（白色背景、圆角、边框、阴影）

### 习惯打卡逻辑

- **每日习惯**：每天最多打卡1次，打卡记录按 `YYYY-MM-DD` 日期存储
- **每周习惯**：每周目标打卡 X 次，统计本周已完成次数，每周一重置
- **连续天数计算**：从今天往回数连续有打卡记录的天数
- **最近7天方块**：7个小方块，已打卡为习惯颜色，未打卡为灰色

### 提醒时间

习惯的提醒时间通过 Electron 主进程的 `setTimeout` 实现。应用启动时检查所有习惯的提醒时间，设定定时器。到时间弹出系统通知。应用生命周期内新增/修改习惯时更新定时器。

## 测试计划

- `tests/habitStore.test.js` — 习惯 CRUD、打卡逻辑、连续天数计算、周期统计
- `tests/pomodoroStore.test.js` — 计时状态管理、自动切换阶段、今日计数
- `tests/persistence.test.js` — 扩展：测试 habits.json 和 pomodoros.json 的读写
- 现有 `tests/taskStore.test.js` 不动
