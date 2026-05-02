# Electron Vue Template

基于 Electron + Vue 3 + TypeScript 的桌面应用最佳实践模板。

## 技术栈

- **Electron 29** - 跨平台桌面应用框架
- **Vue 3** - 前端框架（Composition API）
- **TypeScript** - 类型安全
- **Vite 5** - 构建工具
- **Electron Forge** - 打包和分发
- **Pinia** - 状态管理
- **Vue Router** - 路由管理

## 特性

- 完整的 MSVB 架构（Model → Service → View → Bridge）
- 系统托盘支持
- 自动更新（electron-updater）
- 数据持久化（electron-store）
- 日志系统（electron-log）
- 崩溃报告
- 多窗口管理
- 浅色/深色主题切换
- 中文菜单栏
- ESLint + Prettier 代码规范
- 完整的 TypeScript 类型定义

## 快速开始

### 使用模板创建新项目

**方式一：GitHub CLI**

```bash
gh repo create my-app --template chaofanat/electron-vue-template
cd my-app
npm install
npm run dev
```

**方式二：GitHub 网页**

1. 点击页面顶部的 "Use this template" 按钮
2. 选择 "Create a new repository"
3. 克隆新仓库到本地

```bash
git clone https://github.com/your-username/my-app.git
cd my-app
npm install
npm run dev
```

### 网络问题处理

如果 `npm install` 时遇到网络问题（Electron 下载失败）：

```bash
# Windows
$env:ELECTRON_MIRROR='https://npmmirror.com/mirrors/electron/'
npm install

# macOS / Linux
export ELECTRON_MIRROR='https://npmmirror.com/mirrors/electron/'
npm install
```

## 开发指南

### 启动开发服务器

```bash
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

## 项目结构

```
├── src/
│   ├── main/                    # 主进程 (Node.js 环境)
│   │   ├── index.ts             # 应用入口
│   │   ├── window/              # 窗口管理
│   │   ├── ipc/                 # IPC 通信
│   │   ├── tray/                # 系统托盘
│   │   ├── updater/             # 自动更新
│   │   ├── store/               # 数据存储
│   │   ├── logger/              # 日志系统
│   │   └── crash/               # 崩溃报告
│   ├── preload/                 # 预加载脚本
│   │   └── index.ts
│   ├── renderer/                # 渲染进程 (Vue 3)
│   │   └── src/
│   │       ├── App.vue          # 根组件
│   │       ├── router/          # 路由配置
│   │       ├── views/           # 页面组件
│   │       ├── components/      # 通用组件
│   │       └── styles/          # 样式文件
│   └── shared/                  # 共享代码
│       ├── types.ts             # 类型定义
│       └── constants.ts         # 常量定义
├── resources/                   # 静态资源
├── CLAUDE.md                    # 开发文档
└── package.json
```

## 开发哲学：MSVB 模式

本项目采用 MSVB（Model → Service → View → Bridge）开发模式：

```
数据层 → 服务层 → 视图层 → 桥接层
Model  → Service → View  → Bridge
```

### 开发流程

添加新功能时，按以下顺序进行：

1. **Model** - 定义数据类型和存储结构
2. **Service** - 实现业务逻辑，注册 IPC 处理器
3. **View** - 创建页面和组件
4. **Bridge** - 在 preload 中暴露 API

详细说明请参考 [CLAUDE.md](./CLAUDE.md)

## 核心功能

### IPC 通信

```typescript
// 渲染进程调用主进程
const version = await window.electronAPI.app.getVersion();
```

### 数据存储

```typescript
// 保存数据
await window.electronAPI.store.set('key', value);

// 读取数据
const value = await window.electronAPI.store.get('key');
```

### 主题切换

```typescript
// 切换主题
import { useTheme } from './composables/useTheme';
const { setTheme } = useTheme();
setTheme('dark'); // 'light' | 'dark' | 'system'
```

### 多窗口管理

```typescript
// 创建子窗口
await window.electronAPI.window.create({
  name: '设置',
  title: '应用设置',
  width: 400,
  height: 300,
});
```

## 文档

- [Electron 文档](https://www.electronjs.org/docs)
- [Vue 3 文档](https://vuejs.org/guide/introduction.html)
- [Electron Forge 文档](https://www.electronforge.io/)
- [Vite 文档](https://vitejs.dev/)

## 许可证

MIT License
