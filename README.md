# Todo App

简洁好用的桌面清单工具，参考滴答清单设计风格。

![Platform](https://img.shields.io/badge/platform-Windows-blue)
![Electron](https://img.shields.io/badge/electron-28-9feaf9)
![Vue](https://img.shields.io/badge/vue-3-42b883)
![Version](https://img.shields.io/badge/version-1.4.0-orange)

## 功能特性

### 📋 任务管理

- ✅ **添加、完成、删除任务** - 支持内联编辑、拖拽排序
- 🎯 **优先级设置** - 高/中/低三级优先级，带颜色标识
- 📅 **截止日期与时间** - 支持设置具体截止时间，相对时间显示（今天、明天、已逾期）
- 🔍 **过滤视图** - 全部 / 今天 / 即将到来
- 🔔 **任务提醒** - 支持准时提醒、提前 5 分钟 / 30 分钟 / 1 小时 / 1 天提醒，系统通知推送

### ✅ 习惯追踪

- 📊 **习惯打卡** - 创建每日习惯，打卡追踪完成情况
- 🔥 **连续天数** - 自动统计打卡连续天数（streak）
- ⏰ **习惯提醒** - 支持设置提醒时间，系统通知推送

### 🍅 番茄钟

- ⏱️ **专注计时** - 25分钟专注 + 5分钟休息，4轮后长休息
- 📈 **周报统计** - 图表展示每日专注完成数
- 🔔 **完成提醒** - 专注/休息结束时系统通知

### 📊 统计面板

- 📋 **任务完成趋势** - 7天/30天任务完成数折线图
- ✅ **习惯打卡率** - 每日打卡完成百分比统计
- 🍅 **番茄钟趋势** - 专注数量趋势与累计统计
- 💡 **今日概览** - 任务完成数、待办数、打卡率一目了然

### 🐱 桌面宠物

- 🥚 **成长系统** - 蛋 → 小奶猫 → 少年猫 → 成年猫 → 传说猫
- 🎮 **互动玩法** - 每日摸摸、喂零食，影响心情与饱食度
- ⭐ **经验奖励** - 完成任务、打卡习惯、番茄专注均可获得经验值
- 📉 **状态衰减** - 饱食度与心情随时间自然下降

### 🔧 其他

- 💾 **数据持久化** - 本地JSON文件存储，数据不丢失
- 🔄 **自动更新** - 应用内检测新版本，一键下载安装
- 📌 **系统托盘** - 关闭窗口最小化到托盘，不打扰工作
- 🎨 **简洁界面** - 白色背景 + 橙色主题，清新舒适

## 安装方式

### 方式一：下载安装包（推荐）

1. 前往 [Releases](https://github.com/ywh0606/TODO/releases) 页面
2. 下载最新版本的 `Todo App Setup x.x.x.exe`
3. 双击运行安装程序
4. 按照向导完成安装
5. 桌面会自动创建快捷方式

### 方式二：从源码运行

```bash
# 克隆项目
git clone https://github.com/ywh0606/TODO.git
cd TODO

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 打包构建
npm run electron:build
```

## 使用说明

### 任务管理

1. 在顶部输入框输入任务标题
2. 选择优先级（高/中/低），可选设置截止日期与时间
3. 可设置提醒时间（准时/提前5分钟/30分钟/1小时/1天）
4. 点击"添加"按钮或按回车键
5. 拖拽任务左侧的 ⋮⋮ 手柄可调整顺序

### 习惯追踪

1. 切换到「习惯」标签页，输入习惯名称和图标
2. 每日打卡完成习惯，连续打卡获得经验加成
3. 可设置提醒时间，到时自动推送桌面通知

### 番茄钟

1. 切换到「番茄钟」标签页，点击开始专注
2. 专注期间计时器显示剩余时间，不可中断
3. 专注结束后自动进入休息，周报图表记录历史

### 统计面板

1. 切换到「统计」标签页，查看整体数据概览
2. 可切换 7 天 / 30 天时间范围
3. 任务完成、习惯打卡率、番茄钟趋势三合一图表展示

### 桌面宠物

1. 切换到「伙伴」标签页，查看你的宠物状态
2. 每日可摸摸、喂零食各3次
3. 完成任务、打卡习惯、番茄专注均可为宠物增加经验
4. 宠物随等级提升进化，解锁新的外观

### 优先级颜色

- 🔴 **高优先级** - 红色标签
- 🟡 **中优先级** - 橙色标签
- 🟢 **低优先级** - 绿色标签

## 技术栈

| 技术 | 用途 |
| --- | --- |
| [Electron](https://www.electronjs.org/) | 桌面应用框架 |
| [Vue 3](https://vuejs.org/) | 前端UI框架 |
| [Pinia](https://pinia.vuejs.org/) | 状态管理 |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [Chart.js](https://www.chartjs.org/) | 统计图表绘制 |
| [dayjs](https://day.js.org/) | 日期处理 |
| [electron-builder](https://www.electron.build/) | 应用打包 |
| [electron-updater](https://www.electron.build/auto-update) | 自动更新 |

## 项目结构

```text
├── electron/
│   ├── main.js              # Electron 主进程（窗口、托盘、IPC、番茄计时器、任务提醒）
│   ├── preload.js           # 预加载脚本（contextBridge API）
│   ├── persistence.js       # 数据持久化（JSON 文件读写）
│   └── taskReminders.js     # 任务提醒调度与通知
├── src/
│   ├── components/
│   │   ├── FilterBar.vue        # 任务过滤栏
│   │   ├── NavBar.vue           # 底部导航栏
│   │   ├── TaskInput.vue        # 任务输入组件
│   │   ├── TaskItem.vue         # 任务项组件
│   │   ├── TaskList.vue         # 任务列表组件
│   │   ├── UpdateBanner.vue     # 应用更新横幅
│   │   ├── habit/
│   │   │   ├── HabitInput.vue   # 习惯输入
│   │   │   ├── HabitItem.vue    # 习惯项
│   │   │   └── HabitList.vue    # 习惯列表
│   │   ├── pet/
│   │   │   ├── PetInteraction.vue  # 宠物互动按钮
│   │   │   ├── PixelCat.vue        # 像素猫咪渲染
│   │   │   └── petPixelData.js     # 像素色彩数据
│   │   ├── pomodoro/
│   │   │   ├── TimerCircle.vue    # 计时器圆环
│   │   │   ├── TimerControls.vue  # 计时控制按钮
│   │   │   └── WeeklyChart.vue    # 周报统计图表
│   │   └── stats/
│   │       ├── StatsCard.vue          # 统计卡片容器
│   │       ├── TaskCompletionChart.vue # 任务完成趋势图
│   │       ├── HabitCheckinChart.vue   # 习惯打卡率图
│   │       └── PomodoroTrendChart.vue  # 番茄钟趋势图
│   ├── stores/
│   │   ├── taskStore.js      # 任务状态管理
│   │   ├── habitStore.js     # 习惯状态管理
│   │   ├── pomodoroStore.js  # 番茄钟状态管理
│   │   ├── petStore.js       # 宠物状态管理
│   │   └── statsStore.js     # 统计数据聚合
│   ├── utils/
│   │   └── taskDisplay.js    # 任务日期/提醒显示格式化
│   ├── views/
│   │   ├── TasksView.vue     # 任务页面
│   │   ├── HabitsView.vue    # 习惯页面
│   │   ├── PomodoroView.vue  # 番茄钟页面
│   │   ├── StatsView.vue     # 统计页面
│   │   └── PetView.vue       # 宠物页面
│   ├── App.vue               # 根组件
│   ├── main.js               # Vue 入口
│   └── style.css             # 全局样式
├── tests/                        # 测试用例
├── package.json
├── vite.config.js
└── electron-builder.json5        # 打包配置
```

## 数据存储

所有数据保存在用户目录下：

```text
Windows: %APPDATA%/todo-app/
├── tasks.json            # 任务数据
├── habits.json           # 习惯数据
├── pomodoros.json        # 番茄钟记录
├── pet.json              # 宠物数据
└── completion-log.json   # 任务完成历史日志（清理后保留统计）
```

## 开发

```bash
# 开发模式（同时启动Vite和Electron）
npm run dev

# 仅构建前端
npm run build

# 打包为可执行文件
npm run electron:build

# 运行测试
npm test

# 运行测试（监听模式）
npm run test:watch
```

## 许可证

MIT License

## 作者

[ywh0606](https://github.com/ywh0606)

## 致谢

- 设计参考 [滴答清单](https://dida365.com/)
