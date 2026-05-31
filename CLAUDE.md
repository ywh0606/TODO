# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A desktop TODO app built with Electron + Vue 3 + Pinia. Chinese-language UI (简洁好用的桌面清单工具). Windows-only, packaged as NSIS installer via electron-builder.

## Commands

```bash
npm run dev          # Start Vite dev server + Electron (requires bash)
npm run build        # Build frontend only (vite build → dist/)
npm run electron:build  # Build frontend + package as Windows installer
npm test             # Run all tests once (vitest run)
npm run test:watch   # Run tests in watch mode
```

Running a single test file:
```bash
npx vitest run tests/taskStore.test.js
```

## Architecture

### Electron ↔ Renderer Communication

The app uses Electron's `contextIsolation: true` + `preload.js` pattern. The renderer (Vue) communicates with the main process exclusively through `window.electronAPI`, exposed via `contextBridge`:

- `window.electronAPI.loadTasks()` → `ipcRenderer.invoke('load-tasks')` → `persistence.loadData()`
- `window.electronAPI.saveTasks(tasks)` → `ipcRenderer.invoke('save-tasks', tasks)` → `persistence.saveData(tasks)`

The store ([src/stores/taskStore.js](src/stores/taskStore.js)) gracefully handles the absence of `window.electronAPI` (e.g., in browser-only or test environments) by skipping IPC calls.

### Data Persistence

Task data is stored as JSON at `%APPDATA%/todo-app/tasks.json`. The persistence layer ([electron/persistence.js](electron/persistence.js)) is a plain Node.js module (CommonJS) using synchronous `fs` reads/writes. It must be initialized with `init(userDataPath)` before use.

### State Management

Single Pinia store ([src/stores/taskStore.js](src/stores/taskStore.js)) using Composition API style (`defineStore` with setup function). All mutations (add, toggle, delete, update, reorder, clearCompleted) automatically persist via `saveTasks()`. The store serializes reactive data through `JSON.parse(JSON.stringify(...))` before sending to Electron to strip Vue Proxy wrappers.

### Key Design Details

- **Drag reorder**: Only the drag handle (⋮⋮) activates `draggable` — mousedown on the handle sets `isDraggable=true`, mouseup resets it. Drop events bubble up from `TaskItem` to `TaskList` which calls `store.reorderTask()`.
- **Inline editing**: Clicking a task's content area enters edit mode. `saveEdit` uses a 150ms `setTimeout` + `document.activeElement` check to avoid saving when focus moves between edit fields within the same item.
- **Update whitelist**: `updateTask()` only allows `title`, `priority`, `dueDate` fields — all other properties are silently ignored.
- **Data migration**: On `loadTasks()`, tasks missing an `order` field get one assigned by array index.
- **System tray**: Closing the window hides it to tray instead of quitting. Only the tray context menu "退出" actually quits the app.

### Testing

Tests use **vitest** with **happy-dom** (specified per-file via `// @vitest-environment happy-dom` comment, not a config file). There is no vitest.config.* — it uses defaults.

- [tests/taskStore.test.js](tests/taskStore.test.js) — Store logic tests with mocked `window.electronAPI`
- [tests/persistence.test.js](tests/persistence.test.js) — File I/O tests using a temp `.test-data/` directory
- [tests/TaskListTransition.test.js](tests/TaskListTransition.test.js) — CSS rule validation + filter transition logic

Tests mock `window.electronAPI` via `vi.fn()` in `beforeEach`. When testing the store, always `setActivePinia(createPinia())` first.

## Build & Package

- [vite.config.js](vite.config.js): `base: './'` for relative asset paths in Electron
- [electron-builder.json5](electron-builder.json5): NSIS target, x64, output to `release/`
- Build artifacts: `dist/` (Vite output), `release/` (Electron installer)
- The `todo-app/` directory is a legacy copy — the active source lives at the repo root
