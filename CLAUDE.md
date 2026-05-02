# Electron + Vue 3 + TypeScript 最佳实践模板

## 项目概述

这是一个完整的 Electron 桌面应用开发模板，采用以下技术栈：

- **Electron 29** - 跨平台桌面应用框架
- **Vue 3** - 前端框架（Composition API）
- **TypeScript** - 类型安全
- **Vite 5** - 构建工具
- **Electron Forge** - 打包和分发

## 项目结构

```
├── src/
│   ├── main/                    # 主进程 (Node.js 环境)
│   │   ├── index.ts             # 应用入口
│   │   ├── window/              # 窗口管理
│   │   │   ├── MainWindow.ts    # 主窗口类
│   │   │   └── WindowManager.ts # 多窗口管理器
│   │   ├── ipc/                 # IPC 通信
│   │   │   ├── channels.ts      # 频道常量定义
│   │   │   └── handlers.ts      # 处理器注册
│   │   ├── tray/                # 系统托盘
│   │   ├── updater/             # 自动更新
│   │   ├── store/               # 数据存储 (electron-store)
│   │   ├── logger/              # 日志系统 (electron-log)
│   │   └── crash/               # 崩溃报告
│   ├── preload/                 # 预加载脚本 (桥接主进程和渲染进程)
│   │   └── index.ts
│   ├── renderer/                # 渲染进程 (浏览器环境)
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.ts          # Vue 应用入口
│   │       ├── App.vue          # 根组件
│   │       ├── router/          # 路由配置
│   │       ├── stores/          # Pinia 状态管理
│   │       ├── views/           # 页面组件
│   │       ├── components/      # 通用组件
│   │       ├── hooks/           # 组合式函数
│   │       ├── utils/           # 工具函数
│   │       └── styles/          # 样式文件
│   └── shared/                  # 共享代码（类型定义、常量）
│       ├── types.ts
│       └── constants.ts
├── resources/                   # 静态资源（图标等）
├── scripts/                     # 构建脚本
├── CLAUDE.md                    # 本文件
├── package.json
├── forge.config.ts              # Electron Forge 配置
├── vite.main.config.ts          # 主进程 Vite 配置
├── vite.preload.config.ts       # 预加载脚本 Vite 配置
├── vite.renderer.config.ts      # 渲染进程 Vite 配置
├── tsconfig.json                # TypeScript 基础配置
├── tsconfig.main.json           # 主进程 TS 配置
├── tsconfig.preload.json        # 预加载脚本 TS 配置
└── tsconfig.renderer.json       # 渲染进程 TS 配置
```

## 开发指南

### 启动开发服务器

```bash
npm install
npm run dev
```

### 构建和打包

```bash
# 打包应用
npm run build

# 创建安装包
npm run make
```

### 代码规范

```bash
# 检查代码规范
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format
```

## 开发哲学：MSVB 模式

本项目采用 **MSVB（Model → Service → View → Bridge）** 开发模式，为 Electron 桌面应用提供清晰的开发流程。

### 核心理念

```
数据层 → 服务层 → 视图层 → 桥接层
Model  → Service → View  → Bridge
```

### 四层架构

| 层级 | 职责 | 位置 | 说明 |
|------|------|------|------|
| **Model** | 数据定义与存储 | `src/shared/types.ts`<br>`src/main/store/` | 定义数据结构、类型、持久化方案 |
| **Service** | 业务逻辑 | `src/main/services/`<br>`src/main/ipc/handlers.ts` | 主进程中的业务处理、IPC 处理器 |
| **View** | 用户界面 | `src/renderer/src/views/`<br>`src/renderer/src/components/` | Vue 组件、页面、状态管理 |
| **Bridge** | 进程桥接 | `src/preload/index.ts`<br>`src/shared/constants.ts` | 连接主进程与渲染进程、频道定义 |

### 开发流程

添加新功能时，按以下顺序进行：

```
1. Model   → 定义数据类型和存储结构
2. Service → 实现业务逻辑，注册 IPC 处理器
3. View    → 创建页面和组件
4. Bridge  → 在 preload 中暴露 API
```

### 示例：添加"笔记"功能

**Step 1: Model（数据层）**
```typescript
// src/shared/types.ts
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}
```

**Step 2: Service（服务层）**
```typescript
// src/main/services/noteService.ts
export class NoteService {
  async getAll(): Promise<Note[]> { ... }
  async create(note: Note): Promise<void> { ... }
  async update(id: string, note: Partial<Note>): Promise<void> { ... }
  async delete(id: string): Promise<void> { ... }
}

// src/main/ipc/handlers.ts
ipcMain.handle('note:getAll', () => noteService.getAll());
ipcMain.handle('note:create', (_, note) => noteService.create(note));
```

**Step 3: View（视图层）**
```vue
<!-- src/renderer/src/views/NoteList.vue -->
<template>
  <div class="note-list">
    <NoteCard v-for="note in notes" :key="note.id" :note="note" />
  </div>
</template>
```

