import { BrowserWindow, shell } from 'electron';
import { join } from 'path';
import { WINDOW_DEFAULTS } from '../../shared/constants';
import type { Store } from 'electron-store';
import type { Logger } from 'electron-log';

export class MainWindow {
  private window: BrowserWindow;
  private store: Store;
  private logger: Logger;

  constructor(store: Store, logger: Logger) {
    this.store = store;
    this.logger = logger;

    // 从存储中恢复窗口位置和大小
    const bounds = this.store.get('window.bounds') as { x?: number; y?: number; width?: number; height?: number } | undefined;
    const isMaximized = this.store.get('window.maximized') as boolean | undefined;

    this.window = new BrowserWindow({
      width: bounds?.width || WINDOW_DEFAULTS.MAIN.width,
      height: bounds?.height || WINDOW_DEFAULTS.MAIN.height,
      x: bounds?.x,
      y: bounds?.y,
      minWidth: WINDOW_DEFAULTS.MAIN.minWidth,
      minHeight: WINDOW_DEFAULTS.MAIN.minHeight,
      show: false,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        contextIsolation: true,
        nodeIntegration: false,
        sandbox: false,
      },
    });

    // 窗口准备好后显示
    this.window.once('ready-to-show', () => {
      this.window.show();
      if (isMaximized) {
        this.window.maximize();
      }
    });

    // 保存窗口位置和大小
    this.window.on('resize', () => this.saveBounds());
    this.window.on('move', () => this.saveBounds());
    this.window.on('maximize', () => this.store.set('window.maximized', true));
    this.window.on('unmaximize', () => this.store.set('window.maximized', false));

    // 在外部链接中打开
    this.window.webContents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url);
      return { action: 'deny' };
    });

    // 加载应用
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      this.window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      this.window.loadFile(join(__dirname, '../renderer/index.html'));
    }

    this.logger.info('主窗口已创建');
  }

  private saveBounds(): void {
    if (!this.window.isMaximized()) {
      this.store.set('window.bounds', this.window.getBounds());
    }
  }

  getWindow(): BrowserWindow {
    return this.window;
  }

  minimize(): void {
    this.window.minimize();
  }

  maximize(): void {
    if (this.window.isMaximized()) {
      this.window.unmaximize();
    } else {
      this.window.maximize();
    }
  }

  close(): void {
    this.window.close();
  }

  isMaximized(): boolean {
    return this.window.isMaximized();
  }

  focus(): void {
    this.window.focus();
  }

  isVisible(): boolean {
    return this.window.isVisible();
  }

  show(): void {
    this.window.show();
  }

  hide(): void {
    this.window.hide();
  }

  destroy(): void {
    this.window.destroy();
  }
}

// Vite 注入的全局变量
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string;
declare const MAIN_WINDOW_VITE_NAME: string;
