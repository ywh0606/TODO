# Todo App

简洁好用的桌面清单工具，参考滴答清单设计风格。

![Platform](https://img.shields.io/badge/platform-Windows-blue)
![Electron](https://img.shields.io/badge/electron-28-9feaf9)
![Vue](https://img.shields.io/badge/vue-3-42b883)

## 功能特性

- ✅ **任务管理** - 添加、完成、删除任务
- 🎯 **优先级设置** - 高/中/低三级优先级，带颜色标识
- 📅 **截止日期** - 设置任务截止时间，支持相对时间显示（今天、明天、已过期）
- 🔍 **过滤视图** - 全部 / 今天 / 即将到来
- 💾 **数据持久化** - 本地JSON文件存储，数据不丢失
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
cd TODO/todo-app

# 安装依赖
npm install

# 开发模式运行
npm run dev

# 打包构建
npm run electron:build
```

## 使用说明

### 添加任务
1. 在顶部输入框输入任务标题
2. 选择优先级（高/中/低）
3. 可选：设置截止日期
4. 点击"添加"按钮或按回车键

### 管理任务
- **完成任务** - 点击任务左侧的复选框
- **删除任务** - 点击任务右侧的删除按钮
- **筛选任务** - 使用顶部的过滤按钮切换视图

### 优先级颜色
- 🔴 **高优先级** - 红色标签
- 🟡 **中优先级** - 橙色标签
- 🟢 **低优先级** - 绿色标签

## 技术栈

| 技术 | 用途 |
|------|------|
| [Electron](https://www.electronjs.org/) | 桌面应用框架 |
| [Vue 3](https://vuejs.org/) | 前端UI框架 |
| [Pinia](https://pinia.vuejs.org/) | 状态管理 |
| [Vite](https://vitejs.dev/) | 构建工具 |
| [dayjs](https://day.js.org/) | 日期处理 |
| [electron-builder](https://www.electron.build/) | 应用打包 |

## 项目结构

```
todo-app/
├── electron/
│   ├── main.js          # Electron主进程
│   └── preload.js       # 预加载脚本
├── src/
│   ├── components/
│   │   ├── TaskInput.vue    # 任务输入组件
│   │   ├── TaskItem.vue     # 任务项组件
│   │   ├── TaskList.vue     # 任务列表组件
│   │   └── FilterBar.vue    # 过滤栏组件
│   ├── stores/
│   │   └── taskStore.js     # Pinia状态管理
│   ├── App.vue              # 根组件
│   └── main.js              # Vue入口
├── package.json
├── vite.config.js
└── electron-builder.json5   # 打包配置
```

## 数据存储

任务数据保存在用户目录下：

```
Windows: %APPDATA%/todo-app/tasks.json
```

## 开发

```bash
# 开发模式（同时启动Vite和Electron）
npm run dev

# 仅构建前端
npm run build

# 打包为可执行文件
npm run electron:build
```

## 许可证

MIT License

## 作者

[ywh0606](https://github.com/ywh0606)

## 致谢

- 设计参考 [滴答清单](https://dida365.com/)
- 图标来自 [Iconify](https://iconify.design/)
