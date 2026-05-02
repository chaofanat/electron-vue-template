import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/constants';
import type { ElectronAPI, CreateWindowOptions, UpdateInfo, UpdateProgress } from '../shared/types';

const electronAPI: ElectronAPI = {
  app: {
    getVersion: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_VERSION),
    getName: () => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_NAME),
    getPath: (name: string) => ipcRenderer.invoke(IPC_CHANNELS.APP_GET_PATH, name),
  },
  window: {
    minimize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CLOSE),
    isMaximized: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_IS_MAXIMIZED),
    create: (options: CreateWindowOptions) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_CREATE, options),
    destroy: (windowId: number) => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_DESTROY, windowId),
    list: () => ipcRenderer.invoke(IPC_CHANNELS.WINDOW_LIST),
  },
  store: {
    get: <T = unknown>(key: string) => ipcRenderer.invoke(IPC_CHANNELS.STORE_GET, key) as Promise<T | undefined>,
    set: (key: string, value: unknown) => ipcRenderer.invoke(IPC_CHANNELS.STORE_SET, key, value),
    delete: (key: string) => ipcRenderer.invoke(IPC_CHANNELS.STORE_DELETE, key),
  },
  log: {
    info: (message: string) => ipcRenderer.invoke(IPC_CHANNELS.LOG_INFO, message),
    warn: (message: string) => ipcRenderer.invoke(IPC_CHANNELS.LOG_WARN, message),
    error: (message: string) => ipcRenderer.invoke(IPC_CHANNELS.LOG_ERROR, message),
  },
  updater: {
    check: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATER_CHECK),
    download: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATER_DOWNLOAD),
    install: () => ipcRenderer.invoke(IPC_CHANNELS.UPDATER_INSTALL),
    onUpdateAvailable: (callback: (info: UpdateInfo) => void) => {
      const handler = (_: unknown, info: UpdateInfo) => callback(info);
      ipcRenderer.on(IPC_CHANNELS.UPDATER_UPDATE_AVAILABLE, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATER_UPDATE_AVAILABLE, handler);
    },
    onUpdateProgress: (callback: (progress: UpdateProgress) => void) => {
      const handler = (_: unknown, progress: UpdateProgress) => callback(progress);
      ipcRenderer.on(IPC_CHANNELS.UPDATER_UPDATE_PROGRESS, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATER_UPDATE_PROGRESS, handler);
    },
    onUpdateDownloaded: (callback: (info: UpdateInfo) => void) => {
      const handler = (_: unknown, info: UpdateInfo) => callback(info);
      ipcRenderer.on(IPC_CHANNELS.UPDATER_UPDATE_DOWNLOADED, handler);
      return () => ipcRenderer.removeListener(IPC_CHANNELS.UPDATER_UPDATE_DOWNLOADED, handler);
    },
  },
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);
