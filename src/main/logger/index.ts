import log from 'electron-log';
import { app } from 'electron';
import { join } from 'path';

export function setupLogger(): typeof log {
  // 配置日志文件路径
  log.transports.file.resolvePathFn = () => {
    return join(app.getPath('userData'), 'logs', 'main.log');
  };

  // 配置日志级别
  log.transports.file.level = 'info';
  log.transports.console.level = 'debug';

  // 配置日志格式
  log.transports.file.format = '[{y}-{m}-{d} {h}:{i}:{s}.{ms}] [{level}] {text}';
  log.transports.console.format = '[{h}:{i}:{s}.{ms}] [{level}] {text}';

  // 配置日志文件大小限制 (10MB)
  log.transports.file.maxSize = 10 * 1024 * 1024;

  // 配置日志文件保留数量
  log.transports.file.maxArchiveFiles = 5;

  log.info('日志系统已初始化');
  log.info(`应用版本: ${app.getVersion()}`);
  log.info(`日志路径: ${log.transports.file.getFile().path}`);

  return log;
}

export type Logger = typeof log;
