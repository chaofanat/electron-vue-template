import { autoUpdater } from 'electron-updater';
import { BrowserWindow } from 'electron';
import { IPC_CHANNELS } from '../../shared/constants';
import { WindowManager } from '../window/WindowManager';
import type { Store } from 'electron-store';
import type { Logger } from 'electron-log';

let updaterWindow: BrowserWindow | null = null;

export function setupUpdater(windowManager: WindowManager, store: Store, logger: Logger): void {
  // 读取自动更新设置
  const autoUpdateEnabled = store.get('app.settings.autoUpdate') as boolean;

  // 配置自动更新
  autoUpdater.autoDownload = autoUpdateEnabled !== false;
  autoUpdater.autoInstallOnAppQuit = true;

  // 检查更新
  autoUpdater.on('checking-for-update', () => {
    logger.info('正在检查更新...');
    sendToRenderer(IPC_CHANNELS.UPDATER_UPDATE_AVAILABLE, null);
  });

  // 发现新版本
  autoUpdater.on('update-available', (info) => {
    logger.info('发现新版本:', info.version);
    sendToRenderer(IPC_CHANNELS.UPDATER_UPDATE_AVAILABLE, {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  // 没有新版本
  autoUpdater.on('update-not-available', (info) => {
    logger.info('当前已是最新版本:', info.version);
  });

  // 更新错误
  autoUpdater.on('error', (error) => {
    logger.error('更新错误:', error.message);
  });

  // 下载进度
  autoUpdater.on('download-progress', (progress) => {
    logger.info(`下载进度: ${progress.percent.toFixed(2)}%`);
    sendToRenderer(IPC_CHANNELS.UPDATER_UPDATE_PROGRESS, {
      percent: progress.percent,
      bytesPerSecond: progress.bytesPerSecond,
      total: progress.total,
      transferred: progress.transferred,
    });
  });

  // 更新下载完成
  autoUpdater.on('update-downloaded', (info) => {
    logger.info('更新已下载，准备安装:', info.version);
    sendToRenderer(IPC_CHANNELS.UPDATER_UPDATE_DOWNLOADED, {
      version: info.version,
      releaseDate: info.releaseDate,
      releaseNotes: info.releaseNotes,
    });
  });

  logger.info('自动更新系统已初始化');
}

function sendToRenderer(channel: string, data: unknown): void {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, data);
  }
}

export function checkForUpdates(): void {
  autoUpdater.checkForUpdates().catch((err) => {
    console.error('检查更新失败:', err);
  });
}

export function downloadUpdate(): void {
  autoUpdater.downloadUpdate().catch((err) => {
    console.error('下载更新失败:', err);
  });
}

export function installUpdate(): void {
  autoUpdater.quitAndInstall();
}