**Step 4: Bridge（桥接层）**
```typescript
// src/preload/index.ts
note: {
  getAll: () => ipcRenderer.invoke('note:getAll'),
  create: (note) => ipcRenderer.invoke('note:create', note),
}
```

### 与传统 Web 开发的对比

| MSVB (Electron) | MTV (Django) | 说明 |
|-----------------|--------------|------|
| Model | Model | 数据结构定义 |
| Service | View (业务逻辑) | 处理业务逻辑 |
| View | Template | 用户界面展示 |
| Bridge | URL 路由 | 请求路由和分发 |

### 设计原则

1. **单向依赖**：View → Bridge → Service → Model，禁止反向依赖
2. **类型安全**：所有 IPC 通信必须有 TypeScript 类型定义
3. **进程隔离**：渲染进程不直接访问 Node.js API，必须通过 Bridge
4. **职责分离**：Service 只处理业务逻辑，View 只负责展示

---

## 核心功能

### 1. IPC 通信

主进程和渲染进程通过 IPC 通信，类型定义在 `src/shared/types.ts`。

**渲染进程调用主进程：**

```typescript
const version = await window.electronAPI.app.getVersion();
```

**主进程处理：**

```typescript
ipcMain.handle('app:getVersion', () => app.getVersion());
```

### 2. 数据存储

使用 `electron-store` 进行持久化存储，配置在 `src/main/store/index.ts`。

```typescript
// 渲染进程
await window.electronAPI.store.set('key', value);
const value = await window.electronAPI.store.get('key');
```

### 3. 系统托盘

托盘配置在 `src/main/tray/index.ts`，支持：

- 自定义图标
- 右键菜单
- 双击显示窗口

### 4. 自动更新

使用 `electron-updater`，配置在 `src/main/updater/index.ts`。

```typescript
// 渲染进程监听更新事件
window.electronAPI.updater.onUpdateAvailable((info) => {
  console.log('发现新版本:', info.version);
});
```

### 5. 多窗口管理

通过 `WindowManager` 管理多个窗口：

```typescript
await window.electronAPI.window.create({
  name: '子窗口',
  title: '设置',
  width: 400,
  height: 300,
});
```

### 6. 日志系统

使用 `electron-log`，日志文件位于：

- Windows: `%USERPROFILE%/AppData/Roaming/electron-vue-app/logs/`
- macOS: `~/Library/Logs/electron-vue-app/`
- Linux: `~/.config/electron-vue-app/logs/`

## AI 智能体指引

### 添加新功能

1. **主进程功能**：在 `src/main/` 下创建模块
2. **IPC 通信**：
   - 在 `src/shared/constants.ts` 添加频道名称
   - 在 `src/shared/types.ts` 添加类型定义
   - 在 `src/preload/index.ts` 暴露 API
   - 在 `src/main/ipc/handlers.ts` 添加处理器
3. **渲染进程**：在 `src/renderer/src/` 下创建组件或页面

### 常用命令

- 添加依赖：`npm install <package>`
- 添加开发依赖：`npm install -D <package>`
- 运行测试：`npm test`（如已配置）

### 注意事项

1. 渲染进程不能直接访问 Node.js API，必须通过 IPC
2. 预加载脚本是安全的桥梁，使用 `contextBridge` 暴露 API
3. 所有 IPC 通信应有 TypeScript 类型定义
4. 敏感操作应在主进程处理

## 故障排查

### 依赖安装失败（网络问题）

**问题现象：** `npm install` 时报 `ECONNRESET` 或 `ETIMEDOUT` 错误，通常是 Electron 二进制下载失败。

**根本原因：** Electron 安装脚本会单独下载二进制文件（约 80MB），该下载不走 npm 代理设置，需要单独配置镜像源。

**解决方案（Windows）：**

```powershell
# 1. 开启代理（解决 npm 包下载，前提是已经预定义了此代理开启命令且代理服务正常运行）
proxy

# 2. 设置 Electron 国内镜像（解决 Electron 二进制下载）
$env:ELECTRON_MIRROR='https://npmmirror.com/mirrors/electron/'

# 3. 安装依赖
npm install
```

**其他镜像源（备选）：**

- 淘宝镜像：`https://npmmirror.com/mirrors/electron/`
- 官方镜像：`https://github.com/electron/electron/releases/download/`

**永久配置（可选）：**

在系统环境变量中添加：

```
ELECTRON_MIRROR=https://npmmirror.com/mirrors/electron/
```

### 其他常见问题

1. **应用无法启动**

   - 检查 Node.js 版本（推荐 18+）
   - 删除 `node_modules` 重新安装
2. **IPC 调用失败**

   - 检查频道名称是否一致
   - 检查预加载脚本是否正确暴露 API
3. **构建失败**

   - 检查 TypeScript 类型错误
   - 运行 `npm run lint` 检查代码规范

## 相关文档

- [Electron 文档](https://www.electronjs.org/docs)
- [Vue 3 文档](https://vuejs.org/guide/introduction.html)
- [Electron Forge 文档](https://www.electronforge.io/)
- [Vite 文档](https://vitejs.dev/)
