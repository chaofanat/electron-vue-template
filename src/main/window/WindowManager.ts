import { BrowserWindow } from 'electron';
import { MainWindow } from './MainWindow';
import type { CreateWindowOptions, WindowInfo } from '../../shared/types';
import type { Store } from 'electron-store';
import type { Logger } from 'electron-log';
import { join } from 'path';
import { WINDOW_DEFAULTS } from '../../shared/constants';

export class WindowManager {
  private mainWindow: MainWindow | null = null;
  private childWindows: Map<number, BrowserWindow> = new Map();
  private store: Store;
  private logger: Logger;

  constructor(store: Store, logger: Logger) {
    this.store = store;
    this.logger = logger;
  }

  createMainWindow(): MainWindow {
    if (this.mainWindow) {
      this.mainWindow.focus();
      return this.mainWindow;
    }

    this.mainWindow = new MainWindow(this.store, this.logger);
    this.mainWindow.getWindow().on('closed', () => {
      this.mainWindow = null;
    });

    return this.mainWindow;
  }

  getMainWindow(): MainWindow | null {
    return this.mainWindow;
  }

  createChildWindow(options: CreateWindowOptions): BrowserWindow {
    const parentWindow = options.parent
      ? BrowserWindow.fromId(options.parent)
      : this.mainWindow?.getWindow();

    const window = new BrowserWindow({
      width: options.width || WINDOW_DEFAULTS.CHILD.width,
      height: options.height || WINDOW_DEFAULTS.CHILD.height,
      title: options.title || options.name,
      parent: parentWindow,
      modal: options.modal || false,
      show: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    window.once('ready-to-show', () => {
      window.show();
    });

    // 加载子窗口内容
    if (options.url) {
      if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        window.loadURL(`${MAIN_WINDOW_VITE_DEV_SERVER_URL}#${options.url}`);
      } else {
        window.loadFile(join(__dirname, '../renderer/index.html'), { hash: options.url });
      }
    }

    window.on('closed', () => {
      this.childWindows.delete(window.id);
    });

    this.childWindows.set(window.id, window);
    this.logger.info(`子窗口已创建: ${options.name} (ID: ${window.id})`);

    return window;
  }

  destroyChildWindow(windowId: number): boolean {
    const window = this.childWindows.get(windowId);
    if (window) {
      window.destroy();
      this.childWindows.delete(windowId);
      return true;
    }
    return false;
  }

  getWindowList(): WindowInfo[] {
    const windows: WindowInfo[] = [];

    if (this.mainWindow) {
      const win = this.mainWindow.getWindow();
      windows.push({
        id: win.id,
        name: 'main',
        title: win.getTitle(),
        isVisible: win.isVisible(),
      });
    }

    this.childWindows.forEach((win, id) => {
      windows.push({
        id,
        name: win.getTitle(),
        title: win.getTitle(),
        isVisible: win.isVisible(),
      });
    });

    return windows;
  }

  getMainWindowId(): number | undefined {
    return this.mainWindow?.getWindow().id;
  }
}

declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
