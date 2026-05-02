import { crashReporter, app } from 'electron';
import { join } from 'path';

export function setupCrashReporter(): void {
  // 配置崩溃报告
  crashReporter.start({
    productName: 'Electron Vue App',
    companyName: 'Your Company',
    submitURL: '', // 设置崩溃报告上传 URL（可选）
    uploadToServer: false, // 是否上传到服务器
    crashesDirectory: join(app.getPath('userData'), 'crashes'),
  });

  console.log('崩溃报告已初始化');
  console.log(`崩溃日志路径: ${join(app.getPath('userData'), 'crashes')}`);
}

export function getCrashReports(): string[] {
  // 获取崩溃报告列表（需要自行实现读取逻辑）
  return [];
}
