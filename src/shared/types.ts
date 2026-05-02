// IPC 通信类型定义

export interface IPCChannels {
  // 应用信息
  'app:getVersion': () => string;
  'app:getName': () => string;
  'app:getPath': (name: string) => string;

  // 窗口操作
  'window:minimize': () => void;
  'window:maximize': () => void;
  'window:close': () => void;
  'window:isMaximized': () => boolean;

  // 数据存储
  'store:get': (key: string) => unknown;
  'store:set': (key: string, value: unknown) => void;
  'store:delete': (key: string) => void;

  // 日志
  'log:info': (message: string) => void;
  'log:warn': (message: string) => void;
  'log:error': (message: string) => void;

  // 更新
  'updater:check': () => void;
  'updater:download': () => void;
  'updater:install': () => void;

  // 多窗口
  'window:create': (options: CreateWindowOptions) => void;
  'window:destroy': (windowId: number) => void;
  'window:list': () => WindowInfo[];
}

export interface CreateWindowOptions {
  name: string;
  url?: string;
  width?: number;
  height?: number;
  title?: string;
  modal?: boolean;
  parent?: number;
}

export interface WindowInfo {
  id: number;
  name: string;
  title: string;
  isVisible: boolean;
}

export interface UpdateInfo {
  version: string;
  releaseDate: string;
  releaseNotes?: string;
}

export interface UpdateProgress {
  percent: number;
  bytesPerSecond: number;
  total: number;
  transferred: number;
}

// 预加载脚本暴露的 API 类型
export interface ElectronAPI {
  app: {
    getVersion: () => Promise<string>;
    getName: () => Promise<string>;
    getPath: (name: string) => Promise<string>;
  };
  window: {
    minimize: () => Promise<void>;
    maximize: () => Promise<void>;
    close: () => Promise<void>;
    isMaximized: () => Promise<boolean>;
    create: (options: CreateWindowOptions) => Promise<void>;
    destroy: (windowId: number) => Promise<void>;
    list: () => Promise<WindowInfo[]>;
  };
  store: {
    get: <T = unknown>(key: string) => Promise<T | undefined>;
    set: (key: string, value: unknown) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  log: {
    info: (message: string) => Promise<void>;
    warn: (message: string) => Promise<void>;
    error: (message: string) => Promise<void>;
  };
  updater: {
    check: () => Promise<void>;
    download: () => Promise<void>;
    install: () => Promise<void>;
    onUpdateAvailable: (callback: (info: UpdateInfo) => void) => () => void;
    onUpdateProgress: (callback: (progress: UpdateProgress) => void) => () => void;
    onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => () => void;
  };
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
