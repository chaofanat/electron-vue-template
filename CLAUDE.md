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
│   ├── main/                    # 主进程 (Node.js)
│   │   ├── index.ts             # 应用入口
│   │   ├── squirrel.ts          # Squirrel 安装事件处理
│   │   ├── workers/             # Worker 线程
│   │   ├── window/              # MainWindow.ts + WindowManager.ts
│   │   ├── ipc/                 # channels.ts + handlers.ts
│   │   ├── menu/                # 应用菜单
│   │   ├── tray/                # 系统托盘
│   │   ├── updater/             # 自动更新
│   │   ├── store/               # electron-store 持久化
│   │   ├── logger/              # electron-log 日志
│   │   └── crash/               # 崩溃报告
│   ├── preload/                 # 预加载脚本（Bridge 层）
│   │   └── index.ts
│   ├── renderer/                # 渲染进程 (Vue 3)
│   │   ├── index.html
│   │   └── src/
│   │       ├── main.ts          # Vue 入口
│   │       ├── App.vue
│   │       ├── env.d.ts         # .vue 类型声明
│   │       ├── router/          # 路由
│   │       ├── views/           # 页面
│   │       ├── composables/     # 组合式函数
│   │       ├── components/      # 组件
│   │       └── styles/          # 样式
│   └── shared/                  # 共享类型和常量
├── resources/                   # 静态资源
├── forge.config.ts              # Electron Forge 配置
├── vite.*.config.ts             # Vite 配置 (main/preload/renderer)
└── tsconfig.*.json              # TypeScript 配置
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

1. **Model** → `src/shared/types.ts` 定义数据类型 + `src/main/store/` 定义存储
2. **Service** → `src/main/ipc/handlers.ts` 注册 IPC 处理器
3. **View** → `src/renderer/src/views/` 创建页面组件
4. **Bridge** → `src/preload/index.ts` 暴露 API + `src/shared/constants.ts` 定义频道

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
5. **electron-store 是默认导出**：`import Store from 'electron-store'`（非 `import { Store }`）；类型引用为 `import type Store from 'electron-store'`

## 故障排查

- **依赖安装失败**：Electron 二进制下载不走 npm 代理，需设置 `$env:ELECTRON_MIRROR='https://npmmirror.com/mirrors/electron/'`（详见 README）
- **IPC 调用失败**：检查频道名称一致性和预加载脚本 API 暴露
- **构建失败**：运行 `npm run lint` 检查，TypeScript 配置已移除 `references`，各子配置独立运行

---

## 原生模块打包指南

当你安装包含 `.node` 原生二进制文件的 npm 包时（如 `better-sqlite3`、`sqlite-vec`、`sharp` 等），需要额外配置：

### 1. 在 `vite.main.config.ts` 中外部化该模块

```typescript
external: [
  'electron',
  ...nodeBuiltins,
  'better-sqlite3',  // 添加你的原生模块
],
```

**只有包含 .node 二进制文件的原生模块需要外部化。** 纯 JS 包（如 lodash、axios）应该让 Vite 打包，以获得 tree-shaking 优化。

### 2. 打包机制

模板已内置原生模块打包支持：

- `forge.config.ts` 中的 `postPackage` hook 自动扫描 `node_modules` 中的 `.node` 文件
- 将原生模块整个包目录复制到 `<buildOutput>/resources/node_modules/`
- `src/main/index.ts` 在打包环境下自动设置 `NODE_PATH` 指向 `resources/node_modules`

### 3. 打包后验证

运行 `npm run build` 后，检查 `out/` 目录：

- 原生模块应出现在 `resources/node_modules/` 下
- 务必运行一次打包产物，确认原生模块加载正常

### 4. 故障排查

- 运行时报 `Cannot find module 'xxx'`：检查 `vite.main.config.ts` 的 `external` 列表是否包含该模块
- Vite 构建报错：确认该模块已在 `external` 列表中
- `.node` 文件未被复制：检查 `forge.config.ts` 的 `postPackage` hook 日志

## Worker 线程

项目支持 Worker 线程用于 CPU 密集型任务。参见 `src/main/workers/example-worker.ts`。

### 使用步骤

1. 在 `src/main/workers/` 下创建 worker 文件
2. 在 `forge.config.ts` 的 VitePlugin build 数组中取消注释 worker entry（或添加新 entry）
3. 如需自定义配置，创建对应的 `vite.worker.config.ts`

### 注意事项

- Worker 文件必须作为独立 entry 注册在 `forge.config.ts` 中，不能被主进程 bundle 引入
- Worker 中的原生模块同样需要在 `vite.worker.config.ts` 的 `external` 中声明
