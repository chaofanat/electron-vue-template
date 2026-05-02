import { Tray, Menu, nativeImage, app } from 'electron';
import { join } from 'path';
import { WindowManager } from '../window/WindowManager';
import type { Logger } from 'electron-log';

let tray: Tray | null = null;

export function setupTray(windowManager: WindowManager, logger: Logger): void {
  // 创建托盘图标
  const iconPath = join(__dirname, '../../resources/tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);

  tray = new Tray(icon);
  tray.setToolTip('Electron Vue App');

  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        const mainWindow = windowManager.getMainWindow();
        if (mainWindow) {
          mainWindow.show();
          mainWindow.focus();
        }
      },
    },
    { type: 'separator' },
    {
      label: '关于',
      click: () => {
        // 可以打开关于窗口
        logger.info('用户点击关于');
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      },
    },
  ]);

  tray.setContextMenu(contextMenu);

  // 双击托盘图标显示主窗口
  tray.on('double-click', () => {
    const mainWindow = windowManager.getMainWindow();
    if (mainWindow) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  logger.info('系统托盘已初始化');
}

export function destroyTray(): void {
  if (tray) {
    tray.destroy();
    tray = null;
  }
}
