import { app } from 'electron';
import path from 'path';
import { execSync } from 'child_process';

function runSquirrelCommand(args: string[]): boolean {
  try {
    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    execSync(`"${updateDotExe}" ${args.join(' ')}`);
    return true;
  } catch (error) {
    return false;
  }
}

export function handleSquirrelEvent(): boolean {
  if (process.argv.length === 1) {
    return false;
  }

  const squirrelEvent = process.argv[1];

  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // 创建桌面快捷方式和开始菜单
      runSquirrelCommand(['--createShortcut', path.basename(process.execPath)]);
      app.quit();
      return true;

    case '--squirrel-uninstall':
      // 移除桌面快捷方式和开始菜单
      runSquirrelCommand(['--removeShortcut', path.basename(process.execPath)]);
      app.quit();
      return true;

    case '--squirrel-obsolete':
      app.quit();
      return true;

    default:
      return false;
  }
}
