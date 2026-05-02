import Store from 'electron-store';
import { app } from 'electron';

// 定义存储 schema
interface StoreSchema {
  window: {
    bounds?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
    maximized: boolean;
  };
  user: {
    preferences: {
      theme: 'light' | 'dark' | 'system';
      language: string;
      startupBehavior: 'restore' | 'default';
    };
  };
  app: {
    settings: {
      autoUpdate: boolean;
      minimizeToTray: boolean;
      closeToTray: boolean;
    };
  };
}

const defaults: StoreSchema = {
  window: {
    maximized: false,
  },
  user: {
    preferences: {
      theme: 'system',
      language: 'zh-CN',
      startupBehavior: 'restore',
    },
  },
  app: {
    settings: {
      autoUpdate: true,
      minimizeToTray: true,
      closeToTray: true,
    },
  },
};

export function setupStore(): Store<StoreSchema> {
  const store = new Store<StoreSchema>({
    name: 'config',
    cwd: app.getPath('userData'),
    defaults,
    // 加密敏感数据（可选）
    // encryptionKey: 'your-encryption-key',
  });

  console.log('数据存储已初始化');
  console.log(`存储路径: store.path`);

  return store;
}

export type { StoreSchema };
