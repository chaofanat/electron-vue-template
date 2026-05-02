<template>
  <div class="home">
    <div class="welcome-section">
      <h1>欢迎使用 Electron Vue App</h1>
      <p class="subtitle">基于 Electron + Vue 3 + TypeScript 的最佳实践模板</p>
    </div>

    <div class="features-grid">
      <div class="feature-card" @click="testIPC">
        <div class="feature-icon">📡</div>
        <h3>IPC 通信</h3>
        <p>测试主进程与渲染进程的双向通信</p>
      </div>

      <div class="feature-card" @click="testStore">
        <div class="feature-icon">💾</div>
        <h3>数据存储</h3>
        <p>测试持久化数据存储功能</p>
      </div>

      <div class="feature-card" @click="testWindow">
        <div class="feature-icon">🪟</div>
        <h3>多窗口</h3>
        <p>创建和管理多个窗口</p>
      </div>

      <div class="feature-card" @click="testLog">
        <div class="feature-icon">📝</div>
        <h3>日志系统</h3>
        <p>查看日志记录功能</p>
      </div>

      <div class="feature-card" @click="checkUpdate">
        <div class="feature-icon">🔄</div>
        <h3>自动更新</h3>
        <p>检查应用更新</p>
      </div>

      <div class="feature-card" @click="goToSettings">
        <div class="feature-icon">⚙️</div>
        <h3>设置</h3>
        <p>应用设置和偏好</p>
      </div>
    </div>

    <div class="info-section" v-if="appInfo">
      <h2>应用信息</h2>
      <div class="info-grid">
        <div class="info-item">
          <span class="label">应用名称:</span>
          <span class="value">{{ appInfo.name }}</span>
        </div>
        <div class="info-item">
          <span class="label">版本:</span>
          <span class="value">{{ appInfo.version }}</span>
        </div>
        <div class="info-item">
          <span class="label">用户数据:</span>
          <span class="value">{{ appInfo.userDataPath }}</span>
        </div>
      </div>
    </div>

    <div class="message-box" v-if="message">
      <p>{{ message }}</p>
      <button @click="message = ''">关闭</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from '../composables/useTheme';

const router = useRouter();
const message = ref('');
const { loadTheme } = useTheme();

const appInfo = ref<{
  name: string;
  version: string;
  userDataPath: string;
} | null>(null);

onMounted(async () => {
  // 加载主题
  loadTheme();

  if (window.electronAPI) {
    const name = await window.electronAPI.app.getName();
    const version = await window.electronAPI.app.getVersion();
    const userDataPath = await window.electronAPI.app.getPath('userData');
    appInfo.value = { name, version, userDataPath };
  }
});

const testIPC = async () => {
  if (window.electronAPI) {
    const version = await window.electronAPI.app.getVersion();
    message.value = `IPC 测试成功！应用版本: ${version}`;
  } else {
    message.value = '当前环境不支持 IPC 通信';
  }
};

const testStore = async () => {
  if (window.electronAPI) {
    await window.electronAPI.store.set('test-key', 'test-value');
    const value = await window.electronAPI.store.get('test-key');
    message.value = `存储测试成功！读取到值: ${value}`;
  } else {
    message.value = '当前环境不支持数据存储';
  }
};

const testWindow = async () => {
  if (window.electronAPI) {
    await window.electronAPI.window.create({
      name: '子窗口',
      title: '测试子窗口',
      width: 400,
      height: 300,
    });
    message.value = '子窗口已创建';
  } else {
    message.value = '当前环境不支持多窗口';
  }
};

const testLog = async () => {
  if (window.electronAPI) {
    await window.electronAPI.log.info('这是一条测试日志信息');
    await window.electronAPI.log.warn('这是一条警告日志');
    await window.electronAPI.log.error('这是一条错误日志');
    message.value = '日志已记录，请查看日志文件';
  } else {
    message.value = '当前环境不支持日志功能';
  }
};

const checkUpdate = async () => {
  if (window.electronAPI) {
    await window.electronAPI.updater.check();
    message.value = '正在检查更新...';
  } else {
    message.value = '当前环境不支持自动更新';
  }
};

const goToSettings = () => {
  router.push('/settings');
};
</script>

<style scoped>
.home {
  padding: 24px;
  max-width: 1200px;
  margin: 0 auto;
  background-color: var(--bg-color);
  min-height: 100vh;
}

.welcome-section {
  text-align: center;
  margin-bottom: 40px;
}

.welcome-section h1 {
  font-size: 32px;
  color: var(--text-color);
  margin-bottom: 8px;
}

.subtitle {
  font-size: 16px;
  color: var(--text-color-secondary);
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 40px;
}

.feature-card {
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 20px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px var(--card-shadow);
  border-color: var(--primary-color);
}

.feature-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.feature-card h3 {
  margin: 0 0 8px 0;
  font-size: 16px;
  color: var(--text-color);
}

.feature-card p {
  margin: 0;
  font-size: 14px;
  color: var(--text-color-secondary);
}

.info-section {
  background: var(--bg-color-secondary);
  border-radius: 8px;
  padding: 24px;
}

.info-section h2 {
  margin: 0 0 16px 0;
  font-size: 20px;
  color: var(--text-color);
}

.info-grid {
  display: grid;
  gap: 12px;
}

.info-item {
  display: flex;
  gap: 12px;
}

.label {
  font-weight: 500;
  color: var(--text-color-secondary);
  min-width: 100px;
}

.value {
  color: var(--text-color);
  word-break: break-all;
}

.message-box {
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: var(--card-bg);
  color: var(--text-color);
  padding: 16px 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px var(--card-shadow);
  z-index: 1000;
  border: 1px solid var(--border-color);
}

.message-box p {
  margin: 0 0 12px 0;
}

.message-box button {
  background: var(--primary-color);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style>
