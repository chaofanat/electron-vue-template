import { crashReporter } from 'electron';

export function setupCrashReporter(): void {
  crashReporter.start({
    productName: 'Electron Vue App',
    submitURL: '',
    uploadToServer: false,
  });

  console.log('崩溃报告已初始化');
}

export function getCrashReports(): string[] {
  // 获取崩溃报告列表（需要自行实现读取逻辑）
  return [];
}
